/**
 * Availability Routes
 *
 * Endpoints for:
 * - Public availability API (for quote pages)
 * - Admin master calendar management
 * - Contractor availability management
 */

import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import {
  masterAvailability,
  masterBlockedDates,
  handymanAvailability,
  contractorAvailabilityDates,
  contractorJobs,
} from "../../shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import {
  getSystemAvailability,
  getAdminCalendarData,
  initializeMasterAvailability,
  getAvailableContractors,
} from "../availability-engine";
import { addDays, startOfDay, format, parseISO } from "date-fns";

const router = Router();

// ============================================================================
// PUBLIC AVAILABILITY API
// ============================================================================

/**
 * GET /api/public/availability
 * Returns available dates for quote page date pickers
 */
router.get("/public", async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 28;
    const postcode = req.query.postcode as string | undefined;
    const serviceIds = req.query.serviceIds
      ? (req.query.serviceIds as string).split(",")
      : undefined;

    const availability = await getSystemAvailability({
      days,
      postcode,
      serviceIds,
    });

    res.json({ dates: availability });
  } catch (error: any) {
    console.error("[AVAILABILITY] Error fetching public availability:", error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// ============================================================================
// ADMIN MASTER CALENDAR API
// ============================================================================

/**
 * GET /api/availability/admin/calendar
 * Returns calendar data for admin view with contractor counts and booking info
 */
router.get("/admin/calendar", async (req, res) => {
  try {
    const month = req.query.month as string || format(new Date(), "yyyy-MM");
    const days = req.query.days ? parseInt(req.query.days as string) : undefined;

    const data = await getAdminCalendarData(month, days);

    res.json(data);
  } catch (error: any) {
    console.error("[AVAILABILITY] Error fetching admin calendar:", error);
    res.status(500).json({ error: "Failed to fetch calendar data" });
  }
});

/**
 * GET /api/availability/admin/master
 * Returns master availability pattern (weekly)
 */
router.get("/admin/master", async (req, res) => {
  try {
    // Ensure master availability is initialized
    await initializeMasterAvailability();

    const pattern = await db.select().from(masterAvailability).orderBy(masterAvailability.dayOfWeek);

    res.json({ pattern });
  } catch (error: any) {
    console.error("[AVAILABILITY] Error fetching master pattern:", error);
    res.status(500).json({ error: "Failed to fetch master availability" });
  }
});

/**
 * PUT /api/availability/admin/master/:dayOfWeek
 * Update master availability for a specific day
 */
router.put("/admin/master/:dayOfWeek", async (req, res) => {
  try {
    const dayOfWeek = parseInt(req.params.dayOfWeek);
    const { isActive, startTime, endTime } = req.body;

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ error: "Invalid day of week" });
    }

    await db
      .update(masterAvailability)
      .set({
        isActive: isActive ?? undefined,
        startTime: startTime ?? undefined,
        endTime: endTime ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(masterAvailability.dayOfWeek, dayOfWeek));

    res.json({ success: true });
  } catch (error: any) {
    console.error("[AVAILABILITY] Error updating master pattern:", error);
    res.status(500).json({ error: "Failed to update master availability" });
  }
});

/**
 * GET /api/availability/admin/blocked
 * Returns all blocked dates
 */
router.get("/admin/blocked", async (req, res) => {
  try {
    const startDate = req.query.start
      ? parseISO(req.query.start as string)
      : new Date();
    const endDate = req.query.end
      ? parseISO(req.query.end as string)
      : addDays(startDate, 90);

    const blocked = await db
      .select()
      .from(masterBlockedDates)
      .where(
        and(
          gte(masterBlockedDates.date, startDate),
          lte(masterBlockedDates.date, endDate)
        )
      )
      .orderBy(masterBlockedDates.date);

    res.json({ blockedDates: blocked });
  } catch (error: any) {
    console.error("[AVAILABILITY] Error fetching blocked dates:", error);
    res.status(500).json({ error: "Failed to fetch blocked dates" });
  }
});

/**
 * POST /api/availability/admin/blocked
 * Add a new blocked date
 */
