import { Router } from "express";
import { storage, ContractorReview, InvoiceToken } from "../storage";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const router = Router();

// Generate a secure token
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ==========================================
// INVOICE TOKENS - For client invoice access
// ==========================================

// Create an invoice token for client portal access
router.post("/invoices/:invoiceId/token", (req, res) => {
  const invoice = storage.invoices.find(i => i.id === req.params.invoiceId);

  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  // Check if token already exists for this invoice
  let existingToken = storage.invoiceTokens.find(t => t.invoiceId === req.params.invoiceId);

  if (existingToken) {
    return res.json(existingToken);
  }

  const invoiceToken: InvoiceToken = {
    id: uuidv4(),
    invoiceId: req.params.invoiceId,
    token: generateToken(),
    viewCount: 0,
    lastViewedAt: null,
    expiresAt: null, // No expiry by default
    createdAt: new Date(),
  };

  storage.invoiceTokens.push(invoiceToken);
  res.status(201).json(invoiceToken);
});

// Get invoice by token (public - for client portal)
router.get("/invoices/token/:token", (req, res) => {
  const invoiceToken = storage.invoiceTokens.find(t => t.token === req.params.token);

  if (!invoiceToken) {
    return res.status(404).json({ error: "Invoice not found or invalid token" });
  }

  // Check expiry
  if (invoiceToken.expiresAt && new Date() > invoiceToken.expiresAt) {
    return res.status(410).json({ error: "Invoice link has expired" });
  }

  const invoice = storage.invoices.find(i => i.id === invoiceToken.invoiceId);

  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  // Update view count
  const tokenIndex = storage.invoiceTokens.findIndex(t => t.token === req.params.token);
  storage.invoiceTokens[tokenIndex].viewCount++;
  storage.invoiceTokens[tokenIndex].lastViewedAt = new Date();

  res.json({
    invoice,
    token: invoiceToken.token,
  });
});

// ==========================================
// CLIENT JOB HISTORY - View past work with contractor
// ==========================================

// Get client job history (by email or phone)
router.get("/history", (req, res) => {
  const { email, phone, contractorId } = req.query;

  if (!email && !phone) {
    return res.status(400).json({ error: "Email or phone is required" });
  }

  // Get quotes matching this customer
  let quotes = storage.quotes.filter(q => {
    const matchesCustomer = (email && q.email === email) || (phone && q.phone === phone);
    const matchesContractor = !contractorId || q.shortSlug; // Would match contractorId if we had that field
    return matchesCustomer && matchesContractor;
  });

  // Get invoices matching this customer
  let invoices = storage.invoices.filter(i => {
    const matchesEmail = email && i.customerEmail === email;
    const matchesPhone = phone && i.customerPhone === phone;
    return matchesEmail || matchesPhone;
  });

  // Get jobs matching this customer
  let jobs = storage.jobs.filter(j => {
    const matchesPhone = phone && j.customerPhone === phone;
    return matchesPhone;
  });

  res.json({
    quotes: quotes.map(q => ({
      id: q.id,
      slug: q.shortSlug,
      jobDescription: q.jobDescription,
      selectedPackage: q.selectedPackage,
      status: q.selectedAt ? "accepted" : "pending",
      createdAt: q.createdAt,
    })),
    invoices: invoices.map(i => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      totalAmount: i.totalAmount,
      balanceDue: i.balanceDue,
      status: i.status,
      createdAt: i.createdAt,
    })),
    jobs: jobs.map(j => ({
      id: j.id,
      jobDescription: j.jobDescription,
      status: j.status,
      scheduledDate: j.scheduledDate,
      completedAt: j.completedAt,
    })),
  });
});

// ==========================================
// REVIEWS - Customer review system
// ==========================================

// Create a review token (for requesting reviews)
router.post("/reviews/request", (req, res) => {
  const { contractorId, customerName, customerEmail, customerPhone, quoteId, jobId } = req.body;

  if (!contractorId) {
    return res.status(400).json({ error: "contractorId is required" });
  }

  if (!customerName) {
    return res.status(400).json({ error: "customerName is required" });
  }

  // Create a review with a token but no rating yet
  const review: ContractorReview = {
    id: uuidv4(),
    contractorId,
    customerName,
    customerEmail: customerEmail || null,
    quoteId: quoteId || null,
    jobId: jobId || null,
    overallRating: 0, // Will be set when review is submitted
    qualityRating: null,
    timelinessRating: null,
    communicationRating: null,
    valueRating: null,
    reviewText: null,
    reviewToken: generateToken(),
    isVerified: !!(quoteId || jobId), // Verified if linked to actual job
    isPublic: true,
    isFeatured: false,
    contractorResponse: null,
    respondedAt: null,
    isApproved: true,
    createdAt: new Date(),
  };

  storage.contractorReviews.push(review);

  res.status(201).json({
    id: review.id,
    reviewToken: review.reviewToken,
    reviewUrl: `/review/${review.reviewToken}`,
  });
});

