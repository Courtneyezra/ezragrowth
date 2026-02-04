import { useState } from "react";
import { Zap, Phone, Shield, Clock, Star, CheckCircle } from "lucide-react";

export default function Landing() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    postcode: "",
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.name,
          phone: formData.phone,
          postcode: formData.postcode,
          jobDescription: formData.description,
          source: "landing",
        }),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent" />

        <nav className="relative z-10 container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-10 w-10 text-yellow-500" />
            <div>
              <span className="text-2xl font-bold text-white">Rooketrade</span>
              <span className="block text-sm text-yellow-500">Electrical</span>
            </div>
          </div>
          <a
            href="tel:01onal"
            className="flex items-center gap-2 bg-yellow-500 text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-yellow-400 transition"
          >
            <Phone className="h-5 w-5" />
            Call Now
          </a>
        </nav>

        <div className="relative z-10 container mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Professional <span className="text-yellow-500">Electrical</span> Services
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              From simple repairs to complete rewires. Trusted local electricians with transparent pricing and quality workmanship.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-gray-300">
                <Shield className="h-5 w-5 text-yellow-500" />
                <span>Fully Insured</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span>Same Day Service</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>5-Star Rated</span>
              </div>
            </div>
          </div>

          {/* Quote Form */}
          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                <p className="text-gray-300">We'll call you back within 30 minutes.</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-2">Get a Free Quote</h2>
                <p className="text-gray-400 mb-6">Tell us about your electrical needs</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Postcode</label>
                    <input
                      type="text"
                      required
                      value={formData.postcode}
                      onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="e.g., SW1A 1AA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">What do you need?</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Describe your electrical work..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-yellow-500 text-gray-900 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition"
                  >
                    Get My Free Quote
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Rewiring", desc: "Full and partial house rewiring services" },
            { title: "Fuse Box Upgrades", desc: "Modern consumer unit installations" },
            { title: "Socket & Switch Installation", desc: "New sockets, switches, and USB points" },
            { title: "Lighting", desc: "Indoor, outdoor, and smart lighting solutions" },
            { title: "EV Charging", desc: "Electric vehicle charger installation" },
            { title: "Safety Inspections", desc: "EICR certificates and safety checks" },
          ].map((service, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition">
              <Zap className="h-8 w-8 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
              <p className="text-gray-400">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-8">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-6 w-6 text-yellow-500" />
            <span className="text-lg font-bold text-white">Rooketrade Electrical</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Rooketrade Electrical. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
