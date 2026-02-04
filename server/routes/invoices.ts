import { Router } from "express";
import { storage, Invoice } from "../storage";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Generate invoice number
function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `INV-${year}-${random}`;
}

// Get all invoices
router.get("/", (req, res) => {
  const invoices = storage.invoices.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  res.json(invoices);
});

// Get single invoice
router.get("/:id", (req, res) => {
  const invoice = storage.invoices.find((i) => i.id === req.params.id);
  if (!invoice) {
    return res.status(404).json({ error: "Invoice not found" });
  }
  res.json(invoice);
});

// Create invoice
router.post("/", (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    totalAmount,
    depositPaid,
    lineItems,
    dueDate,
    notes,
  } = req.body;

  const invoice: Invoice = {
    id: uuidv4(),
    invoiceNumber: generateInvoiceNumber(),
    customerName,
    customerEmail: customerEmail || null,
    customerPhone: customerPhone || null,
    customerAddress: customerAddress || null,
    totalAmount,
    depositPaid: depositPaid || 0,
    balanceDue: totalAmount - (depositPaid || 0),
    lineItems: lineItems || null,
    status: "draft",
    dueDate: dueDate ? new Date(dueDate) : null,
    sentAt: null,
    paidAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  storage.invoices.push(invoice);
  res.status(201).json(invoice);
});

// Update invoice
router.put("/:id", (req, res) => {
  const index = storage.invoices.findIndex((i) => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  storage.invoices[index] = { ...storage.invoices[index], ...req.body, updatedAt: new Date() };
  res.json(storage.invoices[index]);
});

// Mark invoice as sent
router.post("/:id/send", (req, res) => {
  const index = storage.invoices.findIndex((i) => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  storage.invoices[index].status = "sent";
  storage.invoices[index].sentAt = new Date();
  storage.invoices[index].updatedAt = new Date();
  res.json(storage.invoices[index]);
});

// Mark invoice as paid
router.post("/:id/pay", (req, res) => {
  const index = storage.invoices.findIndex((i) => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  storage.invoices[index].status = "paid";
  storage.invoices[index].paidAt = new Date();
  storage.invoices[index].balanceDue = 0;
  storage.invoices[index].updatedAt = new Date();
  res.json(storage.invoices[index]);
});

export default router;
