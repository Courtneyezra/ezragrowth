import { Router } from "express";
import { storage, Call } from "../storage";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Get all calls
router.get("/", (req, res) => {
  const calls = storage.calls.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  res.json(calls);
});

// Get single call
router.get("/:id", (req, res) => {
  const call = storage.calls.find((c) => c.id === req.params.id);
  if (!call) {
    return res.status(404).json({ error: "Call not found" });
  }
  res.json(call);
});

// Create call log
router.post("/", (req, res) => {
  const { callId, phoneNumber, direction, customerName, notes, outcome } = req.body;
  const id = uuidv4();

  const call: Call = {
    id,
    callId: callId || `CALL-${id.slice(0, 8)}`,
    phoneNumber,
    customerName: customerName || null,
    startTime: new Date(),
    direction: direction || "inbound",
    status: "completed",
    duration: null,
    outcome: outcome || null,
    notes: notes || null,
    createdAt: new Date(),
  };

  storage.calls.push(call);
  res.status(201).json(call);
});

// Update call
router.patch("/:id", (req, res) => {
  const index = storage.calls.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Call not found" });
  }

  storage.calls[index] = { ...storage.calls[index], ...req.body };
  res.json(storage.calls[index]);
});

export default router;
