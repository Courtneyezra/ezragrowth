import { Router } from "express";
import { storage, LandingPage } from "../storage";

const router = Router();

// Get all landing pages
router.get("/", (req, res) => {
  const pages = storage.landingPages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  res.json(pages);
});

// Get landing page by slug
router.get("/slug/:slug", (req, res) => {
  const page = storage.landingPages.find((p) => p.slug === req.params.slug);
  if (!page) {
    return res.status(404).json({ error: "Landing page not found" });
  }
  res.json(page);
});

// Get single landing page
router.get("/:id", (req, res) => {
  const page = storage.landingPages.find((p) => p.id === parseInt(req.params.id));
  if (!page) {
    return res.status(404).json({ error: "Landing page not found" });
  }
  res.json(page);
});

// Create landing page
router.post("/", (req, res) => {
  const { slug, name, content, isActive } = req.body;

  const page: LandingPage = {
    id: storage.getNextLandingPageId(),
    slug,
    name,
    content: content || null,
    isActive: isActive !== false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  storage.landingPages.push(page);
  res.status(201).json(page);
});

// Update landing page
router.put("/:id", (req, res) => {
  const index = storage.landingPages.findIndex((p) => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: "Landing page not found" });
  }

  storage.landingPages[index] = { ...storage.landingPages[index], ...req.body, updatedAt: new Date() };
  res.json(storage.landingPages[index]);
});

// Delete landing page
router.delete("/:id", (req, res) => {
  const index = storage.landingPages.findIndex((p) => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: "Landing page not found" });
  }

  storage.landingPages.splice(index, 1);
  res.status(204).send();
});

export default router;
