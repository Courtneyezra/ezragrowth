import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle,
  Globe,
  Zap,
  Gift,
  ImagePlus,
  ArrowRightLeft,
  Calendar,
  FileText,
  CreditCard,
  Shield,
  Clock,
  Mail,
  Phone,
  Star
} from "lucide-react";

export default function RooketradeProposal() {
  const [aiImages, setAiImages] = useState(false);
  const [domainPort, setDomainPort] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // Pricing
  const basePrice = 750;
  const upfront = 500;
  const remaining = 250;
  const monthlyPayments = 4;
  const monthlyAmount = remaining / monthlyPayments; // £62.50
  const aiImagesPrice = 100;
  const domainPortPrice = 80;

  // Totals
  const addOnsTotal = (aiImages ? aiImagesPrice : 0) + (domainPort ? domainPortPrice : 0);
  const totalProject = basePrice + addOnsTotal;
  const totalUpfront = upfront + addOnsTotal;

  // Stripe payment link - replace with actual link
  const stripePaymentLink = `https://buy.stripe.com/test_XXXXXX?amount=${totalUpfront * 100}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm font-medium">PROPOSAL</p>
              <h1 className="text-2xl font-bold text-white">Rooketrade Electrical</h1>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Prepared by</p>
              <p className="text-white font-medium">EzraGrowth</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Introduction */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardContent className="p-6">
            <p className="text-gray-300 text-lg">
              Hi, thanks for taking the time to discuss your business needs. Based on our conversation,
              here's a proposal to get your online presence back up and running, and set you up with
              the tools to capture and convert more leads.
            </p>
          </CardContent>
        </Card>

        {/* The Problem */}
        <Card className="bg-red-500/10 border-red-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-red-400">The Current Situation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-1">✗</span>
                <span className="text-gray-300">Website is currently down - customers can't find you online</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-1">✗</span>
                <span className="text-gray-300">Good Google ranking but nowhere to send traffic</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-1">✗</span>
                <span className="text-gray-300">Leads going to competitors with working websites</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* The Solution */}
        <Card className="bg-green-500/10 border-green-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-green-400">The Solution</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-gray-300">Professional landing page designed to convert visitors to enquiries</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-gray-300">New domain setup and configured</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-gray-300">Mobile-optimised design (most searches are mobile)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-gray-300">Contact form with instant email notifications</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-gray-300">Click-to-call button for mobile users</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-gray-300">Google-ready (SEO basics configured)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Main Package */}
        <Card className="bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 border-2 border-yellow-500/50 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-8 w-8 text-yellow-400" />
                <div>
                  <CardTitle className="text-white text-xl">Landing Page + Domain Setup</CardTitle>
                  <p className="text-gray-400">Professional online presence</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-yellow-400">£{basePrice}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">What's Included:</h4>
                <ul className="space-y-2 text-sm">
                  {[
                    "Custom landing page design",
                    "New domain registration",
                    "SSL certificate (https://)",
                    "Hosting setup",
                    "Contact form integration",
                    "Mobile responsive design",
                    "Google Analytics setup",
                    "1 round of revisions"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Payment Plan:</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-700">
                    <span className="text-gray-300">Upfront deposit</span>
                    <span className="text-white font-bold">£{upfront}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-700">
                    <span className="text-gray-300">Then {monthlyPayments} monthly payments of</span>
                    <span className="text-white font-bold">£{monthlyAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-400 text-sm">Total</span>
                    <span className="text-yellow-400 font-bold">£{basePrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Free CRM Trial */}
        <Card className="bg-blue-500/10 border-blue-500/30 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="h-8 w-8 text-blue-400" />
                <div>
                  <CardTitle className="text-white text-xl">45-Day CRM Trial</CardTitle>
                  <p className="text-gray-400">Full business system - FREE</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-400">FREE</p>
                <p className="text-sm text-gray-400">Worth £73.50</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              For 45 days, you'll have full access to the CRM system to manage your leads, quotes, and jobs:
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                "Lead tracking & notifications",
                "Instant quote generation",
                "Customer database",
                "Job tracking",
                "Invoice management",
                "Online booking calendar"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  {feature}
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-blue-300 text-sm text-center">
                After 45 days: Continue on Pro at £49/mo, or drop to Free tier (basic features, no charge)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Optional Add-ons */}
        <h2 className="text-xl font-bold text-white mb-4">Optional Add-ons</h2>

        <div className="space-y-4 mb-8">
          {/* AI Images */}
          <Card className={`border-2 transition-all cursor-pointer ${aiImages ? 'bg-purple-500/10 border-purple-500/50' : 'bg-gray-800/50 border-gray-700'}`}
                onClick={() => setAiImages(!aiImages)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox checked={aiImages} onCheckedChange={() => setAiImages(!aiImages)} />
                  <div className="flex items-center gap-3">
                    <ImagePlus className={`h-6 w-6 ${aiImages ? 'text-purple-400' : 'text-gray-500'}`} />
                    <div>
                      <p className="text-white font-semibold">AI-Generated Professional Images</p>
                      <p className="text-gray-400 text-sm">Custom electrical/trade images for your site</p>
                    </div>
                  </div>
                </div>
                <p className={`text-xl font-bold ${aiImages ? 'text-purple-400' : 'text-gray-400'}`}>+£{aiImagesPrice}</p>
              </div>
            </CardContent>
          </Card>

          {/* Domain Port */}
          <Card className={`border-2 transition-all cursor-pointer ${domainPort ? 'bg-orange-500/10 border-orange-500/50' : 'bg-gray-800/50 border-gray-700'}`}
                onClick={() => setDomainPort(!domainPort)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Checkbox checked={domainPort} onCheckedChange={() => setDomainPort(!domainPort)} />
                  <div className="flex items-center gap-3">
                    <ArrowRightLeft className={`h-6 w-6 ${domainPort ? 'text-orange-400' : 'text-gray-500'}`} />
                    <div>
                      <p className="text-white font-semibold">Old Domain Transfer</p>
                      <p className="text-gray-400 text-sm">Port your existing domain to the new site</p>
                    </div>
                  </div>
                </div>
                <p className={`text-xl font-bold ${domainPort ? 'text-orange-400' : 'text-gray-400'}`}>+£{domainPortPrice}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-gray-300">Landing Page + Domain Setup</span>
                <span className="text-white font-medium">£{basePrice}</span>
              </div>
              {aiImages && (
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300">AI Professional Images</span>
                  <span className="text-white font-medium">£{aiImagesPrice}</span>
                </div>
              )}
              {domainPort && (
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300">Old Domain Transfer</span>
                  <span className="text-white font-medium">£{domainPortPrice}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-gray-300">45-Day CRM Trial</span>
                <span className="text-green-400 font-medium">FREE</span>
              </div>
              <div className="flex items-center justify-between py-3 text-lg">
                <span className="text-white font-semibold">Total Project Value</span>
                <span className="text-yellow-400 font-bold">£{totalProject}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <h4 className="text-white font-semibold mb-3">Payment Breakdown:</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Due today (deposit{addOnsTotal > 0 ? ' + add-ons' : ''})</span>
                  <span className="text-yellow-400 font-bold text-xl">£{totalUpfront}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Then 4 monthly payments of</span>
                  <span className="text-gray-300">£{monthlyAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              Project Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { day: "Day 1", title: "Kick-off", desc: "Domain registration, gather your branding/photos" },
                { day: "Day 2-3", title: "Design", desc: "Landing page design and content" },
                { day: "Day 4-5", title: "Review", desc: "Your feedback and revisions" },
                { day: "Day 5-7", title: "Launch", desc: "Go live + CRM trial activated" }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-20 flex-shrink-0">
                    <span className="text-yellow-400 font-semibold text-sm">{item.day}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-400" />
              Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Deposit is non-refundable once work begins</li>
              <li>• Monthly payments due on the same date each month</li>
              <li>• Landing page ownership transfers after final payment</li>
              <li>• CRM trial converts to £49/mo or Free tier after 45 days</li>
              <li>• Domain registration included for first year, £15/year renewal</li>
              <li>• Hosting included for first year, £10/month thereafter</li>
            </ul>
          </CardContent>
        </Card>

        {/* Accept & Pay */}
        <Card className="bg-gradient-to-r from-green-500/20 to-yellow-500/20 border-2 border-green-500/50 mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Ready to Get Started?</h2>
              <p className="text-gray-300">
                Accept this proposal and pay your deposit to kick off the project
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 mb-6">
              <Checkbox
                id="accept"
                checked={accepted}
                onCheckedChange={() => setAccepted(!accepted)}
              />
              <label htmlFor="accept" className="text-gray-300 cursor-pointer">
                I accept the terms of this proposal
              </label>
            </div>

            <div className="flex flex-col items-center gap-4">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold text-lg px-12 py-6 h-auto"
                disabled={!accepted}
                onClick={() => window.open(stripePaymentLink, '_blank')}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Pay Deposit - £{totalUpfront}
              </Button>
              <p className="text-gray-500 text-sm">Secure payment via Stripe</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-400 mb-4">Questions? Get in touch:</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a href="mailto:hello@ezragrowth.com" className="flex items-center gap-2 text-white hover:text-yellow-400">
                  <Mail className="h-5 w-5" />
                  hello@ezragrowth.com
                </a>
                <a href="tel:+447123456789" className="flex items-center gap-2 text-white hover:text-yellow-400">
                  <Phone className="h-5 w-5" />
                  07123 456789
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Proposal valid for 7 days from {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}
