import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { Loader2 } from "lucide-react";

// Landing page - eager loaded for fast LCP
import HandymanLanding from "@/pages/HandymanLanding";

// Admin pages - lazy loaded
const MainDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const SKUPage = lazy(() => import("@/pages/admin/SKUPage"));
const CallsPage = lazy(() => import("@/pages/admin/CallsPage"));
const QuotesPage = lazy(() => import("@/pages/admin/QuotesPage"));
const GenerateQuote = lazy(() => import("@/pages/admin/GenerateQuoteLinkSimple"));
const InvoicesPage = lazy(() => import("@/pages/admin/InvoicesPage"));
const MarketingPage = lazy(() => import("@/pages/admin/MarketingPage"));
const MasterAvailabilityPage = lazy(() => import("@/pages/admin/MasterAvailabilityPage"));
const ContractorCalendarPage = lazy(() => import("@/pages/contractor/CalendarPage"));
const QuoteView = lazy(() => import("@/pages/QuoteView"));

// Pitch/Sales Pages
const PitchIndex = lazy(() => import("@/pages/pitch/PitchIndex"));
const CustomerJourney = lazy(() => import("@/pages/pitch/CustomerJourney"));
const ROICalculator = lazy(() => import("@/pages/pitch/ROICalculator"));
const Roadmap = lazy(() => import("@/pages/pitch/Roadmap"));
const CompetitorAnalysis = lazy(() => import("@/pages/pitch/CompetitorAnalysis"));

// Proposal Pages
const RooketradeProposal = lazy(() => import("@/pages/proposal/RooketradeProposal"));

// Loading fallback
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* Public Routes */}
        <Route path="/landing">
          <HandymanLanding />
        </Route>
        <Route path="/quote/:slug" component={QuoteView} />

        {/* Pitch/Sales Presentation Pages */}
        <Route path="/pitch" component={PitchIndex} />
        <Route path="/pitch/journey" component={CustomerJourney} />
        <Route path="/pitch/roi" component={ROICalculator} />
        <Route path="/pitch/roadmap" component={Roadmap} />
        <Route path="/pitch/competitors" component={CompetitorAnalysis} />

        {/* Proposal Pages */}
        <Route path="/proposal/rooketrade" component={RooketradeProposal} />

        {/* Admin Routes */}
        <Route path="/admin">
          <SidebarLayout>
            <MainDashboard />
          </SidebarLayout>
        </Route>
        <Route path="/admin/calls">
          <SidebarLayout>
            <CallsPage />
          </SidebarLayout>
        </Route>
        <Route path="/admin/quotes">
          <SidebarLayout>
            <QuotesPage />
          </SidebarLayout>
        </Route>
        <Route path="/admin/generate-quote">
          <SidebarLayout>
            <GenerateQuote />
          </SidebarLayout>
        </Route>
        <Route path="/admin/invoices">
          <SidebarLayout>
            <InvoicesPage />
          </SidebarLayout>
        </Route>
        <Route path="/admin/skus">
          <SidebarLayout>
            <SKUPage />
          </SidebarLayout>
        </Route>
        <Route path="/admin/marketing">
          <SidebarLayout>
            <MarketingPage />
          </SidebarLayout>
        </Route>
        <Route path="/admin/availability">
          <SidebarLayout>
            <MasterAvailabilityPage />
          </SidebarLayout>
        </Route>

        {/* Contractor Routes */}
        <Route path="/contractor/calendar">
          <ContractorCalendarPage />
        </Route>

        {/* Default redirect */}
        <Route path="/">
          {() => {
            window.location.href = '/landing';
            return null;
          }}
        </Route>

        {/* 404 */}
        <Route>
          <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-muted-foreground">Page not found</p>
              <a href="/admin" className="mt-4 inline-block text-primary hover:underline">
                Go to Dashboard
              </a>
            </div>
          </div>
        </Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
