import { useQuery } from "@tanstack/react-query";
import { Phone, FileText, Briefcase, Receipt, TrendingUp, Users } from "lucide-react";

export default function Dashboard() {
  const { data: leads } = useQuery({
    queryKey: ["leads"],
    queryFn: () => fetch("/api/leads").then((r) => r.json()),
  });

  const { data: quotes } = useQuery({
    queryKey: ["quotes"],
    queryFn: () => fetch("/api/quotes").then((r) => r.json()),
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => fetch("/api/jobs").then((r) => r.json()),
  });

  const { data: invoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => fetch("/api/invoices").then((r) => r.json()),
  });

  const stats = [
    {
      label: "Total Leads",
      value: leads?.length || 0,
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Active Quotes",
      value: quotes?.filter((q: { bookedAt: string | null }) => !q.bookedAt).length || 0,
      icon: FileText,
      color: "text-yellow-500",
    },
    {
      label: "Pending Jobs",
      value: jobs?.filter((j: { status: string }) => j.status === "pending").length || 0,
      icon: Briefcase,
      color: "text-green-500",
    },
    {
      label: "Unpaid Invoices",
      value: invoices?.filter((i: { status: string }) => i.status !== "paid").length || 0,
      icon: Receipt,
      color: "text-red-500",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Leads */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Recent Leads</h2>
          {leads?.slice(0, 5).map((lead: { id: string; customerName: string; phone: string; createdAt: string }) => (
            <div
              key={lead.id}
              className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0"
            >
              <div>
                <p className="text-white font-medium">{lead.customerName}</p>
                <p className="text-sm text-gray-400">{lead.phone}</p>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(lead.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
          {(!leads || leads.length === 0) && (
            <p className="text-gray-400">No leads yet</p>
          )}
        </div>

        {/* Recent Quotes */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Recent Quotes</h2>
          {quotes?.slice(0, 5).map((quote: { id: string; customerName: string; basePrice: number; createdAt: string }) => (
            <div
              key={quote.id}
              className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0"
            >
              <div>
                <p className="text-white font-medium">{quote.customerName}</p>
                <p className="text-sm text-gray-400">
                  {quote.basePrice ? `£${(quote.basePrice / 100).toFixed(2)}` : "TBD"}
                </p>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(quote.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
          {(!quotes || quotes.length === 0) && (
            <p className="text-gray-400">No quotes yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
