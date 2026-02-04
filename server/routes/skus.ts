import { Router } from "express";
import { storage, SKU } from "../storage";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Get all SKUs
router.get("/", (req, res) => {
  const skus = storage.skus.sort((a, b) => a.name.localeCompare(b.name));
  res.json(skus);
});

// Get single SKU
router.get("/:id", (req, res) => {
  const sku = storage.skus.find((s) => s.id === req.params.id);
  if (!sku) {
    return res.status(404).json({ error: "SKU not found" });
  }
  res.json(sku);
});

// Create SKU
router.post("/", (req, res) => {
  const { skuCode, name, description, pricePence, timeEstimateMinutes, keywords, category } = req.body;

  const sku: SKU = {
    id: uuidv4(),
    skuCode,
    name,
    description,
    pricePence,
    timeEstimateMinutes,
    keywords: keywords || [],
    category: category || "electrical",
    isActive: true,
    createdAt: new Date(),
  };

  storage.skus.push(sku);
  res.status(201).json(sku);
});

// Update SKU
router.put("/:id", (req, res) => {
  const index = storage.skus.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "SKU not found" });
  }

  storage.skus[index] = { ...storage.skus[index], ...req.body };
  res.json(storage.skus[index]);
});

// Delete SKU
router.delete("/:id", (req, res) => {
  const index = storage.skus.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "SKU not found" });
  }

  storage.skus.splice(index, 1);
  res.status(204).send();
});

export default router;
