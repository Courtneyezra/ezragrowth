import { Router } from "express";
import { storage, PartnerApplication, ClientReference } from "../storage";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const router = Router();

// Generate a secure token for reference requests
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Partner application statuses
const APPLICATION_STATUSES = [
  "not_started",
  "application_started",
  "insurance_pending",
  "insurance_verified",
  "identity_pending",
  "identity_verified",
  "references_pending",
  "references_verified",
  "training_incomplete",
  "training_complete",
  "agreement_pending",
  "partner_active",
  "rejected",
] as const;

// Step statuses
const STEP_STATUSES = ["pending", "submitted", "verified", "rejected"] as const;

// ==========================================
// PARTNER APPLICATIONS
// ==========================================

// Get application for contractor (or create if doesn't exist)
router.get("/contractor/:contractorId", (req, res) => {
  let application = storage.partnerApplications.find(
    a => a.contractorId === req.params.contractorId
  );

  if (!application) {
    // Auto-create application on first access
    application = {
      id: uuidv4(),
      contractorId: req.params.contractorId,
      status: "not_started",
      insuranceStatus: "pending",
      insuranceDocumentUrl: null,
      insurancePolicyNumber: null,
      insuranceExpiryDate: null,
      insuranceVerifiedAt: null,
      identityStatus: "pending",
      identityDocumentUrl: null,
      dbsCertificateUrl: null,
      identityVerifiedAt: null,
      referencesStatus: "pending",
      referencesVerifiedAt: null,
      trainingStatus: "incomplete",
      trainingCompletedAt: null,
      agreementSignedAt: null,
      highvisSize: null,
      activatedAt: null,
      adminNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    storage.partnerApplications.push(application);
  }

  // Get references for this application
  const references = storage.clientReferences.filter(
    r => r.applicationId === application!.id
  );

  // Get training progress
  const trainingProgress = storage.trainingProgress.filter(
    p => p.contractorId === req.params.contractorId
  );

  res.json({
    application,
    references,
    trainingProgress,
  });
});

// Start application (move from not_started to application_started)
router.post("/contractor/:contractorId/start", (req, res) => {
  const index = storage.partnerApplications.findIndex(
    a => a.contractorId === req.params.contractorId
  );

  if (index === -1) {
    return res.status(404).json({ error: "Application not found" });
  }

  storage.partnerApplications[index].status = "application_started";
  storage.partnerApplications[index].updatedAt = new Date();

  res.json(storage.partnerApplications[index]);
});

// ==========================================
// STEP 1: INSURANCE VERIFICATION
// ==========================================

router.post("/contractor/:contractorId/insurance", (req, res) => {
  const index = storage.partnerApplications.findIndex(
    a => a.contractorId === req.params.contractorId
  );

  if (index === -1) {
    return res.status(404).json({ error: "Application not found" });
  }

  const { documentUrl, policyNumber, expiryDate } = req.body;

  if (!documentUrl) {
    return res.status(400).json({ error: "Insurance document is required" });
  }

  if (!policyNumber) {
    return res.status(400).json({ error: "Policy number is required" });
  }

  if (!expiryDate) {
    return res.status(400).json({ error: "Expiry date is required" });
  }

  // Check expiry date is in the future
  const expiry = new Date(expiryDate);
  if (expiry < new Date()) {
    return res.status(400).json({ error: "Insurance must not be expired" });
  }

  storage.partnerApplications[index].insuranceDocumentUrl = documentUrl;
  storage.partnerApplications[index].insurancePolicyNumber = policyNumber;
  storage.partnerApplications[index].insuranceExpiryDate = expiry;
  storage.partnerApplications[index].insuranceStatus = "submitted";
  storage.partnerApplications[index].status = "insurance_pending";
  storage.partnerApplications[index].updatedAt = new Date();

  res.json(storage.partnerApplications[index]);
});

// ==========================================
// STEP 2: IDENTITY & BACKGROUND
// ==========================================

router.post("/contractor/:contractorId/identity", (req, res) => {
  const index = storage.partnerApplications.findIndex(
    a => a.contractorId === req.params.contractorId
  );

  if (index === -1) {
    return res.status(404).json({ error: "Application not found" });
  }

  const { identityDocumentUrl, dbsCertificateUrl } = req.body;

  if (!identityDocumentUrl) {
    return res.status(400).json({ error: "Identity document is required" });
  }

  storage.partnerApplications[index].identityDocumentUrl = identityDocumentUrl;
  storage.partnerApplications[index].dbsCertificateUrl = dbsCertificateUrl || null;
  storage.partnerApplications[index].identityStatus = "submitted";
  storage.partnerApplications[index].status = "identity_pending";
  storage.partnerApplications[index].updatedAt = new Date();

  res.json(storage.partnerApplications[index]);
});

// ==========================================
// STEP 3: CLIENT REFERENCES
// ==========================================

// Add a reference
router.post("/contractor/:contractorId/references", (req, res) => {
  const application = storage.partnerApplications.find(
    a => a.contractorId === req.params.contractorId
  );

  if (!application) {
    return res.status(404).json({ error: "Application not found" });
  }

  const { clientName, clientEmail, clientPhone, jobDescription } = req.body;

  if (!clientName) {
    return res.status(400).json({ error: "Client name is required" });
  }

  if (!clientEmail) {
    return res.status(400).json({ error: "Client email is required" });
  }

  // Check if already have 3 references
  const existingRefs = storage.clientReferences.filter(
    r => r.applicationId === application.id
  );

  if (existingRefs.length >= 3) {
    return res.status(400).json({ error: "Maximum 3 references allowed" });
  }

  const reference: ClientReference = {
    id: uuidv4(),
    applicationId: application.id,
    clientName,
    clientEmail,
    clientPhone: clientPhone || null,
    jobDescription: jobDescription || null,
    requestSentAt: null,
    requestToken: generateToken(),
    responseReceivedAt: null,
    rating: null,
    feedback: null,
    wouldRecommend: null,
    verified: false,
    createdAt: new Date(),
  };

  storage.clientReferences.push(reference);

  // Update application status if this is the first reference
  const appIndex = storage.partnerApplications.findIndex(
    a => a.id === application.id
  );
  if (storage.partnerApplications[appIndex].referencesStatus === "pending") {
    storage.partnerApplications[appIndex].referencesStatus = "submitted";
    storage.partnerApplications[appIndex].status = "references_pending";
    storage.partnerApplications[appIndex].updatedAt = new Date();
  }

  res.status(201).json(reference);
});

// Send reference request (simulated - would send email in production)
router.post("/references/:referenceId/send", (req, res) => {
  const index = storage.clientReferences.findIndex(
    r => r.id === req.params.referenceId
  );

  if (index === -1) {
    return res.status(404).json({ error: "Reference not found" });
  }

  storage.clientReferences[index].requestSentAt = new Date();

  res.json({
    success: true,
    reference: storage.clientReferences[index],
    referenceUrl: `/reference/${storage.clientReferences[index].requestToken}`,
  });
});

// Get reference by token (public - for clients to submit reference)
router.get("/references/token/:token", (req, res) => {
  const reference = storage.clientReferences.find(
    r => r.requestToken === req.params.token
  );

  if (!reference) {
    return res.status(404).json({ error: "Reference request not found" });
  }

  if (reference.responseReceivedAt) {
    return res.status(410).json({ error: "Reference has already been submitted" });
  }

  // Get contractor info
  const application = storage.partnerApplications.find(
    a => a.id === reference.applicationId
  );

  res.json({
    id: reference.id,
    clientName: reference.clientName,
    jobDescription: reference.jobDescription,
    contractorId: application?.contractorId,
  });
});

// Submit reference response (public - from client)
router.post("/references/token/:token/submit", (req, res) => {
  const index = storage.clientReferences.findIndex(
    r => r.requestToken === req.params.token
  );

  if (index === -1) {
    return res.status(404).json({ error: "Reference request not found" });
  }

  if (storage.clientReferences[index].responseReceivedAt) {
    return res.status(400).json({ error: "Reference has already been submitted" });
  }

  const { rating, feedback, wouldRecommend } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  if (wouldRecommend === undefined) {
    return res.status(400).json({ error: "Would recommend is required" });
  }

  storage.clientReferences[index].rating = rating;
  storage.clientReferences[index].feedback = feedback || null;
  storage.clientReferences[index].wouldRecommend = wouldRecommend;
  storage.clientReferences[index].responseReceivedAt = new Date();
  storage.clientReferences[index].verified = rating >= 3 && wouldRecommend;

  // Check if we have enough verified references (2 out of 3)
  const application = storage.partnerApplications.find(
    a => a.id === storage.clientReferences[index].applicationId
  );

  if (application) {
    const allRefs = storage.clientReferences.filter(
      r => r.applicationId === application.id
    );
    const verifiedRefs = allRefs.filter(r => r.verified);

    if (verifiedRefs.length >= 2) {
      const appIndex = storage.partnerApplications.findIndex(
        a => a.id === application.id
      );
      storage.partnerApplications[appIndex].referencesStatus = "verified";
      storage.partnerApplications[appIndex].referencesVerifiedAt = new Date();
      storage.partnerApplications[appIndex].status = "references_verified";
      storage.partnerApplications[appIndex].updatedAt = new Date();
    }
  }

  res.json({
    success: true,
    message: "Thank you for your feedback!",
  });
});

// ==========================================
// STEP 5: AGREEMENT & ACTIVATION
// ==========================================

router.post("/contractor/:contractorId/agreement", (req, res) => {
  const index = storage.partnerApplications.findIndex(
    a => a.contractorId === req.params.contractorId
  );

  if (index === -1) {
    return res.status(404).json({ error: "Application not found" });
  }

  const { highvisSize, agreedToTerms } = req.body;

  if (!agreedToTerms) {
    return res.status(400).json({ error: "Must agree to partner terms" });
  }

  if (!highvisSize) {
    return res.status(400).json({ error: "High-vis size is required" });
  }

  const validSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  if (!validSizes.includes(highvisSize)) {
    return res.status(400).json({ error: "Invalid high-vis size" });
  }

  storage.partnerApplications[index].highvisSize = highvisSize;
  storage.partnerApplications[index].agreementSignedAt = new Date();
  storage.partnerApplications[index].status = "agreement_pending";
  storage.partnerApplications[index].updatedAt = new Date();

  res.json(storage.partnerApplications[index]);
});

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

// Get all applications (admin)
router.get("/admin/applications", (req, res) => {
  const { status } = req.query;

  let applications = storage.partnerApplications;

  if (status) {
    applications = applications.filter(a => a.status === status);
  }

  // Sort by updated date, newest first
  applications = applications.sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );

  res.json(applications);
});