router.post("/admin/blocked", async (req, res) => {
  try {
    const { date, reason, blockedSlots, createdBy } = req.body;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const id = uuidv4();
    const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);

    await db.insert(masterBlockedDates).values({
      id,
      date: startOfDay(dateObj),
      reason: reason || null,
      blockedSlots: blockedSlots || null,
      createdBy: createdBy || null,
    });

    res.status(201).json({ id, success: true });
  } catch (error: any) {
    console.error("[AVAILABILITY] Error adding blocked date:", error);
    res.status(500).json({ error: "Failed to add blocked date" });
  }
});

/**
 * DELETE /api/availability/admin/blocked/:id
 * Remove a blocked date
 */
router.delete("/admin/blocked/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.delete(masterBlockedDates).where(eq(masterBlockedDates.id, id));

    res.json({ success: true });
  } catch (error: any) {
    console.error("[AVAILABILITY] Error removing blocked date:", error);
    res.status(500).json({ error: "Failed to remove blocked date" });
  }
});

/**
 * POST /api/availability/admin/blocked/toggle
 * Toggle a date's blocked status (convenience endpoint for calendar UI)
 */
router.post("/admin/blocked/toggle", async (req, res) => {
  try {
    const { date, reason } = req.body;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
    const dateStart = startOfDay(dateObj);
    const dateEnd = addDays(dateStart, 1);

    // Check if already blocked
    const existing = await db
      .select()
      .from(masterBlockedDates)
      .where(
        and(
          gte(masterBlockedDates.date, dateStart),
          lte(masterBlockedDates.date, dateEnd)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Unblock
      await db.delete(masterBlockedDates).where(eq(masterBlockedDates.id, existing[0].id));
      res.json({ blocked: false, action: "unblocked" });
    } else {
      // Block
      const id = uuidv4();
      await db.insert(masterBlockedDates).values({
        id,
        date: dateStart,
        reason: reason || null,
      });
      res.json({ blocked: true, action: "blocked", id });
    }
  } catch (error: any) {
    console.error("[AVAILABILITY] Error toggling blocked date:", error);
    res.status(500).json({ error: "Failed to toggle blocked date" });
  }
});

// ============================================================================
// CONTRACTOR AVAILABILITY API
// ============================================================================

/**
 * GET /api/availability/contractor/:contractorId
 * Returns a contractor's availability pattern and date overrides
 */
router.get("/contractor/:contractorId", async (req, res) => {
  try {
    const { contractorId } = req.params;
    const startDate = req.query.start
      ? parseISO(req.query.start as string)
      : new Date();
    const endDate = req.query.end
      ? parseISO(req.query.end as string)
      : addDays(startDate, 90);

    // Get weekly pattern
    const weeklyPattern = await db
      .select()
      .from(handymanAvailability)
      .where(eq(handymanAvailability.handymanId, contractorId))
      .orderBy(handymanAvailability.dayOfWeek);

    // Get date-specific overrides
    const dateOverrides = await db
      .select()
      .from(contractorAvailabilityDates)
      .where(
        and(
          eq(contractorAvailabilityDates.contractorId, contractorId),
          gte(contractorAvailabilityDates.date, startDate),
          lte(contractorAvailabilityDates.date, endDate)
        )
      )
      .orderBy(contractorAvailabilityDates.date);

    // Get booked jobs
    const jobs = await db
      .select({
        id: contractorJobs.id,
        scheduledDate: contractorJobs.scheduledDate,
        scheduledTime: contractorJobs.scheduledTime,
        status: contractorJobs.status,
        customerName: contractorJobs.customerName,
        address: contractorJobs.address,
      })
      .from(contractorJobs)
      .where(
        and(
          eq(contractorJobs.contractorId, contractorId),
          gte(contractorJobs.scheduledDate, startDate),
          lte(contractorJobs.scheduledDate, endDate)
        )
      )
      .orderBy(contractorJobs.scheduledDate);

    res.json({
      weeklyPattern,
      dateOverrides,
      jobs,
    });
  } catch (error: any) {
    console.error("[AVAILABILITY] Error fetching contractor availability:", error);
    res.status(500).json({ error: "Failed to fetch contractor availability" });
  }
});

/**
 * PUT /api/availability/contractor/:contractorId/weekly/:dayOfWeek
 * Update contractor's weekly pattern for a specific day
 */
router.put("/contractor/:contractorId/weekly/:dayOfWeek", async (req, res) => {
  try {
    const { contractorId } = req.params;
    const dayOfWeek = parseInt(req.params.dayOfWeek);
    const { isActive, startTime, endTime } = req.body;

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ error: "Invalid day of week" });
    }

    // Check if pattern exists for this day
    const existing = await db
      .select()
      .from(handymanAvailability)
      .where(
        and(
          eq(handymanAvailability.handymanId, contractorId),
          eq(handymanAvailability.dayOfWeek, dayOfWeek)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update
      await db
        .update(handymanAvailability)
        .set({
          isActive: isActive ?? existing[0].isActive,
          startTime: startTime ?? existing[0].startTime,
          endTime: endTime ?? existing[0].endTime,
        })
        .where(eq(handymanAvailability.id, existing[0].id));
    } else {
      // Insert
      await db.insert(handymanAvailability).values({
        id: uuidv4(),
        handymanId: contractorId,
        dayOfWeek,
        isActive: isActive ?? true,
        startTime: startTime ?? "09:00",
        endTime: endTime ?? "17:00",
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("[AVAILABILITY] Error updating contractor weekly pattern:", error);
    res.status(500).json({ error: "Failed to update weekly pattern" });
  }
});

/**
 * POST /api/availability/contractor/:contractorId/date
 * Set contractor's availability for a specific date (override)
 */
router.post("/contractor/:contractorId/date", async (req, res) => {
  try {
    const { contractorId } = req.params;
    const { date, isAvailable, startTime, endTime, notes } = req.body;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
    const dateStart = startOfDay(dateObj);
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

    if (existing.length > 0) {
      // Update
      await db
        .update(contractorAvailabilityDates)
        .set({
          isAvailable: isAvailable ?? existing[0].isAvailable,
          startTime: startTime ?? existing[0].startTime,
          endTime: endTime ?? existing[0].endTime,
          notes: notes ?? existing[0].notes,
        })
        .where(eq(contractorAvailabilityDates.id, existing[0].id));

      res.json({ id: existing[0].id, success: true, action: "updated" });
    } else {
      // Insert
      const id = uuidv4();
      await db.insert(contractorAvailabilityDates).values({
        id,
        contractorId,
        date: dateStart,
        isAvailable: isAvailable ?? true,
        startTime: startTime ?? "09:00",
        endTime: endTime ?? "17:00",
        notes: notes ?? null,
      });

      res.status(201).json({ id, success: true, action: "created" });
    }
  } catch (error: any) {
    console.error("[AVAILABILITY] Error setting contractor date override:", error);
    res.status(500).json({ error: "Failed to set date override" });
  }
});

/**
 * DELETE /api/availability/contractor/:contractorId/date/:dateOverrideId
 * Remove a contractor's date override (reverts to weekly pattern)
 */
router.delete("/contractor/:contractorId/date/:dateOverrideId", async (req, res) => {
  try {
    const { dateOverrideId } = req.params;

    await db
      .delete(contractorAvailabilityDates)
      .where(eq(contractorAvailabilityDates.id, dateOverrideId));

    res.json({ success: true });
  } catch (error: any) {
    console.error("[AVAILABILITY] Error removing date override:", error);
    res.status(500).json({ error: "Failed to remove date override" });
  }
});

/**
 * POST /api/availability/contractor/:contractorId/toggle
 * Quick toggle for a contractor's date availability
 */
router.post("/contractor/:contractorId/toggle", async (req, res) => {
  try {
    const { contractorId } = req.params;
    const { date, slot } = req.body; // slot: "am" | "pm" | "full" | undefined (full day)

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
    const dateStart = startOfDay(dateObj);
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

    if (existing.length > 0) {
      // Toggle availability
      const newAvailable = !existing[0].isAvailable;
      await db
        .update(contractorAvailabilityDates)
        .set({ isAvailable: newAvailable })
        .where(eq(contractorAvailabilityDates.id, existing[0].id));

      res.json({ isAvailable: newAvailable, action: "toggled" });
    } else {
      // Create new override (mark as unavailable - toggling from default available)
      const id = uuidv4();
      await db.insert(contractorAvailabilityDates).values({
        id,
        contractorId,
        date: dateStart,
        isAvailable: false,
        startTime: "09:00",
        endTime: "17:00",
      });

      res.json({ isAvailable: false, action: "created_unavailable" });
    }
  } catch (error: any) {
    console.error("[AVAILABILITY] Error toggling contractor availability:", error);
    res.status(500).json({ error: "Failed to toggle availability" });
  }
});

export default router;
