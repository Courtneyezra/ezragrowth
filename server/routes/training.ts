import { Router } from "express";
import { storage, TrainingModule, TrainingProgress } from "../storage";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Seed default training modules on startup
function seedTrainingModules() {
  if (storage.trainingModules.length > 0) return;

  const modules: TrainingModule[] = [
    {
      id: uuidv4(),
      slug: "customer-service-excellence",
      title: "Customer Service Excellence",
      description: "Learn how to provide exceptional customer service and build lasting client relationships.",
      durationMinutes: 10,
      videoUrl: null, // Would be set to actual video URL
      thumbnailUrl: null,
      quizQuestions: [
        {
          question: "What should you do when arriving at a customer's property?",
          options: [
            "Just start working immediately",
            "Introduce yourself, confirm the job, and ask about any specific requirements",
            "Call your office first",
            "Wait for the customer to approach you",
          ],
          correctIndex: 1,
        },
        {
          question: "How should you handle a customer complaint?",
          options: [
            "Ignore it and continue working",
            "Argue with the customer",
            "Listen actively, acknowledge their concern, and work towards a solution",
            "Tell them to contact the office",
          ],
          correctIndex: 2,
        },
        {
          question: "What's the best way to keep customers informed about job progress?",
          options: [
            "Only contact them if there's a problem",
            "Send regular updates and proactively communicate any changes",
            "Wait for them to ask",
            "Post on social media",
          ],
          correctIndex: 1,
        },
        {
          question: "When should you confirm appointment details with customers?",
          options: [
            "Never, they should remember",
            "Only if they ask",
            "The day before the appointment",
            "After you arrive",
          ],
          correctIndex: 2,
        },
        {
          question: "How do you handle a situation where the job takes longer than expected?",
          options: [
            "Just finish without saying anything",
            "Leave mid-job",
            "Inform the customer as soon as you know, explain why, and discuss options",
            "Add extra charges without notice",
          ],
          correctIndex: 2,
        },
      ],
      passThreshold: 80,
      orderIndex: 1,
      isRequired: true,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: uuidv4(),
      slug: "health-safety-basics",
      title: "Health & Safety Basics",
      description: "Essential health and safety practices for working in customer properties.",
      durationMinutes: 10,
      videoUrl: null,
      thumbnailUrl: null,
      quizQuestions: [
        {
          question: "What should you check before starting work at a property?",
          options: [
            "Just the TV schedule",
            "Potential hazards, access routes, and location of utilities",
            "Only the parking situation",
            "Nothing specific",
          ],
          correctIndex: 1,
        },
        {
          question: "When working at height, what is essential?",
          options: [
            "Working as fast as possible",
            "Using appropriate ladders/platforms and following safe access procedures",
            "Having someone hold the ladder casually",
            "Not telling anyone what you're doing",
          ],
          correctIndex: 1,
        },
        {
          question: "How should you handle electrical work safety?",
          options: [
            "Just be careful",
            "Always isolate circuits, use insulated tools, and test before touching",
            "Work quickly so there's less risk",
            "Only worry about main power",
          ],
          correctIndex: 1,
        },
        {
          question: "What PPE is essential for most trade work?",
          options: [
            "Just gloves",
            "Appropriate safety boots, eye protection, gloves as needed for the task",
            "A hard hat at all times",
            "Nothing if you're experienced",
          ],
          correctIndex: 1,
        },
        {
          question: "What should you do if you discover asbestos or suspect its presence?",
          options: [
            "Remove it yourself carefully",
            "Ignore it and work around it",
            "Stop work immediately, inform the customer, and recommend professional assessment",
            "Cover it with paint",
          ],
          correctIndex: 2,
        },
      ],
      passThreshold: 80,
      orderIndex: 2,
      isRequired: true,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: uuidv4(),
      slug: "handy-standards",
      title: "The Handy Standards",
      description: "Learn about Handy Services quality standards and what it means to be a partner.",
      durationMinutes: 10,
      videoUrl: null,
      thumbnailUrl: null,
      quizQuestions: [
        {
          question: "What is the Handy partner commission rate on sourced jobs?",
          options: ["5-10%", "10-15%", "15-20%", "25-30%"],
          correctIndex: 2,
        },
        {
          question: "What benefit does the 'Handy Verified' badge provide?",
          options: [
            "Nothing specific",
            "Builds trust with customers and shows professional accreditation",
            "Only looks nice on the profile",
            "Gets you free tools",
          ],
          correctIndex: 1,
        },
        {
          question: "How quickly should you respond to job inquiries from Handy?",
          options: [
            "Within a week",
            "When you have time",
            "Within 2 hours during business hours",
            "Only on weekdays",
          ],
          correctIndex: 2,
        },
        {
          question: "What should you wear when representing Handy on a job?",
          options: [
            "Casual clothes",
            "Your Handy branded high-vis and professional attire",
            "Whatever is comfortable",
            "A suit and tie",
          ],
          correctIndex: 1,
        },
        {
          question: "What happens if you consistently receive poor customer reviews?",
          options: [
            "Nothing",
            "A warning email",
            "Potential review of partner status and possible removal from the network",
            "Automatic dismissal",
          ],
          correctIndex: 2,
        },
      ],
      passThreshold: 80,
      orderIndex: 3,
      isRequired: true,
      isActive: true,
      createdAt: new Date(),
    },
  ];

  storage.trainingModules.push(...modules);
}

