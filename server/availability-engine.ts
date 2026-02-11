/**
 * Availability Engine
 *
 * Handles system-wide availability logic:
 * 1. Master calendar (operating hours, blocked dates)
 * 2. Contractor availability aggregation
 * 3. Date availability calculation for quote pages
 */

import { db } from "./db";
import {
  masterAvailability,
  masterBlockedDates,
  handymanAvailability,
  contractorAvailabilityDates,
  handymanProfiles,
  handymanSkills,
  contractorJobs,
} from "../shared/schema";
import { eq, and, gte, lte, inArray, sql, or, isNull } from "drizzle-orm";
import { addDays, format, startOfDay, getDay, parse, isWeekend } from "date-fns";

// ============================================================================
// TYPES
// ============================================================================

export interface DateAvailability {
  date: string; // "YYYY-MM-DD"
  isAvailable: boolean;
  reason?: "master_blocked" | "day_inactive" | "no_contractors" | "available";
  slots: ("am" | "pm" | "full")[];
  contractorCount?: number;
  isWeekend?: boolean;
}

export interface AvailabilityQuery {
  days?: number; // How many days to check (default 28)
  postcode?: string; // For contractor matching
  serviceIds?: string[]; // SKUs needed for the job
  startDate?: Date; // Start date (default today)
}

export interface ContractorSlot {
  contractorId: string;
  contractorName?: string;
  date: string;
  slots: ("am" | "pm" | "full")[];
}

// ============================================================================
// MASTER CALENDAR FUNCTIONS
// ============================================================================

/**
 * Get master availability pattern for a specific day of week
 */
export async function getMasterDayAvailability(dayOfWeek: number) {
  const result = await db
    .select()
    .from(masterAvailability)
    .where(eq(masterAvailability.dayOfWeek, dayOfWeek))
    .limit(1);

  return result[0] || null;
}

/**
 * Get all master blocked dates within a range
 */
export async function getMasterBlockedDates(startDate: Date, endDate: Date) {
  const result = await db
    .select()
    .from(masterBlockedDates)
    .where(
      and(
        gte(masterBlockedDates.date, startDate),
        lte(masterBlockedDates.date, endDate)
      )
    );

  return result;
}

/**
 * Check if a specific date is blocked at the master level
 */
export async function isMasterBlocked(date: Date): Promise<{ blocked: boolean; reason?: string; blockedSlots?: string[] | null }> {
  const dateStart = startOfDay(date);
  const dateEnd = addDays(dateStart, 1);

  const blocks = await db
    .select()
    .from(masterBlockedDates)
    .where(
      and(
        gte(masterBlockedDates.date, dateStart),
        lte(masterBlockedDates.date, dateEnd)
      )
    )
    .limit(1);

  if (blocks.length > 0) {
    return {
      blocked: true,
      reason: blocks[0].reason || "Blocked",
      blockedSlots: blocks[0].blockedSlots as string[] | null,
    };
  }

  return { blocked: false };
}

/**
 * Check if master calendar allows a day based on weekly pattern
 */
export async function isMasterDayActive(date: Date): Promise<boolean> {
  const dayOfWeek = getDay(date); // 0-6

  const dayConfig = await getMasterDayAvailability(dayOfWeek);

  // If no config exists, default to active on weekdays
  if (!dayConfig) {
    return dayOfWeek >= 1 && dayOfWeek <= 5; // Mon-Fri default
  }

  return dayConfig.isActive;
}

// ============================================================================
// CONTRACTOR AVAILABILITY FUNCTIONS
// ============================================================================

/**
 * Get contractors available on a specific date
 */
