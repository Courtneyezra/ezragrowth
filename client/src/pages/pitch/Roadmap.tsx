import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Rocket,
  Globe,
  Gift,
  CheckCircle,
  Clock,
  Star,
  Home,
  Zap,
  Crown,
  Calendar
} from "lucide-react";

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/pitch/roi">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ROI Calculator
              </Button>
            </Link>
            <Link href="/pitch/competitors">
              <Button variant="outline" className="border-gray-600">
                Next: Competitor Analysis
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full mb-4">
            <Gift className="h-5 w-5" />
            <span className="font-medium">Early Partner Offer</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            The Deal
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get your landing page + try the full CRM system FREE for a month
          </p>
        </div>

        {/* The Main Offer */}
        <Card className="bg-gradient-to-r from-yellow-500/20 to-green-500/20 border-2 border-yellow-500/50 mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-yellow-500/30 text-yellow-300 px-4 py-2 rounded-full mb-4">
                <Zap className="h-5 w-5" />
                <span className="font-semibold">EARLY PARTNER OFFER</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                £750 for the Landing Page
              </h2>
              <p className="text-2xl text-green-400 font-semibold">
                + 1 Month FREE CRM Trial
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* What You Pay */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-400" />
                  What You Pay
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-700">
                    <span className="text-gray-300">Landing Page Setup</span>
                    <span className="text-white font-bold">£750</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-700">
                    <span className="text-gray-300">Paid over 12 months</span>
                    <span className="text-green-400 font-bold">£62.50/mo</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-300">First month CRM</span>
                    <span className="text-green-400 font-bold">FREE</span>
                  </div>
                </div>
              </div>

              {/* What You Get in the Trial */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  FREE 1 Month CRM Trial Includes
                </h3>
                <ul className="space-y-2">
                  {[
                    "Lead tracking & notifications",
                    "Instant quote generation",
                    "Customer database",
                    "Job tracking",
                    "Invoice management",
                    "Online booking calendar",
                    "WhatsApp integration"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">How It Works</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-yellow-400 font-bold text-xl">1</span>
                  </div>
                  <p className="text-white font-semibold">Today</p>
                  <p className="text-gray-400 text-sm">Landing page goes live + CRM trial starts</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-400 font-bold text-xl">2</span>
                  </div>
                  <p className="text-white font-semibold">Month 1</p>
                  <p className="text-gray-400 text-sm">Use full CRM FREE, see leads coming in</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-400 font-bold text-xl">3</span>
                  </div>
                  <p className="text-white font-semibold">Month 2+</p>
                  <p className="text-gray-400 text-sm">Upgrade to Pro £49/mo or stay on Free tier</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <p className="text-gray-400 mb-4">
                Just <span className="text-yellow-400 font-semibold">£62.50/month</span> for the landing page.
                Try the CRM FREE. Decide after.
              </p>
              <Link href="/landing">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg px-8">
                  See Demo Landing Page
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* After Trial - Your Options */}
        <h2 className="text-2xl font-bold text-white mb-6 text-center">After Your Free Month</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Free Tier */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Gift className="h-5 w-5 text-green-400" />
                  Free Tier
                </CardTitle>
                <span className="text-2xl font-bold text-green-400">£0/mo</span>
              </div>
              <p className="text-gray-400">Basic features, no ongoing cost</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  "Landing page stays live",
                  "Lead notifications by email",
                  "Customer list (view only)",
                  "5 quotes per month",
                  "Basic job list"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-400 text-center">
                  Good for low volume, just need leads captured
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card className="bg-blue-500/10 border-2 border-blue-500/50 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                RECOMMENDED
              </span>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="h-5 w-5 text-blue-400" />
                  Pro
                </CardTitle>
                <span className="text-2xl font-bold text-blue-400">£49/mo</span>
              </div>
              <p className="text-gray-400">Full business system</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  "Everything in Free, plus:",
                  "Unlimited quotes",
                  "Full invoicing system",
                  "Calendar & scheduling",
                  "Job dispatch & tracking",
                  "WhatsApp integration",
                  "Customer portal",
                  "Reports & analytics"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="text-sm text-blue-300 text-center">
                  Run your entire business from one place
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* The Math */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-center">The Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <p className="text-gray-400 mb-2">Landing Page Only</p>
                <p className="text-2xl font-bold text-white">£62.50/mo</p>
                <p className="text-sm text-gray-500">for 12 months</p>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="text-blue-400 mb-2">Landing Page + Pro CRM</p>
                <p className="text-2xl font-bold text-white">£111.50/mo</p>
                <p className="text-sm text-gray-500">£62.50 + £49 after trial</p>
              </div>
            </div>
            <div className="text-center mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-300">
                <span className="text-red-400 font-semibold">Currently losing:</span> ~£1,080/month in leads
              </p>
              <p className="text-green-400 font-semibold mt-2">
                Even with Pro, you're spending £111 to potentially recover £1,000+
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Why Try It */}
        <Card className="bg-gradient-to-r from-green-500/20 to-yellow-500/20 border-green-500/30 mb-8">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Zero Risk to Try</h2>
              <p className="text-gray-300 max-w-2xl mx-auto mb-6">
                Use the full CRM for a month. Send quotes, track jobs, manage customers.
                If it doesn't make your life easier, just drop to the free tier.
                The landing page keeps working either way.
              </p>
              <div className="grid sm:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">£62.50</div>
                  <p className="text-gray-300">Monthly for landing page</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">FREE</div>
                  <p className="text-gray-300">First month CRM</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">£49</div>
                  <p className="text-gray-300">Pro CRM if you love it</p>
                </div>
              </div>

              <Link href="/landing">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                  See Demo Landing Page
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link href="/pitch">
            <Button variant="ghost" className="text-gray-400">
              <Home className="h-4 w-4 mr-2" />
              Overview
            </Button>
          </Link>
          <Link href="/pitch/competitors">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
              Next: Competitors
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