// Seed modules on router load
seedTrainingModules();

// ==========================================
// TRAINING MODULES (Public/Contractor)
// ==========================================

// Get all training modules
router.get("/modules", (req, res) => {
  const modules = storage.trainingModules
    .filter(m => m.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  res.json(modules);
});

// Get single module
router.get("/modules/:slug", (req, res) => {
  const module = storage.trainingModules.find(
    m => m.slug === req.params.slug && m.isActive
  );

  if (!module) {
    return res.status(404).json({ error: "Module not found" });
  }

  res.json(module);
});

// ==========================================
// TRAINING PROGRESS (Contractor)
// ==========================================

// Get all progress for a contractor
router.get("/progress/:contractorId", (req, res) => {
  const progress = storage.trainingProgress.filter(
    p => p.contractorId === req.params.contractorId
  );

  const modules = storage.trainingModules.filter(m => m.isActive);

  // Build a complete progress report
  const report = modules.map(module => {
    const moduleProgress = progress.find(p => p.moduleId === module.id);
    return {
      moduleId: module.id,
      slug: module.slug,
      title: module.title,
      orderIndex: module.orderIndex,
      isRequired: module.isRequired,
      status: moduleProgress
        ? moduleProgress.passed
          ? "completed"
          : moduleProgress.startedAt
            ? "in_progress"
            : "not_started"
        : "not_started",
      startedAt: moduleProgress?.startedAt || null,
      videoWatchedAt: moduleProgress?.videoWatchedAt || null,
      completedAt: moduleProgress?.completedAt || null,
      quizScore: moduleProgress?.quizScore || null,
      passed: moduleProgress?.passed || false,
      attempts: moduleProgress?.attempts || 0,
    };
  });

  // Calculate overall completion
  const requiredModules = report.filter(r => r.isRequired);
  const completedRequired = requiredModules.filter(r => r.passed);
  const allComplete = completedRequired.length === requiredModules.length;

  res.json({
    modules: report,
    summary: {
      totalModules: modules.length,
      completedModules: report.filter(r => r.passed).length,
      requiredModules: requiredModules.length,
      completedRequired: completedRequired.length,
      allComplete,
    },
  });
});

// Start a module
router.post("/progress/:contractorId/start/:moduleId", (req, res) => {
  const module = storage.trainingModules.find(m => m.id === req.params.moduleId);

  if (!module) {
    return res.status(404).json({ error: "Module not found" });
  }

  // Check if progress already exists
  let progressIndex = storage.trainingProgress.findIndex(
    p =>
      p.contractorId === req.params.contractorId &&
      p.moduleId === req.params.moduleId
  );

  if (progressIndex === -1) {
    // Create new progress
    const progress: TrainingProgress = {
      id: uuidv4(),
      contractorId: req.params.contractorId,
      moduleId: req.params.moduleId,
      startedAt: new Date(),
      videoWatchedAt: null,
      completedAt: null,
      quizScore: null,
      passed: false,
      attempts: 0,
      createdAt: new Date(),
    };
    storage.trainingProgress.push(progress);
    return res.status(201).json(progress);
  }

  // Return existing progress
  res.json(storage.trainingProgress[progressIndex]);
});

// Mark video as watched
router.post("/progress/:contractorId/video-complete/:moduleId", (req, res) => {
  const progressIndex = storage.trainingProgress.findIndex(
    p =>
      p.contractorId === req.params.contractorId &&
      p.moduleId === req.params.moduleId
  );

  if (progressIndex === -1) {
    return res.status(404).json({ error: "Progress not found. Start the module first." });
  }

  storage.trainingProgress[progressIndex].videoWatchedAt = new Date();

  res.json(storage.trainingProgress[progressIndex]);
});

// Submit quiz answers
router.post("/progress/:contractorId/quiz/:moduleId", (req, res) => {
  const module = storage.trainingModules.find(m => m.id === req.params.moduleId);

  if (!module) {
    return res.status(404).json({ error: "Module not found" });
  }

  const progressIndex = storage.trainingProgress.findIndex(
    p =>
      p.contractorId === req.params.contractorId &&
      p.moduleId === req.params.moduleId
  );

  if (progressIndex === -1) {
    return res.status(404).json({ error: "Progress not found. Start the module first." });
  }

  const { answers } = req.body; // Array of answer indices

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: "Answers array is required" });
  }

  const questions = module.quizQuestions as Array<{
    question: string;
    options: string[];
    correctIndex: number;
  }>;

  if (answers.length !== questions.length) {
    return res.status(400).json({
      error: `Expected ${questions.length} answers, got ${answers.length}`,
    });
  }

  // Calculate score
  let correct = 0;
  const results = questions.map((q, i) => {
    const isCorrect = answers[i] === q.correctIndex;
    if (isCorrect) correct++;
    return {
      question: q.question,
      yourAnswer: answers[i],
      correctAnswer: q.correctIndex,
      isCorrect,
    };
  });

  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= module.passThreshold;

  // Update progress
  storage.trainingProgress[progressIndex].quizScore = score;
  storage.trainingProgress[progressIndex].passed = passed;
  storage.trainingProgress[progressIndex].attempts++;
  storage.trainingProgress[progressIndex].completedAt = passed ? new Date() : null;

  // Check if all required modules are now complete
  if (passed) {
    updateOverallTrainingStatus(req.params.contractorId);
  }

  res.json({
    score,
    passed,
    passThreshold: module.passThreshold,
    correct,
    total: questions.length,
    results,
    canRetry: !passed,
  });
});

