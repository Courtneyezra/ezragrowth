import { Router } from "express";
import { storage, PaymentLink } from "../storage";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Generate a short code for payment links (6 characters)
function generateShortCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous characters
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Ensure uniqueness
  if (storage.paymentLinks.some(link => link.shortCode === code)) {
    return generateShortCode();
  }
  return code;
}

// Get all payment links for a contractor
router.get("/", (req, res) => {
  const { contractorId } = req.query;

  let links = storage.paymentLinks;
  if (contractorId) {
    links = links.filter(link => link.contractorId === contractorId);
  }

  // Sort by created date, newest first
  links = links.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  res.json(links);
});

// Get payment link by short code (public - for customer payment page)
router.get("/code/:shortCode", (req, res) => {
  const link = storage.paymentLinks.find(l => l.shortCode === req.params.shortCode);

  if (!link) {
    return res.status(404).json({ error: "Payment link not found" });
  }

  // Check if expired
  if (link.expiresAt && new Date() > link.expiresAt) {
    return res.status(410).json({ error: "Payment link has expired" });
  }

  // Check if already paid
  if (link.status === "paid") {
    return res.status(410).json({ error: "Payment link has already been used", paidAt: link.paidAt });
  }

  // Check if cancelled
  if (link.status === "cancelled") {
    return res.status(410).json({ error: "Payment link has been cancelled" });
  }

  res.json(link);
});

// Get single payment link by ID
router.get("/:id", (req, res) => {
  const link = storage.paymentLinks.find(l => l.id === req.params.id);

  if (!link) {
    return res.status(404).json({ error: "Payment link not found" });
  }

  res.json(link);
});

// Create a new payment link
router.post("/", (req, res) => {
  const {
    contractorId,
    quoteId,
    invoiceId,
    amountPence,
    description,
    customerName,
    customerEmail,
    customerPhone,
    expiresIn, // hours until expiration (optional)
  } = req.body;

  if (!contractorId) {
    return res.status(400).json({ error: "contractorId is required" });
  }

  if (!amountPence || amountPence <= 0) {
    return res.status(400).json({ error: "amountPence must be a positive number" });
  }

  let expiresAt: Date | null = null;
  if (expiresIn) {
    expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresIn);
  }

  const paymentLink: PaymentLink = {
    id: uuidv4(),
    contractorId,
    quoteId: quoteId || null,
    invoiceId: invoiceId || null,
    shortCode: generateShortCode(),
    amountPence,
    description: description || null,
    customerName: customerName || null,
    customerEmail: customerEmail || null,
    customerPhone: customerPhone || null,
    status: "active",
    stripePaymentIntentId: null,
    expiresAt,
    paidAt: null,
    paidByEmail: null,
    createdAt: new Date(),
  };

  storage.paymentLinks.push(paymentLink);
  res.status(201).json(paymentLink);
});

// Update payment link
router.put("/:id", (req, res) => {
  const index = storage.paymentLinks.findIndex(l => l.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Payment link not found" });
  }

  const { description, customerName, customerEmail, customerPhone, status } = req.body;

  // Only allow updating certain fields
  if (description !== undefined) storage.paymentLinks[index].description = description;
  if (customerName !== undefined) storage.paymentLinks[index].customerName = customerName;
  if (customerEmail !== undefined) storage.paymentLinks[index].customerEmail = customerEmail;
  if (customerPhone !== undefined) storage.paymentLinks[index].customerPhone = customerPhone;
  if (status !== undefined) storage.paymentLinks[index].status = status;

  res.json(storage.paymentLinks[index]);
});

// Cancel a payment link
router.post("/:id/cancel", (req, res) => {
  const index = storage.paymentLinks.findIndex(l => l.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Payment link not found" });
  }

  if (storage.paymentLinks[index].status === "paid") {
    return res.status(400).json({ error: "Cannot cancel a paid payment link" });
  }

  storage.paymentLinks[index].status = "cancelled";
  res.json(storage.paymentLinks[index]);
});

// Process payment (simulated - in production this would integrate with Stripe)
router.post("/:shortCode/pay", (req, res) => {
  const index = storage.paymentLinks.findIndex(l => l.shortCode === req.params.shortCode);

  if (index === -1) {
    return res.status(404).json({ error: "Payment link not found" });
  }

  const link = storage.paymentLinks[index];

  // Check if expired
  if (link.expiresAt && new Date() > link.expiresAt) {
    return res.status(410).json({ error: "Payment link has expired" });
  }

  // Check if already paid
  if (link.status === "paid") {
    return res.status(400).json({ error: "Payment link has already been used" });
  }

  // Check if cancelled
  if (link.status === "cancelled") {
    return res.status(400).json({ error: "Payment link has been cancelled" });
  }

  const { payerEmail, stripePaymentIntentId } = req.body;

  // Mark as paid
  storage.paymentLinks[index].status = "paid";
  storage.paymentLinks[index].paidAt = new Date();
  storage.paymentLinks[index].paidByEmail = payerEmail || null;
  storage.paymentLinks[index].stripePaymentIntentId = stripePaymentIntentId || null;

  // If linked to an invoice, update the invoice status
  if (link.invoiceId) {
    const invoiceIndex = storage.invoices.findIndex(i => i.id === link.invoiceId);
    if (invoiceIndex !== -1) {
      storage.invoices[invoiceIndex].status = "paid";
      storage.invoices[invoiceIndex].paidAt = new Date();
      storage.invoices[invoiceIndex].balanceDue = 0;
      storage.invoices[invoiceIndex].updatedAt = new Date();
    }
  }

  res.json({
    success: true,
    paymentLink: storage.paymentLinks[index],
  });
});

// Create Stripe payment intent (placeholder for Stripe integration)
router.post("/:shortCode/create-payment-intent", (req, res) => {
  const link = storage.paymentLinks.find(l => l.shortCode === req.params.shortCode);

  if (!link) {
    return res.status(404).json({ error: "Payment link not found" });
  }

  if (link.status !== "active") {
    return res.status(400).json({ error: "Payment link is not active" });
  }

  // In production, this would create a Stripe PaymentIntent
  // For now, return a mock response
  res.json({
    clientSecret: `pi_mock_${link.shortCode}_secret_${Date.now()}`,
    amountPence: link.amountPence,
  });
});

// Get payment link statistics for a contractor
router.get("/stats/:contractorId", (req, res) => {
  const contractorLinks = storage.paymentLinks.filter(
    link => link.contractorId === req.params.contractorId
  );

  const stats = {
    total: contractorLinks.length,
    active: contractorLinks.filter(l => l.status === "active").length,
    paid: contractorLinks.filter(l => l.status === "paid").length,
    expired: contractorLinks.filter(l => l.status === "expired").length,
    cancelled: contractorLinks.filter(l => l.status === "cancelled").length,
    totalPaidAmountPence: contractorLinks
      .filter(l => l.status === "paid")
      .reduce((sum, l) => sum + l.amountPence, 0),
    totalPendingAmountPence: contractorLinks
      .filter(l => l.status === "active")
      .reduce((sum, l) => sum + l.amountPence, 0),
  };

  res.json(stats);
});

export default router;
