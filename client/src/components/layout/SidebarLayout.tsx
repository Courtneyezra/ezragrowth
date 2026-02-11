import { useState } from "react";
import { LayoutDashboard, PhoneCall, Bell, HelpCircle, Package, DollarSign, Menu, Megaphone, FileText, Briefcase, CalendarDays } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarLayoutProps {
    children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
    const [location] = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden transition-colors duration-300">
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-64 bg-card text-card-foreground flex flex-col z-50 transition-transform duration-300 lg:relative lg:translate-x-0 border-r border-border",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Area */}
                <div className="p-6 flex items-center gap-3">
                    <img
                        src="/rooketrade-logo.png"
                        alt="Rooketrade Electrical"
                        className="w-10 h-10 object-contain"
                    />
                    <div className="flex flex-col leading-tight">
                        <span className="font-bold text-lg text-foreground">Rooketrade</span>
                        <span className="font-normal text-sm text-muted-foreground">Electrical</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
                    {[
                        {
                            title: "OVERVIEW",
                            items: [
                                { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
                            ]
                        },
                        {
                            title: "SALES & QUOTES",
                            items: [
                                { icon: DollarSign, label: "Quote Generator", href: "/admin/generate-quote" },
                                { icon: FileText, label: "Quotes", href: "/admin/quotes" },
                                { icon: Briefcase, label: "Jobs", href: "/admin/jobs" },
                                { icon: FileText, label: "Invoices", href: "/admin/invoices" },
                            ]
                        },
                        {
                            title: "MANAGEMENT",
                            items: [
                                { icon: CalendarDays, label: "Availability", href: "/admin/availability" },
                                { icon: PhoneCall, label: "Call Log", href: "/admin/calls" },
                                { icon: Package, label: "SKU Manager", href: "/admin/skus" },
                                { icon: Megaphone, label: "Marketing", href: "/admin/marketing" },
                            ]
                        }
                    ].map((group, idx) => (
                        <div key={idx}>
                            <h3 className="mb-2 px-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground/50 font-mono">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                            location === item.href
                                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 translate-x-1"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted hover:translate-x-1"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={cn("w-4 h-4", location === item.href && "animate-pulse")} />
                                            {item.label}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 mt-auto border-t border-border space-y-2 bg-card/50 backdrop-blur-sm">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg text-sm font-medium transition-colors">
                        <HelpCircle className="w-5 h-5" />
                        Help & Support
                    </button>
                    <div className="pt-2 flex items-center gap-3 px-4">
                        <img
                            src="/rooketrade-logo.png"
                            alt="Admin"
                            className="w-8 h-8 rounded-full object-contain ring-2 ring-border"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">Admin</p>
                            <p className="text-xs text-muted-foreground truncate">admin@rooketrade.co.uk</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-background/80 backdrop-blur-lg border-b border-border flex items-center justify-between px-4 lg:px-8 shadow-sm z-30 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 text-muted-foreground hover:text-foreground lg:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-sm lg:text-lg font-semibold text-foreground truncate max-w-[150px] lg:max-w-none">
                            {[
                                { label: "Dashboard", href: "/admin" },
                                { label: "Quote Generator", href: "/admin/generate-quote" },
                                { label: "Quotes", href: "/admin/quotes" },
                                { label: "Jobs", href: "/admin/jobs" },
                                { label: "Invoices", href: "/admin/invoices" },
                                { label: "Availability", href: "/admin/availability" },
                                { label: "Call Log", href: "/admin/calls" },
                                { label: "SKU Manager", href: "/admin/skus" },
                                { label: "Marketing", href: "/admin/marketing" },
                            ].find(i => i.href === location)?.label || "Dashboard"}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4">
                        <ThemeToggle />
                        <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors relative hidden sm:block">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                        </button>
                        <Link
                            href="/admin/generate-quote"
                            className="px-3 lg:px-4 py-2 bg-primary text-primary-foreground text-[10px] lg:text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            + New Quote
                        </Link>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