// Helper to update overall training status in partner application
function updateOverallTrainingStatus(contractorId: string) {
  const requiredModules = storage.trainingModules.filter(
    m => m.isActive && m.isRequired
  );

  const progress = storage.trainingProgress.filter(
    p => p.contractorId === contractorId
  );

  const allPassed = requiredModules.every(module =>
    progress.some(p => p.moduleId === module.id && p.passed)
  );

  if (allPassed) {
    const appIndex = storage.partnerApplications.findIndex(
      a => a.contractorId === contractorId
    );

    if (appIndex !== -1) {
      storage.partnerApplications[appIndex].trainingStatus = "complete";
      storage.partnerApplications[appIndex].trainingCompletedAt = new Date();

      // Update overall status if applicable
      if (storage.partnerApplications[appIndex].status === "training_incomplete") {
        storage.partnerApplications[appIndex].status = "training_complete";
      }

      storage.partnerApplications[appIndex].updatedAt = new Date();
    }
  }
}

// Reset quiz attempts (for retrying)
router.post("/progress/:contractorId/reset/:moduleId", (req, res) => {
  const progressIndex = storage.trainingProgress.findIndex(
    p =>
      p.contractorId === req.params.contractorId &&
      p.moduleId === req.params.moduleId
  );

  if (progressIndex === -1) {
    return res.status(404).json({ error: "Progress not found" });
  }

  // Only reset if not passed (don't let people "un-pass")
  if (storage.trainingProgress[progressIndex].passed) {
    return res.status(400).json({ error: "Cannot reset a passed module" });
  }

  storage.trainingProgress[progressIndex].quizScore = null;

  res.json(storage.trainingProgress[progressIndex]);
});

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

