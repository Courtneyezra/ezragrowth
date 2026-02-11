import { Router } from "express";
import { storage } from "../storage";
import { v4 as uuidv4 } from "uuid";
import { generateValuePricingQuote, getSegmentTierConfig } from "../value-pricing-engine";
import { assignContractor } from "../job-assignment";

const router = Router();

// Segment types
type Segment = 'BUSY_PRO' | 'PROP_MGR' | 'SMALL_BIZ' | 'DIY_DEFERRER' | 'BUDGET' | 'OLDER_WOMAN';

// Generate short slug for quote URLs
function generateSlug(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let slug = "";
  for (let i = 0; i < 6; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

// Get all quotes
router.get("/", (req, res) => {
  const quotes = storage.quotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  res.json(quotes);
});

// Get quote by slug (public - for client portal)
router.get("/link/:slug", (req, res) => {
  const quote = storage.quotes.find((q) => q.shortSlug === req.params.slug.toUpperCase());
  if (!quote) {
    return res.status(404).json({ error: "Quote not found" });
  }

  // Update view count
  quote.viewCount = (quote.viewCount || 0) + 1;
  if (!quote.viewedAt) {
    quote.viewedAt = new Date();
  }

  res.json(quote);
});

// Get quote by ID
router.get("/:id", (req, res) => {
  const quote = storage.quotes.find((q) => q.id === req.params.id);
  if (!quote) {
    return res.status(404).json({ error: "Quote not found" });
  }
  res.json(quote);
});

// Create quote with value pricing
router.post("/", (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      postcode,
      address,
      jobDescription,
      segment = "BUSY_PRO",
      basePrice, // In pounds
      urgencyReason = "med",
      ownershipContext = "homeowner",
      desiredTimeframe = "week",
      essentialPriceOverride,
      enhancedPriceOverride,
      elitePriceOverride,
      optionalExtras,
      quoteMode = "hhh",
      additionalNotes,
    } = req.body;

    // Validation
    if (!customerName?.trim()) {
      return res.status(400).json({ error: "Customer name is required" });
    }
    if (!phone?.trim()) {
      return res.status(400).json({ error: "Phone is required" });
    }
    if (!jobDescription?.trim()) {
      return res.status(400).json({ error: "Job description is required" });
    }
    if (!basePrice || basePrice <= 0) {
      return res.status(400).json({ error: "Base price must be positive" });
    }

    const id = uuidv4();
    const shortSlug = generateSlug();
    const basePricePence = Math.round(basePrice * 100);

    // Calculate tier prices using value pricing engine
    const valuePricing = generateValuePricingQuote({
      baseJobPricePence: basePricePence,
      urgencyReason,
      ownershipContext,
      desiredTimeframe,
      segment,
      clientType: "residential",
      jobComplexity: "medium",
    });

    // Use overrides if provided, otherwise use calculated prices
    const essentialPrice = essentialPriceOverride
      ? Math.round(essentialPriceOverride * 100)
      : valuePricing.essential.price;
    const enhancedPrice = enhancedPriceOverride
      ? Math.round(enhancedPriceOverride * 100)
      : valuePricing.hassleFree.price;
    const elitePrice = elitePriceOverride
      ? Math.round(elitePriceOverride * 100)
      : valuePricing.highStandard.price;

    // Set expiry to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create the quote
    const quote = {
      id,
      shortSlug,
      customerName,
      phone,
      email: email || null,
      postcode: postcode || null,
      address: address || null,
      jobDescription,
      segment,
      quoteMode,
      urgencyReason,
      ownershipContext,
      desiredTimeframe,
      baseJobPricePence: basePricePence,
      valueMultiplier100: valuePricing.valueMultiplier100,
      essentialPrice,
      enhancedPrice,
      elitePrice,
      optionalExtras: optionalExtras || null,
      additionalNotes: additionalNotes || null,
      recommendedTier: valuePricing.recommendedTier,
      tierDeliverables: valuePricing.tierDeliverables,
      viewCount: 0,
      viewedAt: null as Date | null,
      selectedPackage: null as string | null,
      selectedAt: null as Date | null,
      expiresAt,
      createdAt: new Date(),
    };

    storage.quotes.push(quote);

    // Also create a lead
    const lead = {
      id: uuidv4(),
      customerName,
      phone,
      email: email || null,
      postcode: postcode || null,
      address: address || null,
      jobDescription,
      status: "quoted",
      source: "quote",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    storage.leads.push(lead);

    res.status(201).json({
      ...quote,
      leadId: lead.id,
      quoteLink: `/quote/${shortSlug}`,
      // Return prices in pounds for display
      essential: { price: essentialPrice, perks: valuePricing.essential.perks },
      hassleFree: { price: enhancedPrice, perks: valuePricing.hassleFree.perks },
      highStandard: { price: elitePrice, perks: valuePricing.highStandard.perks },
    });
  } catch (error: any) {
    console.error("Error creating quote:", error);
    res.status(500).json({ error: "Failed to create quote" });
  }
});

// Select package on quote (client action)
router.post("/:id/select", async (req, res) => {
  const {
    selectedPackage,
    selectedDate,
    timeSlotType,
    exactTimeRequested,
    schedulingFeeInPence,
    schedulingTier,
  } = req.body;

  if (!["essential", "hassleFree", "highStandard"].includes(selectedPackage)) {
    return res.status(400).json({ error: "Invalid package selection" });
  }

  const index = storage.quotes.findIndex((q) => q.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Quote not found" });
  }

  const quote = storage.quotes[index];

  // Update quote with selection and scheduling info
  quote.selectedPackage = selectedPackage;
  quote.selectedAt = new Date();

  // Persist scheduling data (Phase 3)
  if (selectedDate) {
    (quote as any).selectedDate = new Date(selectedDate);
  }
  if (timeSlotType) {
    (quote as any).timeSlotType = timeSlotType;
  }
  if (exactTimeRequested) {
    (quote as any).exactTimeRequested = exactTimeRequested;
  }
  if (schedulingFeeInPence !== undefined) {
    (quote as any).schedulingFeeInPence = schedulingFeeInPence;
  }
  if (schedulingTier) {
    (quote as any).schedulingTier = schedulingTier;
  }

  // Check if weekend booking
  if (selectedDate) {
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    (quote as any).isWeekendBooking = dayOfWeek === 0 || dayOfWeek === 6;
  }

  // Calculate selected tier price for reference
  let selectedTierPricePence = 0;
  switch (selectedPackage) {
    case "essential":
      selectedTierPricePence = quote.essentialPrice;
      break;
    case "hassleFree":
      selectedTierPricePence = quote.enhancedPrice;
      break;
    case "highStandard":
      selectedTierPricePence = quote.elitePrice;
      break;
  }
  (quote as any).selectedTierPricePence = selectedTierPricePence;

  // Update lead status
  const lead = storage.leads.find((l) => l.phone === quote.phone);
  if (lead) {
    lead.status = "booked";
    lead.updatedAt = new Date();
  }

  // Phase 6: Auto-assign contractor when date is selected
  let assignmentResult = null;
  if (selectedDate && timeSlotType) {
    try {
      assignmentResult = await assignContractor({
        quoteId: quote.id,
        customerName: quote.customerName,
        customerPhone: quote.phone,
        address: quote.address || undefined,
        postcode: quote.postcode || undefined,
        jobDescription: quote.jobDescription,
        selectedDate: new Date(selectedDate),
        timeSlotType: timeSlotType as "am" | "pm" | "full" | "exact",
        exactTimeRequested: exactTimeRequested,
        payoutPence: selectedTierPricePence,
      });

      if (assignmentResult.success) {
        (quote as any).assignedContractorId = assignmentResult.contractorId;
        (quote as any).assignedJobId = assignmentResult.jobId;
        console.log(`[QUOTES] Auto-assigned job ${assignmentResult.jobId} to contractor ${assignmentResult.contractorId}`);
      } else {
        console.log(`[QUOTES] Auto-assignment failed: ${assignmentResult.reason}`);
      }
    } catch (error) {
      console.error("[QUOTES] Error during auto-assignment:", error);
      // Don't fail the booking if assignment fails - can be manually assigned later
    }
  }

  res.json({
    ...quote,
    assignment: assignmentResult,
  });
});

// Get segment tier config (for UI display)
router.get("/config/segments", (req, res) => {
  const segments = [
    { value: "BUSY_PRO", label: "Busy Professional", description: "Time-poor, values speed & convenience" },
    { value: "OLDER_WOMAN", label: "Older Customer", description: "Values trust, safety & reliability" },
    { value: "PROP_MGR", label: "Property Manager", description: "Manages multiple properties, needs fast response" },
    { value: "SMALL_BIZ", label: "Small Business", description: "Needs after-hours, minimal disruption" },
    { value: "DIY_DEFERRER", label: "DIY Deferrer", description: "Has a list of jobs, price-conscious" },
    { value: "BUDGET", label: "Budget Customer", description: "Most price-sensitive, single tier only" },
  ];
  res.json(segments);
});

export default router;
