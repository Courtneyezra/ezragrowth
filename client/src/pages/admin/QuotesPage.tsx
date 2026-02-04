import { useQuery } from "@tanstack/react-query";
import { FileText, Eye, Calendar, ExternalLink } from "lucide-react";

interface Quote {
  id: string;
  shortSlug: string;
  customerName: string;
  phone: string;
  jobDescription: string;
  basePrice: number | null;
  essentialPrice: number | null;
  viewCount: number;
  selectedPackage: string | null;
  bookedAt: string | null;
  createdAt: string;
}

export default function QuotesPage() {
  const { data: quotes, isLoading } = useQuery<Quote[]>({
    queryKey: ["quotes"],
    queryFn: () => fetch("/api/quotes").then((r) => r.json()),
  });

  const getStatusBadge = (quote: Quote) => {
    if (quote.bookedAt) {
      return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">Booked</span>;
    }
    if (quote.selectedPackage) {
      return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">Selected</span>;
    }
    if (quote.viewCount > 0) {
      return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">Viewed</span>;
    }
    return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">Sent</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Quotes</h1>
        <a
          href="/admin/generate-quote"
          className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition"
        >
          Generate Quote
        </a>
      </div>

      {isLoading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-4">
          {quotes?.map((quote) => (
            <div
              key={quote.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold">{quote.customerName}</h3>
                    {getStatusBadge(quote)}
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{quote.jobDescription}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {quote.viewCount} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {quote.basePrice
                      ? `£${(quote.basePrice / 100).toFixed(0)}`
                      : quote.essentialPrice
                      ? `from £${(quote.essentialPrice / 100).toFixed(0)}`
                      : "TBD"}
                  </p>
                  <a
                    href={`/quote/${quote.shortSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-yellow-500 hover:text-yellow-400 text-sm mt-2"
                  >
                    View Quote <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
          {(!quotes || quotes.length === 0) && (
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No quotes generated yet</p>
              <a
                href="/admin/generate-quote"
                className="inline-block mt-4 text-yellow-500 hover:underline"
              >
                Generate your first quote
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
