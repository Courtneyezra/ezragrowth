import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const TRUST_A_TRADER_URL = "https://www.trustatrader.com/traders/rooketrade-electrical-electricians-nottingham-south-west";

interface Review {
    name: string;
    date: string;
    text: string;
    rating: number;
    highlight?: string;
}

const reviews: Review[] = [
    {
        name: "Sarah Hopewell",
        date: "3rd September 2025",
        text: "Liam responded to my request on Facebook for an electrician to sort out a few things for my Dad. Time was taken to come out, discuss job, talk in person, which was really appreciated. Arrived promptly, carried out checks on existing wiring, then replaced the consumer box, did a further set of checks to make sure all was working as it should. Work was done efficiently to an extremely high standard, Liam also cleaned up, took all rubbish away as well as hoovering up in the hall.",
        rating: 5,
        highlight: "Consumer box replacement"
    },
    {
        name: "Simon",
        date: "2nd March 2025",
        text: "Called them Saturday, they came next day on a Sunday morning at 9. Excellent service, they completed a repair to a main faulty fuse and then waited patiently a couple of hours for a National Grid engineer to come and reconnect, so they could check their work. Brilliant service and repair, speedy, excellent quality. Can highly recommend them.",
        rating: 5,
        highlight: "Emergency call-out"
    },
    {
        name: "Kevin Dodd",
        date: "25th November 2023",
        text: "Called as an emergency after having the fuzes to our upstairs electrics suddenly trip at the fuze box and not being able to reset them. Liam came around straight away and spent almost 2 hours methodically going through all the lighting and wiring until he found the issue. He fixed it quickly, made the lighting and fan set up simpler to activate. Cost for a Saturday call out and the amount of work he had to do was very reasonable.",
        rating: 5,
        highlight: "Saturday emergency"
    },
    {
        name: "Jennifer",
        date: "6th August 2025",
        text: "Prompt, courteous and efficient repair of toilet light pullcord which had caused the light to stop working.",
        rating: 5,
        highlight: "Light repair"
    },
    {
        name: "Robert",
        date: "30th July 2025",
        text: "Liam and his team were professional and courteous and I would have no hesitation on recommending him. I will 100% be using for any future work.",
        rating: 5,
        highlight: "Highly recommended"
    },
    {
        name: "Veronica",
        date: "10th July 2025",
        text: "Professional, trustworthy and very helpful! Great work!",
        rating: 5,
        highlight: "Great service"
    },
    {
        name: "Allen",
        date: "8th August 2024",
        text: "Will always recommend Liam and his crew, 2nd time hiring and will definitely ask for them again, many thanks guys!",
        rating: 5,
        highlight: "Repeat customer"
    },
    {
        name: "Ryan",
        date: "29th April 2024",
        text: "Very glad to have found such good reliable electricians. Liam Rooke and his team of Electrical Contractors are very helpful, the job was completed clean and tidy and in good time. A happy customer and will definitely use them again for any electrical work!",
        rating: 5,
        highlight: "Clean & tidy"
    },
    {
        name: "Charlie Brown",
        date: "15th January 2024",
        text: "Liam and Shaun were great, courteous, punctual, and most importantly left no mess to indicate they'd even been here.",
        rating: 5,
        highlight: "No mess left"
    },
    {
        name: "David Bruce",
        date: "1st December 2023",
        text: "Very informative clean and tidy got the job done to a high standard highly recommend.",
        rating: 5,
        highlight: "High standard"
    },
    {
        name: "Andrea",
        date: "2nd November 2023",
        text: "Replacement of bathroom fan - non-standard size. Very reliable, polite and efficient service. Thank you.",
        rating: 5,
        highlight: "Fan replacement"
    },
    {
        name: "Robert Edward",
        date: "1st November 2023",
        text: "Clean and tidy job well done.",
        rating: 5,
        highlight: "Clean work"
    },
];

function ReviewCard({ review, featured = false }: { review: Review; featured?: boolean }) {
    return (
        <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 ${featured ? 'lg:p-8' : ''} h-full flex flex-col`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-bold text-lg">
                        {review.name.charAt(0)}
                    </div>
                    <div>
                        <h4 className="text-white font-semibold">{review.name}</h4>
                        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{review.date}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-amber-400 font-bold text-sm">{review.rating}.0</span>
                </div>
            </div>

            {/* Highlight Tag */}
            {review.highlight && (
                <div className="inline-flex items-center gap-1.5 bg-rooketrade-cyan/10 text-rooketrade-cyan text-xs font-medium px-3 py-1 rounded-full mb-4 w-fit">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {review.highlight}
                </div>
            )}

            {/* Quote */}
            <div className="flex-1 relative">
                <Quote className="w-8 h-8 text-amber-400/20 absolute -top-1 -left-1" />
                <p className={`text-slate-300 ${featured ? 'text-base lg:text-lg' : 'text-sm'} leading-relaxed pl-4`}>
                    "{review.text}"
                </p>
            </div>

            {/* Stars */}
            <div className="flex gap-1 mt-4 pt-4 border-t border-slate-700/50">
                {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
                <span className="text-slate-500 text-xs ml-2">Verified on Trust a Trader</span>
            </div>
        </div>
    );
}

export function TrustATraderReviews() {
    const [currentPage, setCurrentPage] = useState(0);
    const reviewsPerPage = 3;
    const totalPages = Math.ceil(reviews.length / reviewsPerPage);

    const visibleReviews = reviews.slice(
        currentPage * reviewsPerPage,
        (currentPage + 1) * reviewsPerPage
    );

    const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
    const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

    return (
        <section className="py-16 lg:py-24 bg-slate-900 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rooketrade-cyan/5 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-full mb-6 border border-amber-500/30">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                        <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">181+ Five-Star Reviews</span>
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                        What Our Customers Say
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Real reviews from real Nottingham homeowners on Trust a Trader
                    </p>
                </div>

                {/* Featured Review (First One) */}
                <div className="mb-8 lg:mb-12">
                    <div className="max-w-4xl mx-auto">
                        <ReviewCard review={reviews[0]} featured={true} />
                    </div>
                </div>

                {/* Review Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {visibleReviews.map((review, idx) => (
                        <ReviewCard key={`${currentPage}-${idx}`} review={review} />
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={prevPage}
                        className="border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentPage(idx)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${
                                    idx === currentPage
                                        ? 'bg-amber-400 w-8'
                                        : 'bg-slate-600 hover:bg-slate-500'
                                }`}
                            />
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={nextPage}
                        className="border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <a
                        href={TRUST_A_TRADER_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                    >
                        Read all reviews on Trust a Trader
                        <ChevronRight className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </section>
    );
}
