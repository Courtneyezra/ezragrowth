// In-memory storage for local development
import { v4 as uuidv4 } from "uuid";

export interface SKU {
  id: string;
  skuCode: string;
  name: string;
  description: string;
  pricePence: number;
  timeEstimateMinutes: number;
  keywords: string[];
  category: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Lead {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  address: string | null;
  postcode: string | null;
  jobDescription: string | null;
  status: string;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Call {
  id: string;
  callId: string;
  phoneNumber: string;
  customerName: string | null;
  startTime: Date;
  direction: string;
  status: string;
  duration: number | null;
  outcome: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface Quote {
  id: string;
  shortSlug: string;
  customerName: string;
  phone: string;
  email: string | null;
  postcode: string | null;
  address: string | null;
  jobDescription: string;
  segment: string;
  quoteMode: string;
  urgencyReason: string;
  ownershipContext: string;
  desiredTimeframe: string;
  baseJobPricePence: number;
  valueMultiplier100: number;
  essentialPrice: number;
  enhancedPrice: number;
  elitePrice: number;
  optionalExtras: unknown;
  additionalNotes: string | null;
  recommendedTier: string;
  tierDeliverables: unknown;
  viewedAt: Date | null;
  viewCount: number;
  selectedPackage: string | null;
  selectedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  // Scheduling fields (Phase 3)
  selectedDate?: Date | null;
  schedulingTier?: string | null;
  timeSlotType?: string | null;
  exactTimeRequested?: string | null;
  schedulingFeeInPence?: number | null;
  isWeekendBooking?: boolean;
  selectedTierPricePence?: number | null;
}

export interface Job {
  id: string;
  quoteId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  address: string | null;
  postcode: string | null;
  jobDescription: string | null;
  status: string;
  scheduledDate: Date | null;
  scheduledTime: string | null;
  pricePence: number | null;
  completedAt: Date | null;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  totalAmount: number;
  depositPaid: number;
  balanceDue: number;
  lineItems: unknown;
  status: string;
  dueDate: Date | null;
  sentAt: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LandingPage {
  id: number;
  slug: string;
  name: string;
  isActive: boolean;
  content: unknown;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Link for instant payments
export interface PaymentLink {
  id: string;
  contractorId: string;
  quoteId: string | null;
  invoiceId: string | null;
  shortCode: string;
  amountPence: number;
  description: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  status: string; // 'active' | 'paid' | 'expired' | 'cancelled'
  stripePaymentIntentId: string | null;
  expiresAt: Date | null;
  paidAt: Date | null;
  paidByEmail: string | null;
  createdAt: Date;
}

// Partner Application for accreditation
export interface PartnerApplication {
  id: string;
  contractorId: string;
  status: string;
  insuranceStatus: string;
  insuranceDocumentUrl: string | null;
  insurancePolicyNumber: string | null;
  insuranceExpiryDate: Date | null;
  insuranceVerifiedAt: Date | null;
  identityStatus: string;
  identityDocumentUrl: string | null;
  dbsCertificateUrl: string | null;
  identityVerifiedAt: Date | null;
  referencesStatus: string;
  referencesVerifiedAt: Date | null;
  trainingStatus: string;
  trainingCompletedAt: Date | null;
  agreementSignedAt: Date | null;
  highvisSize: string | null;
  activatedAt: Date | null;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Client Reference for partner verification
export interface ClientReference {
  id: string;
  applicationId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  jobDescription: string | null;
  requestSentAt: Date | null;
  requestToken: string | null;
  responseReceivedAt: Date | null;
  rating: number | null;
  feedback: string | null;
  wouldRecommend: boolean | null;
  verified: boolean;
  createdAt: Date;
}

// Training Module
export interface TrainingModule {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  quizQuestions: unknown; // Array of quiz questions
  passThreshold: number;
  orderIndex: number;
  isRequired: boolean;
  isActive: boolean;
  createdAt: Date;
}

// Training Progress
export interface TrainingProgress {
  id: string;
  contractorId: string;
  moduleId: string;
  startedAt: Date | null;
  videoWatchedAt: Date | null;
  completedAt: Date | null;
  quizScore: number | null;
  passed: boolean;
  attempts: number;
  createdAt: Date;
}

// Contractor Review
export interface ContractorReview {
  id: string;
  contractorId: string;
  customerName: string;
  customerEmail: string | null;
  quoteId: string | null;
  jobId: string | null;
  overallRating: number;
  qualityRating: number | null;
  timelinessRating: number | null;
  communicationRating: number | null;
  valueRating: number | null;
  reviewText: string | null;
  reviewToken: string | null;
  isVerified: boolean;
  isPublic: boolean;
  isFeatured: boolean;
  contractorResponse: string | null;
  respondedAt: Date | null;
  isApproved: boolean;
  createdAt: Date;
}

// Invoice Token for client portal
export interface InvoiceToken {
  id: string;
  invoiceId: string;
  token: string;
  viewCount: number;
  lastViewedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

// Contractor Subscription
export interface ContractorSubscription {
  id: string;
  contractorId: string;
  tier: string;
  partnerCommissionRate: number;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Storage
class Storage {
  skus: SKU[] = [];
  leads: Lead[] = [];
  calls: Call[] = [];
  quotes: Quote[] = [];
  jobs: Job[] = [];
  invoices: Invoice[] = [];
  landingPages: LandingPage[] = [];
  paymentLinks: PaymentLink[] = [];
  partnerApplications: PartnerApplication[] = [];
  clientReferences: ClientReference[] = [];
  trainingModules: TrainingModule[] = [];
  trainingProgress: TrainingProgress[] = [];
  contractorReviews: ContractorReview[] = [];
  invoiceTokens: InvoiceToken[] = [];
  contractorSubscriptions: ContractorSubscription[] = [];

  private landingPageIdCounter = 1;

  constructor() {
    // Seed with sample electrical services
    this.skus = [
      {
        id: uuidv4(),
        skuCode: "SOCKET-SINGLE",
        name: "Single Socket Installation",
        description: "Install a new single electrical socket",
        pricePence: 8500,
        timeEstimateMinutes: 60,
        keywords: ["socket", "plug", "outlet", "power point"],
        category: "electrical",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: uuidv4(),
        skuCode: "SOCKET-DOUBLE",
        name: "Double Socket Installation",
        description: "Install a new double electrical socket",
        pricePence: 9500,
        timeEstimateMinutes: 75,
        keywords: ["socket", "double socket", "plug", "outlet"],
        category: "electrical",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: uuidv4(),
        skuCode: "LIGHT-PENDANT",
        name: "Pendant Light Installation",
        description: "Install a pendant/ceiling light fixture",
        pricePence: 7500,
        timeEstimateMinutes: 45,
        keywords: ["light", "pendant", "ceiling light", "fixture"],
        category: "lighting",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: uuidv4(),
        skuCode: "FUSEBOX-UPGRADE",
        name: "Consumer Unit Upgrade",
        description: "Upgrade old fuse box to modern consumer unit",
        pricePence: 45000,
        timeEstimateMinutes: 480,
        keywords: ["fuse box", "consumer unit", "distribution board", "fusebox"],
        category: "safety",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: uuidv4(),
        skuCode: "EICR",
        name: "EICR Certificate",
        description: "Electrical Installation Condition Report",
        pricePence: 15000,
        timeEstimateMinutes: 180,
        keywords: ["eicr", "safety check", "inspection", "certificate"],
        category: "safety",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: uuidv4(),
        skuCode: "EV-CHARGER",
        name: "EV Charger Installation",
        description: "Electric vehicle charger installation",
        pricePence: 85000,
        timeEstimateMinutes: 360,
        keywords: ["ev", "electric vehicle", "charger", "car charger"],
        category: "ev",
        isActive: true,
        createdAt: new Date(),
      },
    ];
  }

  getNextLandingPageId(): number {
    return this.landingPageIdCounter++;
  }
}

export const storage = new Storage();
