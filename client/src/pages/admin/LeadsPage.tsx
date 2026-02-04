import { useQuery } from "@tanstack/react-query";
import { User, Phone, MapPin, Calendar } from "lucide-react";

interface Lead {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  postcode: string | null;
  jobDescription: string | null;
  status: string;
  source: string | null;
  createdAt: string;
}

export default function LeadsPage() {
  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: () => fetch("/api/leads").then((r) => r.json()),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500/20 text-blue-400";
      case "contacted":
        return "bg-yellow-500/20 text-yellow-400";
      case "quoted":
        return "bg-purple-500/20 text-purple-400";
      case "won":
        return "bg-green-500/20 text-green-400";
      case "lost":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Leads</h1>
        <span className="text-gray-400">{leads?.length || 0} total</span>
      </div>

      {isLoading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Job Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {leads?.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{lead.customerName}</p>
                        {lead.postcode && (
                          <p className="text-gray-400 text-sm flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {lead.postcode}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-300">{lead.phone}</p>
                    {lead.email && <p className="text-gray-400 text-sm">{lead.email}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-300 text-sm max-w-xs truncate">
                      {lead.jobDescription || "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!leads || leads.length === 0) && (
            <div className="p-8 text-center text-gray-400">
              No leads yet. They'll appear here when customers submit the contact form.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