export async function getAvailableContractors(
  date: Date,
  options?: {
    postcode?: string;
    serviceIds?: string[];
    radiusMiles?: number;
  }
): Promise<ContractorSlot[]> {
  const dateStr = format(date, "yyyy-MM-dd");
  const dayOfWeek = getDay(date);
  const dateStart = startOfDay(date);
  const dateEnd = addDays(dateStart, 1);

  // Get all active contractors
  let contractorQuery = db
    .select({
      id: handymanProfiles.id,
      userId: handymanProfiles.userId,
      businessName: handymanProfiles.businessName,
      postcode: handymanProfiles.postcode,
      radiusMiles: handymanProfiles.radiusMiles,
      availabilityStatus: handymanProfiles.availabilityStatus,
    })
    .from(handymanProfiles)
    .where(
      or(
        eq(handymanProfiles.availabilityStatus, "available"),
        isNull(handymanProfiles.availabilityStatus)
      )
    );

  const contractors = await contractorQuery;

  // Filter by skills if serviceIds provided
  let filteredContractors = contractors;
  if (options?.serviceIds && options.serviceIds.length > 0) {
    const contractorsWithSkills = await db
      .select({ handymanId: handymanSkills.handymanId })
      .from(handymanSkills)
      .where(
        and(
          inArray(handymanSkills.handymanId, contractors.map((c) => c.id)),
          inArray(handymanSkills.serviceId, options.serviceIds)
        )
      );

    const skillContractorIds = new Set(contractorsWithSkills.map((c) => c.handymanId));
    filteredContractors = contractors.filter((c) => skillContractorIds.has(c.id));
  }

  const availableSlots: ContractorSlot[] = [];

  for (const contractor of filteredContractors) {
    // Check for date-specific override
    const dateOverride = await db
      .select()
      .from(contractorAvailabilityDates)
      .where(
        and(
          eq(contractorAvailabilityDates.contractorId, contractor.id),
          gte(contractorAvailabilityDates.date, dateStart),
          lte(contractorAvailabilityDates.date, dateEnd)
        )
      )
      .limit(1);

    if (dateOverride.length > 0) {
      // Use date-specific override
      if (dateOverride[0].isAvailable) {
        const slots = determineSlots(
          dateOverride[0].startTime || "09:00",
          dateOverride[0].endTime || "17:00"
        );
        availableSlots.push({
          contractorId: contractor.id,
          contractorName: contractor.businessName || undefined,
          date: dateStr,
          slots,
        });
      }
      // If not available, skip this contractor
      continue;
    }

    // Check weekly pattern
    const weeklyPattern = await db
      .select()
      .from(handymanAvailability)
      .where(
        and(
          eq(handymanAvailability.handymanId, contractor.id),
          eq(handymanAvailability.dayOfWeek, dayOfWeek),
          eq(handymanAvailability.isActive, true)
        )
      )
      .limit(1);

    if (weeklyPattern.length > 0) {
      const slots = determineSlots(
        weeklyPattern[0].startTime || "09:00",
        weeklyPattern[0].endTime || "17:00"
      );
      availableSlots.push({
        contractorId: contractor.id,
        contractorName: contractor.businessName || undefined,
        date: dateStr,
        slots,
      });
    }
  }

  // Filter out contractors with jobs already booked on that date
  const bookedJobs = await db
    .select({
      contractorId: contractorJobs.contractorId,
      scheduledTime: contractorJobs.scheduledTime,
    })
    .from(contractorJobs)
    .where(
      and(
        gte(contractorJobs.scheduledDate, dateStart),
        lte(contractorJobs.scheduledDate, dateEnd),
        inArray(contractorJobs.status, ["pending", "accepted", "in_progress"])
      )
    );

  // Remove booked slots from available contractors
  const bookedByContractor = new Map<string, Set<string>>();
  for (const job of bookedJobs) {
    if (!bookedByContractor.has(job.contractorId)) {
      bookedByContractor.set(job.contractorId, new Set());
    }
    // Assume a job blocks at least the time slot it's in
    if (job.scheduledTime) {
      const hour = parseInt(job.scheduledTime.split(":")[0]);
      if (hour < 12) {
        bookedByContractor.get(job.contractorId)!.add("am");
      } else {
        bookedByContractor.get(job.contractorId)!.add("pm");
      }
    } else {
      // No specific time = blocks full day
      bookedByContractor.get(job.contractorId)!.add("full");
    }
  }

  // Filter available slots based on bookings
  return availableSlots
    .map((slot) => {
      const bookedSlots = bookedByContractor.get(slot.contractorId);
      if (!bookedSlots) return slot;

      if (bookedSlots.has("full")) {
        return { ...slot, slots: [] as ("am" | "pm" | "full")[] };
      }

      const filteredSlots = slot.slots.filter((s) => {
        if (s === "full") {
          return !bookedSlots.has("am") && !bookedSlots.has("pm");
        }
        return !bookedSlots.has(s);
      });

      return { ...slot, slots: filteredSlots };
    })
    .filter((slot) => slot.slots.length > 0);
}

/**
 * Determine time slots based on start/end times
 */
function determineSlots(startTime: string, endTime: string): ("am" | "pm" | "full")[] {
  const startHour = parseInt(startTime.split(":")[0]);
  const endHour = parseInt(endTime.split(":")[0]);

  // Full day: starts before noon and ends after noon
  if (startHour < 12 && endHour > 12) {
    return ["full", "am", "pm"];
  }

  // AM only: starts before noon, ends around noon
  if (startHour < 12 && endHour <= 13) {
    return ["am"];
  }

  // PM only: starts at or after noon
  if (startHour >= 12) {
    return ["pm"];
  }

  return ["full", "am", "pm"];
}

// ============================================================================
// SYSTEM AVAILABILITY (COMBINED)
// ============================================================================

/**
 * Get system-wide availability for a date range
 * This is the main function called by the public API
 */
