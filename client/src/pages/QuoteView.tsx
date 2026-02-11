import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Zap, Check, Phone, Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { DatePricingCalendar } from "@/components/DatePricingCalendar";
import { useToast } from "@/hooks/use-toast";

interface Quote {
  id: string;
  shortSlug: string;
  customerName: string;
  phone: string;
  email?: string;
  postcode?: string;
  jobDescription: string;
  quoteMode: string;
  segment?: string;
  basePrice: number | null;
  essentialPrice: number | null;
  enhancedPrice: number | null;
  elitePrice: number | null;
  selectedPackage: string | null;
  selectedDate?: string | null;
  timeSlotType?: string | null;
  expiresAt: string | null;
  tierDeliverables?: {
    essential?: string[];
    hassleFree?: string[];
    highStandard?: string[];
  };
}

type BookingStep = "select-package" | "select-date" | "confirm";

export default function QuoteView() {
  const params = useParams<{ slug: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<BookingStep>("select-package");
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<"am" | "pm" | "full" | null>(null);

  const { data: quote, isLoading, error } = useQuery<Quote>({
    queryKey: ["quote", params.slug],
    queryFn: () => fetch(`/api/quotes/link/${params.slug}`).then((r) => r.json()),
    enabled: !!params.slug,
  });

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (data: {
      selectedPackage: string;
      selectedDate: string;
      timeSlotType: string;
    }) => {
      const response = await fetch(`/api/quotes/${quote?.id}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to book");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quote", params.slug] });
      toast({
        title: "Booking Confirmed!",
        description: "We'll be in touch shortly to confirm your appointment.",
      });
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
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
  const isBooked = !!quote.selectedPackage;

  // Handle package selection
  const handleSelectPackage = (pkg: string) => {
    setSelectedPackage(pkg);
    setStep("select-date");
  };

  // Handle date confirmation
  const handleConfirmDate = () => {
    if (!selectedDate || !selectedSlot) return;
    setStep("confirm");
  };

  // Handle final booking
  const handleConfirmBooking = () => {
    if (!selectedPackage || !selectedDate || !selectedSlot) return;

    bookingMutation.mutate({
      selectedPackage,
      selectedDate: format(selectedDate, "yyyy-MM-dd"),
      timeSlotType: selectedSlot,
    });
  };

  // Get deliverables for a tier
  const getDeliverables = (tier: string): string[] => {
    if (!quote.tierDeliverables) return [];
    switch (tier) {
      case "essential":
        return quote.tierDeliverables.essential || [];
      case "hassleFree":
        return quote.tierDeliverables.hassleFree || [];
      case "highStandard":
        return quote.tierDeliverables.highStandard || [];
      default:
        return [];
    }
  };

  // Get price for selected package
  const getSelectedPrice = (): number | null => {
    switch (selectedPackage) {
      case "essential":
        return quote.essentialPrice;
      case "hassleFree":
        return quote.enhancedPrice;
      case "highStandard":
        return quote.elitePrice;
      default:
        return null;
    }
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      <div
        className={`flex items-center gap-2 ${
          step === "select-package" ? "text-yellow-500" : "text-gray-500"
        }`}
      >
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === "select-package" ? "bg-yellow-500 text-gray-900" : "bg-gray-700"
          }`}
        >
          1
        </span>
        <span className="hidden md:inline">Choose Package</span>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-600" />
      <div
        className={`flex items-center gap-2 ${
          step === "select-date" ? "text-yellow-500" : "text-gray-500"
        }`}
      >
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === "select-date" ? "bg-yellow-500 text-gray-900" : "bg-gray-700"
          }`}
        >
          2
        </span>
        <span className="hidden md:inline">Pick Date</span>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-600" />
      <div
        className={`flex items-center gap-2 ${
          step === "confirm" ? "text-yellow-500" : "text-gray-500"
        }`}
      >
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === "confirm" ? "bg-yellow-500 text-gray-900" : "bg-gray-700"
          }`}
        >
          3
        </span>
        <span className="hidden md:inline">Confirm</span>
      </div>
    </div>
  );

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
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Hi {quote.customerName.split(" ")[0]}!
          </h1>
          <p className="text-xl text-gray-300">
            {isBooked ? "Your booking is confirmed" : "Here's your personalized quote"}
          </p>
        </div>

        {/* Expired Notice */}
        {isExpired && !isBooked && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-center">
            <p className="text-red-400">This quote has expired. Please contact us for a new quote.</p>
          </div>
        )}

        {/* Booked Confirmation */}
        {isBooked && (
          <div className="max-w-2xl mx-auto mb-8 p-6 bg-green-500/20 border border-green-500/50 rounded-xl text-center">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-white mb-2">Booking Confirmed!</h2>
            <p className="text-gray-300">
              You selected the <span className="font-semibold capitalize">{quote.selectedPackage}</span> package
              {quote.selectedDate && (
                <> for {format(new Date(quote.selectedDate), "EEEE, MMMM d, yyyy")}</>
              )}
            </p>
            <p className="text-gray-400 mt-2">We'll be in touch shortly to confirm your appointment.</p>
          </div>
        )}

        {/* Job Description */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-3">Your Job</h2>
            <p className="text-gray-300">{quote.jobDescription}</p>
          </div>
        </div>

        {/* Booking Flow (only if not expired and not booked) */}
        {!isExpired && !isBooked && (
          <>
            {renderStepIndicator()}

            {/* Step 1: Package Selection */}
            {step === "select-package" && (
              <>
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
                        onClick={() => handleSelectPackage("hassleFree")}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition"
                      >
                        Book This Quote
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
                          {getDeliverables("essential").length > 0 ? (
                            getDeliverables("essential").map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))
                          ) : (
                            <>
                              <li className="flex items-center gap-2 text-gray-300 text-sm">
                                <Check className="h-4 w-4 text-green-500" />
                                Standard installation
                              </li>
                              <li className="flex items-center gap-2 text-gray-300 text-sm">
                                <Check className="h-4 w-4 text-green-500" />
                                Basic materials
                              </li>
                            </>
                          )}
                        </ul>
                        <button
                          onClick={() => handleSelectPackage("essential")}
                          className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                        >
                          Select Essential
                        </button>
                      </div>
                    )}

                    {/* Enhanced (Recommended) */}
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
                          {getDeliverables("hassleFree").length > 0 ? (
                            getDeliverables("hassleFree").map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-gray-900 text-sm">
                                <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))
                          ) : (
                            <>
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
                            </>
                          )}
                        </ul>
                        <button
                          onClick={() => handleSelectPackage("hassleFree")}
                          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
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
                          {getDeliverables("highStandard").length > 0 ? (
                            getDeliverables("highStandard").map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))
                          ) : (
                            <>
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
                            </>
                          )}
                        </ul>
                        <button
                          onClick={() => handleSelectPackage("highStandard")}
                          className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                        >
                          Select Elite
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Step 2: Date Selection */}
            {step === "select-date" && (
              <div className="max-w-md mx-auto">
                <div className="mb-6 text-center">
                  <p className="text-gray-400">
                    Selected:{" "}
                    <span className="text-white font-medium capitalize">{selectedPackage}</span>
                    {" - "}
                    <span className="text-yellow-500 font-bold">
                      £{((getSelectedPrice() || 0) / 100).toFixed(0)}
                    </span>
                  </p>
                </div>

                <DatePricingCalendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  selectedSlot={selectedSlot || undefined}
                  onSelectSlot={setSelectedSlot}
                  postcode={quote.postcode}
                />

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setStep("select-package")}
                    className="flex-1 py-3 px-4 rounded-lg font-semibold bg-gray-700 text-white hover:bg-gray-600 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmDate}
                    disabled={!selectedDate || !selectedSlot}
                    className="flex-1 py-3 px-4 rounded-lg font-semibold bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === "confirm" && (
              <div className="max-w-md mx-auto">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Booking Summary</h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Package</span>
                      <span className="text-white font-medium capitalize">{selectedPackage}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Date</span>
                      <span className="text-white font-medium">
                        {selectedDate && format(selectedDate, "EEE, MMM d, yyyy")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-700">
                      <span className="text-gray-400">Time Slot</span>
                      <span className="text-white font-medium">
                        {selectedSlot === "am" && "Morning (8am-12pm)"}
                        {selectedSlot === "pm" && "Afternoon (12pm-5pm)"}
                        {selectedSlot === "full" && "Any Time"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Total</span>
                      <span className="text-2xl font-bold text-yellow-500">
                        £{((getSelectedPrice() || 0) / 100).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("select-date")}
                    className="flex-1 py-3 px-4 rounded-lg font-semibold bg-gray-700 text-white hover:bg-gray-600 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={bookingMutation.isPending}
                    className="flex-1 py-3 px-4 rounded-lg font-semibold bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {bookingMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
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