// Get single application with all details (admin)
router.get("/admin/applications/:id", (req, res) => {
  const application = storage.partnerApplications.find(
    a => a.id === req.params.id
  );

  if (!application) {
    return res.status(404).json({ error: "Application not found" });
  }

  const references = storage.clientReferences.filter(
    r => r.applicationId === application.id
  );

  const trainingProgress = storage.trainingProgress.filter(
    p => p.contractorId === application.contractorId
  );

  res.json({
    application,
    references,
    trainingProgress,
  });
});

// Verify insurance (admin)
router.post("/admin/applications/:id/verify-insurance", (req, res) => {
  const index = storage.partnerApplications.findIndex(
    a => a.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({ error: "Application not found" });
  }

  const { approved, notes } = req.body;

  if (approved) {
    storage.partnerApplications[index].insuranceStatus = "verified";
    storage.partnerApplications[index].insuranceVerifiedAt = new Date();
    storage.partnerApplications[index].status = "insurance_verified";
  } else {
    storage.partnerApplications[index].insuranceStatus = "rejected";
  }

  if (notes) {
    storage.partnerApplications[index].adminNotes =
      (storage.partnerApplications[index].adminNotes || "") + `\nInsurance: ${notes}`;
  }

  storage.partnerApplications[index].updatedAt = new Date();

  res.json(storage.partnerApplications[index]);
});