export async function getSystemAvailability(query: AvailabilityQuery): Promise<DateAvailability[]> {
  const days = query.days || 28;
  const startDate = query.startDate || new Date();
  const results: DateAvailability[] = [];

  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const dateStr = format(date, "yyyy-MM-dd");

    // 1. Check if master day is active (weekly pattern)
    const dayActive = await isMasterDayActive(date);
    if (!dayActive) {
      results.push({
        date: dateStr,
        isAvailable: false,
        reason: "day_inactive",
        slots: [],
        isWeekend: isWeekend(date),
      });
      continue;
    }

    // 2. Check if date is blocked at master level
    const blockCheck = await isMasterBlocked(date);
    if (blockCheck.blocked && !blockCheck.blockedSlots) {
      // Whole day blocked
      results.push({
        date: dateStr,
        isAvailable: false,
        reason: "master_blocked",
        slots: [],
        isWeekend: isWeekend(date),
      });
      continue;
    }

    // 3. Get available contractors for this date
    const contractors = await getAvailableContractors(date, {
      postcode: query.postcode,
      serviceIds: query.serviceIds,
    });

    if (contractors.length === 0) {
      results.push({
        date: dateStr,
        isAvailable: false,
        reason: "no_contractors",
        slots: [],
        contractorCount: 0,
        isWeekend: isWeekend(date),
      });
      continue;
    }

    // Aggregate available slots across all contractors
    const allSlots = new Set<"am" | "pm" | "full">();
    for (const contractor of contractors) {
      for (const slot of contractor.slots) {
        allSlots.add(slot);
      }
    }

    // Filter out blocked slots if partial block
    let availableSlots = Array.from(allSlots);
    if (blockCheck.blockedSlots) {
      availableSlots = availableSlots.filter(
        (s) => !blockCheck.blockedSlots!.includes(s)
      );
    }

    results.push({
      date: dateStr,
      isAvailable: availableSlots.length > 0,
      reason: availableSlots.length > 0 ? "available" : "master_blocked",
      slots: availableSlots,
      contractorCount: contractors.length,
      isWeekend: isWeekend(date),
    });
  }

  return results;
}

// ============================================================================
// ADMIN CALENDAR DATA
// ============================================================================

/**
 * Get calendar data for admin view with booking counts
 */
export async function getAdminCalendarData(month: string, days?: number): Promise<{
  dates: {
    date: string;
    masterBlocked: boolean;
    masterBlockedReason?: string;
    dayActive: boolean;
    contractorCount: number;
    bookingCount: number;
    slots: { am: number; pm: number };
  }[];
}> {
  // Parse month (e.g., "2025-02")
  const [year, monthNum] = month.split("-").map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const numDays = days || new Date(year, monthNum, 0).getDate();

  const results = [];

  for (let i = 0; i < numDays; i++) {
    const date = addDays(startDate, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dateStart = startOfDay(date);
    const dateEnd = addDays(dateStart, 1);

    // Check master block
    const blockCheck = await isMasterBlocked(date);

    // Check day active
    const dayActive = await isMasterDayActive(date);

    // Get contractor availability
    const contractors = await getAvailableContractors(date);

    // Count slots
    let amCount = 0;
    let pmCount = 0;
    for (const contractor of contractors) {
      if (contractor.slots.includes("am") || contractor.slots.includes("full")) {
        amCount++;
      }
      if (contractor.slots.includes("pm") || contractor.slots.includes("full")) {
        pmCount++;
      }
    }

    // Count bookings
    const bookings = await db
      .select({ id: contractorJobs.id })
      .from(contractorJobs)
      .where(
        and(
          gte(contractorJobs.scheduledDate, dateStart),
          lte(contractorJobs.scheduledDate, dateEnd)
        )
      );

    results.push({
      date: dateStr,
      masterBlocked: blockCheck.blocked && !blockCheck.blockedSlots,
      masterBlockedReason: blockCheck.reason,
      dayActive,
      contractorCount: contractors.length,
      bookingCount: bookings.length,
      slots: { am: amCount, pm: pmCount },
    });
  }

  return { dates: results };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Initialize default master availability (Mon-Fri 9-5)
 */
export async function initializeMasterAvailability() {
  const existing = await db.select().from(masterAvailability).limit(1);
  if (existing.length > 0) {
    return; // Already initialized
  }

  const defaultDays = [
    { dayOfWeek: 0, isActive: false }, // Sunday
    { dayOfWeek: 1, isActive: true, startTime: "09:00", endTime: "17:00" }, // Monday
    { dayOfWeek: 2, isActive: true, startTime: "09:00", endTime: "17:00" }, // Tuesday
    { dayOfWeek: 3, isActive: true, startTime: "09:00", endTime: "17:00" }, // Wednesday
    { dayOfWeek: 4, isActive: true, startTime: "09:00", endTime: "17:00" }, // Thursday
    { dayOfWeek: 5, isActive: true, startTime: "09:00", endTime: "17:00" }, // Friday
    { dayOfWeek: 6, isActive: false }, // Saturday
  ];

  for (const day of defaultDays) {
    await db.insert(masterAvailability).values({
      id: `master-day-${day.dayOfWeek}`,
      ...day,
    });
  }

  console.log("[AVAILABILITY] Initialized default master availability (Mon-Fri 9-5)");
}
