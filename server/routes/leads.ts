import { Router } from "express";
import { storage, Lead } from "../storage";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Get all leads
router.get("/", (req, res) => {
  const leads = storage.leads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  res.json(leads);
});

// Get single lead
router.get("/:id", (req, res) => {
  const lead = storage.leads.find((l) => l.id === req.params.id);
  if (!lead) {
    return res.status(404).json({ error: "Lead not found" });
  }
  res.json(lead);
});

// Create lead
router.post("/", (req, res) => {
  const { customerName, phone, email, address, postcode, jobDescription, source } = req.body;

  const lead: Lead = {
    id: uuidv4(),
    customerName,
    phone,
    email: email || null,
    address: address || null,
    postcode: postcode || null,
    jobDescription: jobDescription || null,
    status: "new",
    source: source || "website",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  storage.leads.push(lead);
  res.status(201).json(lead);
});

// Update lead
router.put("/:id", (req, res) => {
  const index = storage.leads.findIndex((l) => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Lead not found" });
  }

  storage.leads[index] = { ...storage.leads[index], ...req.body, updatedAt: new Date() };
  res.json(storage.leads[index]);
});

export default router;
