import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Zap, Check, Phone, Calendar, Clock } from "lucide-react";

interface Quote {
  id: string;
  shortSlug: string;
  customerName: string;
  phone: string;
  jobDescription: string;
  quoteMode: string;
  basePrice: number | null;
  essentialPrice: number | null;
  enhancedPrice: number | null;
  elitePrice: number | null;
  selectedPackage: string | null;
  expiresAt: string | null;
}

export default function QuoteView() {
  const params = useParams<{ slug: string }>();

  const { data: quote, isLoading, error } = useQuery<Quote>({
    queryKey: ["quote", params.slug],
    queryFn: () => fetch(`/api/quotes/link/${params.slug}`).then((r) => r.json()),
    enabled: !!params.slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Zap className="h-12 w-12 text-yellow-500 animate-pulse" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Quote Not Found</h1>
          <p className="text-gray-400">This quote may have expired or doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isExpired = quote.expiresAt && new Date(quote.expiresAt) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            <span className="text-xl font-bold text-white">Rooketrade Electrical</span>
          </div>
          <a
            href="tel:01onal"
            className="flex items-center gap-2 bg-yellow-500 text-gray-900 px-4 py-2 rounded-full font-semibold hover:bg-yellow-400 transition"
          >
            <Phone className="h-4 w-4" />
            Call Us
          </a>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Personalized Greeting */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Hi {quote.customerName.split(" ")[0]}!
          </h1>
          <p className="text-xl text-gray-300">
            Here's your personalized quote
          </p>
        </div>

        {isExpired && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-center">
            <p className="text-red-400">This quote has expired. Please contact us for a new quote.</p>
          </div>
        )}

        {/* Job Description */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-3">Your Job</h2>
            <p className="text-gray-300">{quote.jobDescription}</p>
          </div>
        </div>

        {/* Pricing */}
        {quote.quoteMode === "simple" && quote.basePrice ? (
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-8 text-center">
              <p className="text-gray-900 font-medium mb-2">Your Quote</p>
              <p className="text-5xl font-bold text-gray-900 mb-4">
                £{(quote.basePrice / 100).toFixed(0)}
              </p>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center gap-2 text-gray-900">
                  <Check className="h-5 w-5" />
                  Professional installation
                </li>
                <li className="flex items-center gap-2 text-gray-900">
                  <Check className="h-5 w-5" />
                  All materials included
                </li>
                <li className="flex items-center gap-2 text-gray-900">
                  <Check className="h-5 w-5" />
                  12-month workmanship guarantee
                </li>
              </ul>
              <button
                disabled={isExpired}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExpired ? "Quote Expired" : "Book This Quote"}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            {/* Essential */}
            {quote.essentialPrice && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Essential</h3>
                <p className="text-3xl font-bold text-white mb-4">
                  £{(quote.essentialPrice / 100).toFixed(0)}
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Standard installation
                  </li>
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Basic materials
                  </li>
                </ul>
                <button
                  disabled={isExpired}
                  className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Select Essential
                </button>
              </div>
            )}

            {/* Enhanced */}
            {quote.enhancedPrice && (
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-yellow-500 px-4 py-1 rounded-full text-sm font-medium">
                  Recommended
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Enhanced</h3>
                <p className="text-3xl font-bold text-gray-900 mb-4">
                  £{(quote.enhancedPrice / 100).toFixed(0)}
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-gray-900 text-sm">
                    <Check className="h-4 w-4" />
                    Premium installation
                  </li>
                  <li className="flex items-center gap-2 text-gray-900 text-sm">
                    <Check className="h-4 w-4" />
                    Quality materials
                  </li>
                  <li className="flex items-center gap-2 text-gray-900 text-sm">
                    <Check className="h-4 w-4" />
                    Priority scheduling
                  </li>
                </ul>
                <button
                  disabled={isExpired}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
                >
                  Select Enhanced
                </button>
              </div>
            )}

            {/* Elite */}
            {quote.elitePrice && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Elite</h3>
                <p className="text-3xl font-bold text-white mb-4">
                  £{(quote.elitePrice / 100).toFixed(0)}
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Premium installation
                  </li>
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Top-tier materials
                  </li>
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Extended warranty
                  </li>
                  <li className="flex items-center gap-2 text-gray-300 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Same-day service
                  </li>
                </ul>
                <button
                  disabled={isExpired}
                  className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Select Elite
                </button>
              </div>
            )}
          </div>
        )}

        {/* Trust Badges */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div className="flex justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Fully Insured
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              NICEIC Registered
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              5-Star Rated
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700 mt-12 py-6">
        <div className="container mx-auto px-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Rooketrade Electrical</p>
        </div>
      </footer>
    </div>
  );
}