// Get all modules (admin - includes inactive)
router.get("/admin/modules", (req, res) => {
  const modules = storage.trainingModules.sort((a, b) => a.orderIndex - b.orderIndex);
  res.json(modules);
});

// Create module (admin)
router.post("/admin/modules", (req, res) => {
  const {
    slug,
    title,
    description,
    durationMinutes,
    videoUrl,
    thumbnailUrl,
    quizQuestions,
    passThreshold,
    orderIndex,
    isRequired,
  } = req.body;

  if (!slug || !title) {
    return res.status(400).json({ error: "Slug and title are required" });
  }

  // Check slug uniqueness
  if (storage.trainingModules.some(m => m.slug === slug)) {
    return res.status(400).json({ error: "Slug already exists" });
  }

  const module: TrainingModule = {
    id: uuidv4(),
    slug,
    title,
    description: description || null,
    durationMinutes: durationMinutes || 10,
    videoUrl: videoUrl || null,
    thumbnailUrl: thumbnailUrl || null,
    quizQuestions: quizQuestions || [],
    passThreshold: passThreshold || 80,
    orderIndex: orderIndex || storage.trainingModules.length + 1,
    isRequired: isRequired !== false,
    isActive: true,
    createdAt: new Date(),
  };

  storage.trainingModules.push(module);
  res.status(201).json(module);
});

// Update module (admin)
router.put("/admin/modules/:id", (req, res) => {
  const index = storage.trainingModules.findIndex(m => m.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Module not found" });
  }

  const updates = req.body;

  // Check slug uniqueness if changing
  if (
    updates.slug &&
    updates.slug !== storage.trainingModules[index].slug &&
    storage.trainingModules.some(m => m.slug === updates.slug)
  ) {
    return res.status(400).json({ error: "Slug already exists" });
  }

  storage.trainingModules[index] = {
    ...storage.trainingModules[index],
    ...updates,
  };

  res.json(storage.trainingModules[index]);
});

// Toggle module active status (admin)
router.post("/admin/modules/:id/toggle-active", (req, res) => {
  const index = storage.trainingModules.findIndex(m => m.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Module not found" });
  }

  storage.trainingModules[index].isActive = !storage.trainingModules[index].isActive;

  res.json(storage.trainingModules[index]);
});

// Get training stats for all contractors (admin)
router.get("/admin/stats", (req, res) => {
  const contractors = new Set(storage.trainingProgress.map(p => p.contractorId));

  const stats = {
    totalContractorsStarted: contractors.size,
    totalModulesCompleted: storage.trainingProgress.filter(p => p.passed).length,
    moduleStats: storage.trainingModules.map(module => {
      const progress = storage.trainingProgress.filter(p => p.moduleId === module.id);
      return {
        moduleId: module.id,
        slug: module.slug,
        title: module.title,
        started: progress.length,
        completed: progress.filter(p => p.passed).length,
        averageScore:
          progress.filter(p => p.quizScore !== null).length > 0
            ? Math.round(
                progress
                  .filter(p => p.quizScore !== null)
                  .reduce((sum, p) => sum + (p.quizScore || 0), 0) /
                  progress.filter(p => p.quizScore !== null).length
              )
            : 0,
        averageAttempts:
          progress.length > 0
            ? Math.round(
                (progress.reduce((sum, p) => sum + p.attempts, 0) / progress.length) * 10
              ) / 10
            : 0,
      };
    }),
  };

  res.json(stats);
});

export default router;
