import { Star, Shield, CheckCircle, Award, Calendar, Users, ThumbsUp, ExternalLink } from "lucide-react";
import { SiGoogle } from "react-icons/si";

const TRUST_A_TRADER_URL = "https://www.trustatrader.com/traders/rooketrade-electrical-electricians-nottingham-south-west";
const GOOGLE_REVIEWS_URL = "https://g.co/kgs/iBZG0Yj";

export function TrustATraderSection() {
    const trustATraderRatings = [
        { label: "Initial Impression", score: 4.97 },
        { label: "Punctuality", score: 4.95 },
        { label: "Cleanliness", score: 4.96 },
        { label: "Quality of Work", score: 4.98 },
        { label: "Value for Money", score: 4.94 },
        { label: "Overall Opinion", score: 4.98 },
    ];

    const verifications = [
        "ID Verified",
        "Address Verified",
        "References Checked",
        "Insurance Verified",
        "JIB Gold Card",
        "City & Guilds NVQ3",
    ];

    const googleReviews = [
        { name: "Sarah M.", text: "Excellent service! Liam was professional, punctual and did a fantastic job.", rating: 5 },
        { name: "James T.", text: "Highly recommend. Quick response for an emergency call-out.", rating: 5 },
        { name: "Emma W.", text: "Great work on our EV charger installation. Very tidy.", rating: 5 },
    ];

    return (
        <section className="py-16 lg:py-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-full mb-6 border border-amber-500/30">
                        <Award className="w-5 h-5 text-amber-400" />
                        <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">#1 Rated Electrician in Nottingham</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                        Trusted Across
                        <span className="text-rooketrade-cyan"> Google </span>
                        &
                        <span className="text-amber-400"> Trust a Trader</span>
                    </h2>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        200+ verified five-star reviews across platforms. See why Nottingham trusts Rooketrade Electrical.
                    </p>
                </div>

                {/* Two Platform Cards - Side by Side on Desktop */}
                <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-12">

                    {/* Trust a Trader Card */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-amber-500/30 rounded-3xl p-6 lg:p-8 relative overflow-hidden">
                        {/* Amber accent glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                                    <span className="text-slate-900 font-black text-lg">TaT</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Trust a Trader</h3>
                                    <p className="text-amber-400 text-sm font-medium">181+ Reviews</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-white">4.96</div>
                                <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map(i => (
                                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Rating Bars */}
                        <div className="space-y-3 mb-6">
                            {trustATraderRatings.slice(0, 4).map((rating, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <span className="text-slate-400 text-xs w-28">{rating.label}</span>
                                    <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                                            style={{ width: `${(rating.score / 5) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-amber-400 font-bold text-xs w-8">{rating.score}</span>
                                </div>
                            ))}
                        </div>

                        {/* Verifications */}
                        <div className="grid grid-cols-2 gap-2 mb-6 pt-4 border-t border-slate-700/50">
                            {verifications.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-slate-300 text-xs">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <a
                            href={TRUST_A_TRADER_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all hover:scale-[1.02]"
                        >
                            View All Reviews
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Google Reviews Card */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-3xl p-6 lg:p-8 relative overflow-hidden">
                        {/* Blue accent glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                                    <SiGoogle className="w-7 h-7 text-[#4285F4]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Google Reviews</h3>
                                    <p className="text-blue-400 text-sm font-medium">50+ Reviews</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-white">5.0</div>
                                <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map(i => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Reviews */}
                        <div className="space-y-4 mb-6">
                            {googleReviews.map((review, idx) => (
                                <div key={idx} className="bg-slate-700/30 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            {review.name.charAt(0)}
                                        </div>
                                        <span className="text-white text-sm font-medium">{review.name}</span>
                                        <div className="flex gap-0.5 ml-auto">
                                            {[1,2,3,4,5].map(i => (
                                                <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-300 text-xs leading-relaxed">"{review.text}"</p>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <a
                            href={GOOGLE_REVIEWS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all hover:scale-[1.02]"
                        >
                            <SiGoogle className="w-4 h-4" />
                            View on Google
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Combined Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-bold text-white">230+</div>
                        <div className="text-slate-400 text-sm">Total Reviews</div>
                    </div>
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-bold text-white">4.98</div>
                        <div className="text-slate-400 text-sm">Average Rating</div>
                    </div>
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-bold text-white">0</div>
                        <div className="text-slate-400 text-sm">Missed Appointments</div>
                    </div>
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 text-center">
                        <div className="text-3xl font-bold text-emerald-400">#1</div>
                        <div className="text-slate-400 text-sm">Rated in Nottingham</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
