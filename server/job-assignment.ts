/**
 * Job Assignment Engine
 *
 * Handles automatic contractor assignment when a customer books:
 * 1. Finds available contractors based on date, skills, and location
 * 2. Ranks contractors by suitability (job count, proximity)
 * 3. Assigns job to best-matching contractor
 * 4. Blocks contractor's availability slot
 */

import { db } from "./db";
import {
  handymanProfiles,
  handymanSkills,
  handymanAvailability,
  contractorAvailabilityDates,
  contractorJobs,
  personalizedQuotes,
} from "../shared/schema";
import { eq, and, gte, lte, inArray, or, isNull, sql } from "drizzle-orm";
import { addDays, startOfDay, getDay, format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { getAvailableContractors } from "./availability-engine";

// ============================================================================
// TYPES
// ============================================================================

export interface AssignmentResult {
  success: boolean;
  jobId?: string;
  contractorId?: string;
  contractorName?: string;
  reason?: string;
}

export interface BookingDetails {
  quoteId: string;
  customerName: string;
  customerPhone: string;
  address?: string;
  postcode?: string;
  jobDescription: string;
  selectedDate: Date;
  timeSlotType: "am" | "pm" | "full" | "exact";
  exactTimeRequested?: string;
  serviceIds?: string[];
  payoutPence?: number;
}

interface ContractorCandidate {
  id: string;
  name?: string;
  postcode?: string;
  jobCountOnDate: number;
  distanceScore: number;
  skillMatch: number;
}

// ============================================================================
// ASSIGNMENT LOGIC
// ============================================================================

/**
 * Assign a contractor to a booking
 * Main entry point for the assignment flow
 */
export async function assignContractor(booking: BookingDetails): Promise<AssignmentResult> {
  try {
    // 1. Get available contractors for the date
    const availableContractors = await getAvailableContractors(booking.selectedDate, {
      postcode: booking.postcode,
      serviceIds: booking.serviceIds,
    });

    if (availableContractors.length === 0) {
      return {
        success: false,
        reason: "no_contractors_available",
      };
    }

    // 2. Filter by time slot
    const slotFilteredContractors = availableContractors.filter((c) => {
      if (booking.timeSlotType === "full") return c.slots.includes("full") || (c.slots.includes("am") && c.slots.includes("pm"));
      if (booking.timeSlotType === "am") return c.slots.includes("am") || c.slots.includes("full");
      if (booking.timeSlotType === "pm") return c.slots.includes("pm") || c.slots.includes("full");
      return c.slots.length > 0; // exact time - any slot works
    });

    if (slotFilteredContractors.length === 0) {
      return {
        success: false,
        reason: "no_contractors_for_slot",
      };
    }

    // 3. Get job counts for ranking
    const dateStart = startOfDay(booking.selectedDate);
    const dateEnd = addDays(dateStart, 1);

    const jobCounts = await db
      .select({
        contractorId: contractorJobs.contractorId,
        count: sql<number>`count(*)::int`,
      })
      .from(contractorJobs)
      .where(
        and(
          inArray(
            contractorJobs.contractorId,
            slotFilteredContractors.map((c) => c.contractorId)
          ),
          gte(contractorJobs.scheduledDate, dateStart),
          lte(contractorJobs.scheduledDate, dateEnd)
        )
      )
      .groupBy(contractorJobs.contractorId);

    const jobCountMap = new Map(jobCounts.map((j) => [j.contractorId, j.count]));

    // 4. Rank contractors
    const rankedContractors: ContractorCandidate[] = slotFilteredContractors.map((c) => ({
      id: c.contractorId,
      name: c.contractorName,
      jobCountOnDate: jobCountMap.get(c.contractorId) || 0,
      distanceScore: 0, // Would calculate from postcode if available
      skillMatch: 1, // Already filtered by skills
    }));

    // Sort by job count (ascending) to distribute work evenly
    rankedContractors.sort((a, b) => a.jobCountOnDate - b.jobCountOnDate);

    const selectedContractor = rankedContractors[0];

    // 5. Create job record
    const jobId = uuidv4();
    const scheduledTime = getScheduledTime(booking.timeSlotType, booking.exactTimeRequested);

    await db.insert(contractorJobs).values({
      id: jobId,
      contractorId: selectedContractor.id,
      quoteId: booking.quoteId,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      address: booking.address || null,
      postcode: booking.postcode || null,
      jobDescription: booking.jobDescription,
      status: "pending",
      scheduledDate: booking.selectedDate,
      scheduledTime: scheduledTime,
      payoutPence: booking.payoutPence || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 6. Block contractor's slot for that date
    await blockContractorSlot(
      selectedContractor.id,
      booking.selectedDate,
      booking.timeSlotType,
      booking.exactTimeRequested
    );

    return {
      success: true,
      jobId,
      contractorId: selectedContractor.id,
      contractorName: selectedContractor.name,
    };
  } catch (error) {
    console.error("[JOB ASSIGNMENT] Error assigning contractor:", error);
    return {
      success: false,
      reason: "assignment_error",
    };
  }
}

/**
 * Block a contractor's availability slot after assignment
 */
async function blockContractorSlot(
  contractorId: string,
  date: Date,
  slotType: "am" | "pm" | "full" | "exact",
  exactTime?: string
): Promise<void> {
  const dateStart = startOfDay(date);
  const dateEnd = addDays(dateStart, 1);

  // Check for existing override
  const existing = await db
    .select()
    .from(contractorAvailabilityDates)
    .where(
      and(
        eq(contractorAvailabilityDates.contractorId, contractorId),
        gte(contractorAvailabilityDates.date, dateStart),
        lte(contractorAvailabilityDates.date, dateEnd)
      )
    )
    .limit(1);

  if (slotType === "full") {
    // Block entire day
    if (existing.length > 0) {
      await db
        .update(contractorAvailabilityDates)
        .set({ isAvailable: false, notes: "Booked (full day)" })
        .where(eq(contractorAvailabilityDates.id, existing[0].id));
    } else {
      await db.insert(contractorAvailabilityDates).values({
        id: uuidv4(),
        contractorId,
        date: dateStart,
        isAvailable: false,
        notes: "Booked (full day)",
      });
    }
  } else {
    // Partial day block - update times
    const newStartTime = slotType === "am" ? "12:00" : "09:00";
    const newEndTime = slotType === "am" ? "17:00" : "12:00";

    if (existing.length > 0) {
      // Check if we need to completely block or just adjust times
      const currentStart = existing[0].startTime || "09:00";
      const currentEnd = existing[0].endTime || "17:00";

      // If booking AM and contractor only has AM, block whole day
      // If booking PM and contractor only has PM, block whole day
      if (
        (slotType === "am" && currentEnd === "12:00") ||
        (slotType === "pm" && currentStart === "12:00")
      ) {
        await db
          .update(contractorAvailabilityDates)
          .set({ isAvailable: false, notes: `Booked (${slotType})` })
          .where(eq(contractorAvailabilityDates.id, existing[0].id));
      } else {
        // Adjust times
        await db
          .update(contractorAvailabilityDates)
          .set({
            startTime: slotType === "am" ? "12:00" : currentStart,
            endTime: slotType === "pm" ? "12:00" : currentEnd,
            notes: `Partial booking (${slotType} booked)`,
          })
          .where(eq(contractorAvailabilityDates.id, existing[0].id));
      }
    } else {
      // Create new override with remaining availability
      await db.insert(contractorAvailabilityDates).values({
        id: uuidv4(),
        contractorId,
        date: dateStart,
        isAvailable: true,
        startTime: newStartTime,
        endTime: newEndTime,
        notes: `Partial availability (${slotType} booked)`,
      });
    }
  }
}

/**
 * Get scheduled time string from slot type
 */
function getScheduledTime(
  slotType: "am" | "pm" | "full" | "exact",
  exactTime?: string
): string {
  if (slotType === "exact" && exactTime) return exactTime;
  if (slotType === "am") return "09:00";
  if (slotType === "pm") return "13:00";
  return "09:00"; // full day defaults to morning start
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Reassign a job to a different contractor
 */
export async function reassignJob(
  jobId: string,
  newContractorId: string
): Promise<AssignmentResult> {
  try {
    const job = await db
      .select()
      .from(contractorJobs)
      .where(eq(contractorJobs.id, jobId))
      .limit(1);

    if (job.length === 0) {
      return { success: false, reason: "job_not_found" };
    }

    const oldContractorId = job[0].contractorId;

    // Update job
    await db
      .update(contractorJobs)
      .set({
        contractorId: newContractorId,
        status: "pending",
        acceptedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(contractorJobs.id, jobId));

    // TODO: Unblock old contractor's slot
    // TODO: Block new contractor's slot

    return {
      success: true,
      jobId,
      contractorId: newContractorId,
    };
  } catch (error) {
    console.error("[JOB ASSIGNMENT] Error reassigning job:", error);
    return { success: false, reason: "reassignment_error" };
  }
}

/**
 * Cancel a job and unblock contractor's slot
 */
export async function cancelJob(jobId: string): Promise<boolean> {
  try {
    const job = await db
      .select()
      .from(contractorJobs)
      .where(eq(contractorJobs.id, jobId))
      .limit(1);

    if (job.length === 0) return false;

    // Update job status
    await db
      .update(contractorJobs)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(contractorJobs.id, jobId));

    // TODO: Unblock contractor's slot

    return true;
  } catch (error) {
    console.error("[JOB ASSIGNMENT] Error cancelling job:", error);
    return false;
  }
}
