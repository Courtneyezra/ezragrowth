import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Copy, Check, ExternalLink } from "lucide-react";

export default function GenerateQuote() {
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    postcode: "",
    address: "",
    jobDescription: "",
    quoteMode: "simple",
    basePrice: "",
    essentialPrice: "",
    enhancedPrice: "",
    elitePrice: "",
  });

  const [generatedQuote, setGeneratedQuote] = useState<{ shortSlug: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          basePrice: data.basePrice ? parseFloat(data.basePrice) * 100 : null,
          essentialPrice: data.essentialPrice ? parseFloat(data.essentialPrice) * 100 : null,
          enhancedPrice: data.enhancedPrice ? parseFloat(data.enhancedPrice) * 100 : null,
          elitePrice: data.elitePrice ? parseFloat(data.elitePrice) * 100 : null,
        }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedQuote(data);
    },
  });

  const quoteUrl = generatedQuote
    ? `${window.location.origin}/quote/${generatedQuote.shortSlug}`
    : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(quoteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (generatedQuote) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Quote Generated!</h2>
          <p className="text-gray-400 mb-6">Share this link with your customer</p>

          <div className="bg-gray-700 rounded-lg p-4 flex items-center gap-3 mb-6">
            <input
              type="text"
              readOnly
              value={quoteUrl}
              className="flex-1 bg-transparent text-white text-sm outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-gray-600 rounded-lg transition"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 text-gray-400" />
              )}
            </button>
            <a
              href={quoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-600 rounded-lg transition"
            >
              <ExternalLink className="h-5 w-5 text-gray-400" />
            </a>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setGeneratedQuote(null);
                setFormData({
                  customerName: "",
                  phone: "",
                  email: "",
                  postcode: "",
                  address: "",
                  jobDescription: "",
                  quoteMode: "simple",
                  basePrice: "",
                  essentialPrice: "",
                  enhancedPrice: "",
                  elitePrice: "",
                });
              }}
              className="flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
            >
              Create Another
            </button>
            <a
              href="/admin/quotes"
              className="flex-1 px-4 py-3 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 text-center"
            >
              View All Quotes
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Generate Quote</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Customer Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Postcode</label>
              <input
                type="text"
                value={formData.postcode}
                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Job Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Job Description *</label>
            <textarea
              required
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Describe the electrical work needed..."
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Pricing</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">Quote Type</label>
            <select
              value={formData.quoteMode}
              onChange={(e) => setFormData({ ...formData, quoteMode: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="simple">Simple (Single Price)</option>
              <option value="hhh">Tiered (Essential/Enhanced/Elite)</option>
            </select>
          </div>

          {formData.quoteMode === "simple" ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Price (£)</label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                step="0.01"
                placeholder="e.g., 150"
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Essential (£)</label>
                <input
                  type="number"
                  value={formData.essentialPrice}
                  onChange={(e) => setFormData({ ...formData, essentialPrice: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Enhanced (£)</label>
                <input
                  type="number"
                  value={formData.enhancedPrice}
                  onChange={(e) => setFormData({ ...formData, enhancedPrice: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Elite (£)</label>
                <input
                  type="number"
                  value={formData.elitePrice}
                  onChange={(e) => setFormData({ ...formData, elitePrice: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  step="0.01"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-4 bg-yellow-500 text-gray-900 rounded-lg font-bold text-lg hover:bg-yellow-400 transition disabled:opacity-50"
        >
          {mutation.isPending ? "Generating..." : "Generate Quote Link"}
        </button>
      </form>
    </div>
  );
}