// Verify identity (admin)
router.post("/admin/applications/:id/verify-identity", (req, res) => {
  const index = storage.partnerApplications.findIndex(
    a => a.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({ error: "Application not found" });
  }

  const { approved, notes } = req.body;

  if (approved) {
    storage.partnerApplications[index].identityStatus = "verified";
    storage.partnerApplications[index].identityVerifiedAt = new Date();
    storage.partnerApplications[index].status = "identity_verified";
  } else {
    storage.partnerApplications[index].identityStatus = "rejected";
  }

  if (notes) {
    storage.partnerApplications[index].adminNotes =
      (storage.partnerApplications[index].adminNotes || "") + `\nIdentity: ${notes}`;
  }

  storage.partnerApplications[index].updatedAt = new Date();

  res.json(storage.partnerApplications[index]);
});

// Activate partner (admin - final step)
router.post("/admin/applications/:id/activate", (req, res) => {
  const index = storage.partnerApplications.findIndex(
    a => a.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({ error: "Application not found" });
  }

  const app = storage.partnerApplications[index];

  // Check all requirements
  if (app.insuranceStatus !== "verified") {
    return res.status(400).json({ error: "Insurance not verified" });
  }

  if (app.identityStatus !== "verified") {
    return res.status(400).json({ error: "Identity not verified" });
  }

  if (app.referencesStatus !== "verified") {
    return res.status(400).json({ error: "References not verified" });
  }

  if (app.trainingStatus !== "complete") {
    return res.status(400).json({ error: "Training not completed" });
  }

  if (!app.agreementSignedAt) {
    return res.status(400).json({ error: "Agreement not signed" });
  }

  storage.partnerApplications[index].status = "partner_active";
  storage.partnerApplications[index].activatedAt = new Date();
  storage.partnerApplications[index].updatedAt = new Date();

  res.json(storage.partnerApplications[index]);
});

// Reject application (admin)
router.post("/admin/applications/:id/reject", (req, res) => {
  const index = storage.partnerApplications.findIndex(
    a => a.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({ error: "Application not found" });
  }

  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({ error: "Rejection reason is required" });
  }

  storage.partnerApplications[index].status = "rejected";
  storage.partnerApplications[index].adminNotes =
    (storage.partnerApplications[index].adminNotes || "") + `\nRejection reason: ${reason}`;
  storage.partnerApplications[index].updatedAt = new Date();

  res.json(storage.partnerApplications[index]);
});

export default router;