// Get review by token (public - for review submission page)
router.get("/reviews/token/:token", (req, res) => {
  const review = storage.contractorReviews.find(r => r.reviewToken === req.params.token);

  if (!review) {
    return res.status(404).json({ error: "Review link not found" });
  }

  // If already submitted, return error
  if (review.overallRating > 0) {
    return res.status(410).json({ error: "Review has already been submitted" });
  }

  res.json({
    id: review.id,
    contractorId: review.contractorId,
    customerName: review.customerName,
    isVerified: review.isVerified,
  });
});

// Submit a review (public - for customers)
router.post("/reviews/token/:token/submit", (req, res) => {
  const index = storage.contractorReviews.findIndex(r => r.reviewToken === req.params.token);

  if (index === -1) {
    return res.status(404).json({ error: "Review link not found" });
  }

  // If already submitted, return error
  if (storage.contractorReviews[index].overallRating > 0) {
    return res.status(400).json({ error: "Review has already been submitted" });
  }

  const {
    overallRating,
    qualityRating,
    timelinessRating,
    communicationRating,
    valueRating,
    reviewText,
  } = req.body;

  if (!overallRating || overallRating < 1 || overallRating > 5) {
    return res.status(400).json({ error: "overallRating must be between 1 and 5" });
  }

  // Update the review
  storage.contractorReviews[index].overallRating = overallRating;
  storage.contractorReviews[index].qualityRating = qualityRating || null;
  storage.contractorReviews[index].timelinessRating = timelinessRating || null;
  storage.contractorReviews[index].communicationRating = communicationRating || null;
  storage.contractorReviews[index].valueRating = valueRating || null;
  storage.contractorReviews[index].reviewText = reviewText || null;

  // Clear the token after submission (single use)
  storage.contractorReviews[index].reviewToken = null;

  res.json({
    success: true,
    review: storage.contractorReviews[index],
  });
});

// Get all reviews for a contractor (public)
router.get("/reviews/contractor/:contractorId", (req, res) => {
  const reviews = storage.contractorReviews
    .filter(r =>
      r.contractorId === req.params.contractorId &&
      r.isPublic &&
      r.isApproved &&
      r.overallRating > 0
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Calculate aggregate stats
  const stats = {
    count: reviews.length,
    averageRating: reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
      : 0,
    ratingDistribution: {
      5: reviews.filter(r => r.overallRating === 5).length,
      4: reviews.filter(r => r.overallRating === 4).length,
      3: reviews.filter(r => r.overallRating === 3).length,
      2: reviews.filter(r => r.overallRating === 2).length,
      1: reviews.filter(r => r.overallRating === 1).length,
    },
  };

  res.json({
    reviews: reviews.map(r => ({
      id: r.id,
      customerName: r.customerName,
      overallRating: r.overallRating,
      qualityRating: r.qualityRating,
      timelinessRating: r.timelinessRating,
      communicationRating: r.communicationRating,
      valueRating: r.valueRating,
      reviewText: r.reviewText,
      isVerified: r.isVerified,
      contractorResponse: r.contractorResponse,
      respondedAt: r.respondedAt,
      createdAt: r.createdAt,
    })),
    stats,
  });
});

// Contractor responds to a review
router.post("/reviews/:reviewId/respond", (req, res) => {
  const index = storage.contractorReviews.findIndex(r => r.id === req.params.reviewId);

  if (index === -1) {
    return res.status(404).json({ error: "Review not found" });
  }

  const { response, contractorId } = req.body;

  // Verify the contractor owns this review
  if (storage.contractorReviews[index].contractorId !== contractorId) {
    return res.status(403).json({ error: "Not authorized to respond to this review" });
  }

  if (!response || response.trim().length === 0) {
    return res.status(400).json({ error: "Response is required" });
  }

  storage.contractorReviews[index].contractorResponse = response;
  storage.contractorReviews[index].respondedAt = new Date();

  res.json(storage.contractorReviews[index]);
});

// Get all reviews for a contractor (contractor view - includes pending)
router.get("/reviews/contractor/:contractorId/all", (req, res) => {
  const reviews = storage.contractorReviews
    .filter(r => r.contractorId === req.params.contractorId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  res.json(reviews);
});

// Toggle review visibility
router.post("/reviews/:reviewId/visibility", (req, res) => {
  const index = storage.contractorReviews.findIndex(r => r.id === req.params.reviewId);

  if (index === -1) {
    return res.status(404).json({ error: "Review not found" });
  }

  const { isPublic, contractorId } = req.body;

  // Verify the contractor owns this review
  if (storage.contractorReviews[index].contractorId !== contractorId) {
    return res.status(403).json({ error: "Not authorized to modify this review" });
  }

  storage.contractorReviews[index].isPublic = isPublic;

  res.json(storage.contractorReviews[index]);
});

export default router;
