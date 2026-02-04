import { useState, useEffect } from "react";
import { MapPin, Star, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import derbyMapImage from "../assets/derby_map.png";
import nottinghamMapImage from "../assets/nottingham_map.png";

interface ReviewPoint {
    id: string;
    x: number; // Percentage position 0-100
    y: number; // Percentage position 0-100
    location: string;
    service: string;
    rating: number;
}

// Derby area review locations - spread across organic map shape
const DERBY_REVIEWS: ReviewPoint[] = [
    { id: "1", x: 50, y: 45, location: "Derby City", service: "Consumer Unit Upgrade", rating: 5 },
    { id: "2", x: 28, y: 35, location: "Littleover", service: "EV Charger Install", rating: 5 },
    { id: "3", x: 72, y: 38, location: "Chaddesden", service: "Rewiring", rating: 5 },
    { id: "4", x: 22, y: 55, location: "Mickleover", service: "Socket Installation", rating: 5 },
    { id: "5", x: 75, y: 58, location: "Alvaston", service: "Lighting Installation", rating: 5 },
    { id: "6", x: 80, y: 42, location: "Spondon", service: "EICR Testing", rating: 5 },
    { id: "7", x: 35, y: 25, location: "Allestree", service: "Bathroom Electrics", rating: 5 },
    { id: "8", x: 62, y: 68, location: "Oakwood", service: "Smart Home Setup", rating: 5 },
];

// Nottingham area review locations - spread across organic map shape
const NOTTINGHAM_REVIEWS: ReviewPoint[] = [
    { id: "9", x: 50, y: 50, location: "Nottingham City", service: "Fuse Box Replacement", rating: 5 },
    { id: "10", x: 30, y: 62, location: "Beeston", service: "EV Charger Install", rating: 5 },
    { id: "11", x: 68, y: 30, location: "Arnold", service: "Full Rewire", rating: 5 },
    { id: "12", x: 55, y: 70, location: "West Bridgford", service: "Outdoor Lighting", rating: 5 },
    { id: "13", x: 75, y: 52, location: "Carlton", service: "Socket Additions", rating: 5 },
    { id: "14", x: 38, y: 35, location: "Sherwood", service: "Emergency Repair", rating: 5 },
];

interface AnimatedMapProps {
    location?: "derby" | "nottingham";
}

export function AnimatedMap({ location = "derby" }: AnimatedMapProps) {
    const reviews = location === "derby" ? DERBY_REVIEWS : NOTTINGHAM_REVIEWS;
    const mapImage = location === "derby" ? derbyMapImage : nottinghamMapImage;
    const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

    useEffect(() => {
        const cycleReviews = () => {
            const random = reviews[Math.floor(Math.random() * reviews.length)];
            setActiveReviewId(random.id);
            setTimeout(() => setActiveReviewId(null), 4000);
        };
        const interval = setInterval(cycleReviews, 5000);
        setTimeout(cycleReviews, 1000);
        return () => clearInterval(interval);
    }, [reviews]);

    return (
        <div className="relative w-full aspect-square max-w-xl mx-auto">
            {/* Vibrant stroke border */}
            <div
                className="absolute inset-0 p-1"
                style={{
                    borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
                    background: "linear-gradient(135deg, #00D4FF, #6B8CFF, #FCD34D, #00D4FF)",
                    backgroundSize: "300% 300%",
                    animation: "gradientShift 4s ease infinite",
                }}
            >
                {/* Inner cutout for stroke effect */}
                <div
                    className="w-full h-full bg-slate-900"
                    style={{
                        borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
                    }}
                />
            </div>

            {/* Organic map-like blob shape */}
            <div
                className="absolute inset-1 overflow-hidden"
                style={{
                    borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
                    boxShadow: "inset 0 0 40px rgba(0, 212, 255, 0.2)",
                }}
            >
                {/* Map Background Image */}
                <img
                    src={mapImage}
                    alt={`${location} map`}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-rooketrade-cyan/15 via-transparent to-amber-400/15"></div>
            </div>

            {/* CSS Animation for gradient */}
            <style>{`
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>

            {/* Markers Container */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        className="absolute pointer-events-auto"
                        style={{
                            left: `${review.x}%`,
                            top: `${review.y}%`,
                            transform: "translate(-50%, -50%)",
                            zIndex: activeReviewId === review.id ? 20 : 10,
                        }}
                    >
                        {/* Electric Bolt Icon Marker */}
                        <div
                            className={`bg-amber-400 text-slate-900 p-1.5 rounded-full shadow-lg transition-all duration-300 cursor-pointer ${activeReviewId === review.id ? "animate-pulse scale-125 ring-2 ring-amber-300" : "opacity-90 hover:scale-110"}`}
                        >
                            <Zap className="w-4 h-4" fill="currentColor" />
                        </div>

                        {/* Review Popup */}
                        <AnimatePresence>
                            {activeReviewId === review.id && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.8 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2"
                                    style={{ zIndex: 30 }}
                                >
                                    <div className="bg-slate-900/95 backdrop-blur-md border border-amber-400/40 p-3 rounded-xl shadow-2xl w-52 text-left">
                                        <div className="flex items-center gap-1 mb-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-600"}`}
                                                />
                                            ))}
                                        </div>
                                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                                            {review.service}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                            <MapPin className="w-3 h-3" />
                                            {review.location}
                                        </div>
                                    </div>
                                    {/* Popup Arrow */}
                                    <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-slate-900 border-l border-t border-amber-400/40 rotate-45" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface LocalTrustSectionProps {
    location?: "derby" | "nottingham";
}

export function LocalTrustSection({ location = "derby" }: LocalTrustSectionProps) {
    const cityName = location === "derby" ? "Derby" : "Nottingham";

    return (
        <section className="bg-transparent px-4 lg:px-8 pb-16 lg:pb-24 pt-0 -mt-1 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-rooketrade-cyan/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/2 h-full bg-amber-400/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Map on Desktop - Hidden on mobile, shown on left for desktop */}
                <div className="hidden lg:block relative p-4">
                    <AnimatedMap location={location} />
                </div>

                {/* Text Content - Flex column for mobile reordering */}
                <div className="flex flex-col text-center lg:text-right">
                    {/* Headline */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                        {cityName}'s Hardest Working <span className="text-rooketrade-cyan">Electrical Team</span>
                    </h2>

                    {/* Map on Mobile Only - Between headline and description */}
                    <div className="lg:hidden mb-8 relative p-4">
                        <AnimatedMap location={location} />
                    </div>

                    {/* Description */}
                    <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto lg:ml-auto lg:mr-0">
                        Powering {cityName} & surrounding areas every single day. From emergency repairs to full rewires, our electricians are keeping homes and businesses running safely.
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-4xl font-bold text-white mb-1">181+</p>
                            <p className="text-slate-500 text-sm uppercase tracking-wider">5-Star Reviews</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-white mb-1">0</p>
                            <p className="text-slate-500 text-sm uppercase tracking-wider">Missed Jobs</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-white mb-1">4.96</p>
                            <p className="text-slate-500 text-sm uppercase tracking-wider">Trust a Trader</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-white mb-1">24hr</p>
                            <p className="text-slate-500 text-sm uppercase tracking-wider">Emergency Call-Out</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
