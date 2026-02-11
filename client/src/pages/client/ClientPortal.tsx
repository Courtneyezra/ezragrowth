import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import {
  FileText,
  Receipt,
  Briefcase,
  Star,
  Calendar,
  CheckCircle,
  Clock,
  ChevronRight,
} from "lucide-react";

interface ClientHistory {
  quotes: Array<{
    id: string;
    slug: string;
    jobDescription: string;
    selectedPackage: string | null;
    status: string;
    createdAt: string;
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    balanceDue: number;
    status: string;
    createdAt: string;
  }>;
  jobs: Array<{
    id: string;
    jobDescription: string | null;
    status: string;
    scheduledDate: string | null;
    completedAt: string | null;
  }>;
}

export default function ClientPortal() {
  const { email } = useParams<{ email: string }>();

  const { data, isLoading, error } = useQuery<ClientHistory>({
    queryKey: ["client-history", email],
    queryFn: () =>
      fetch(`/api/client-portal/history?email=${encodeURIComponent(email || "")}`).then(
        (r) => {
          if (!r.ok) throw new Error("Could not load history");
          return r.json();
        }
      ),
    enabled: !!email,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Loading your history...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-md text-center">
          <h1 className="text-xl font-semibold text-white mb-2">
            No History Found
          </h1>
          <p className="text-gray-400">
            We couldn't find any records for this email address.
          </p>
        </div>
      </div>
    );
  }

  const hasNoData =
    data.quotes.length === 0 &&
    data.invoices.length === 0 &&
    data.jobs.length === 0;

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Your History</h1>
          <p className="text-gray-400">View your quotes, invoices, and job history.</p>
        </div>

        {hasNoData ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
            <Briefcase className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">No History Yet</h2>
            <p className="text-gray-400">
              Once you receive quotes or complete jobs, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quotes Section */}
            {data.quotes.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-yellow-500" />
                  Quotes ({data.quotes.length})
                </h2>
                <div className="bg-gray-800 rounded-xl border border-gray-700 divide-y divide-gray-700">
                  {data.quotes.map((quote) => (
                    <Link
                      key={quote.id}
                      href={`/quote/${quote.slug}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium line-clamp-1">
                          {quote.jobDescription}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(quote.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <QuoteStatusBadge
                          status={quote.status}
                          selectedPackage={quote.selectedPackage}
                        />
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Invoices Section */}
            {data.invoices.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-yellow-500" />
                  Invoices ({data.invoices.length})
                </h2>
                <div className="bg-gray-800 rounded-xl border border-gray-700 divide-y divide-gray-700">
                  {data.invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium font-mono">
                          #{invoice.invoiceNumber}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(invoice.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-white font-medium">
                            £{(invoice.totalAmount / 100).toFixed(2)}
                          </p>
                          {invoice.balanceDue > 0 && (
                            <p className="text-xs text-yellow-500">
                              £{(invoice.balanceDue / 100).toFixed(2)} due
                            </p>
                          )}
                        </div>
                        <InvoiceStatusBadge status={invoice.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Jobs Section */}
            {data.jobs.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-yellow-500" />
                  Jobs ({data.jobs.length})
                </h2>
                <div className="bg-gray-800 rounded-xl border border-gray-700 divide-y divide-gray-700">
                  {data.jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {job.jobDescription || "Job"}
                        </p>
                        {job.scheduledDate && (
                          <p className="text-sm text-gray-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(job.scheduledDate).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                      <JobStatusBadge status={job.status} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Leave Review CTA */}
        <div className="mt-8 bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 rounded-xl border border-yellow-500/30 p-6 text-center">
          <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            How was your experience?
          </h3>
          <p className="text-gray-400 mb-4">
            Your feedback helps others find great contractors.
          </p>
          <button className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition-colors">
            Leave a Review
          </button>
        </div>
      </div>
    </div>
  );
}

function QuoteStatusBadge({
  status,
  selectedPackage,
}: {
  status: string;
  selectedPackage: string | null;
}) {
  if (selectedPackage) {
    return (
      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Accepted
      </span>
    );
  }

  switch (status) {
    case "pending":
      return (
        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
    default:
      return null;
  }
}

function InvoiceStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "draft":
      return (
        <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">
          Draft
        </span>
      );
    case "sent":
      return (
        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
          Pending
        </span>
      );
    case "paid":
      return (
        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Paid
        </span>
      );
    case "overdue":
      return (
        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
          Overdue
        </span>
      );
    default:
      return null;
  }
}

function JobStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">
          Pending
        </span>
      );
    case "accepted":
      return (
        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
          Scheduled
        </span>
      );
    case "in_progress":
      return (
        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
          In Progress
        </span>
      );
    case "completed":
      return (
        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Completed
        </span>
      );
    default:
      return null;
  }
}
