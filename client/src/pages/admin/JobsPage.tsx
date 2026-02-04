import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Calendar, MapPin, Clock } from "lucide-react";

interface Job {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string | null;
  postcode: string | null;
  jobDescription: string | null;
  status: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  pricePence: number | null;
  createdAt: string;
}

export default function JobsPage() {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: () => fetch("/api/jobs").then((r) => r.json()),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetch(`/api/jobs/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400";
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Jobs</h1>
      </div>

      {isLoading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-4">
          {jobs?.map((job) => (
            <div
              key={job.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold">{job.customerName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{job.jobDescription}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {job.postcode && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.postcode}
                      </span>
                    )}
                    {job.scheduledDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(job.scheduledDate).toLocaleDateString()}
                        {job.scheduledTime && ` at ${job.scheduledTime}`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {job.pricePence && (
                    <p className="text-xl font-bold text-white mb-3">
                      £{(job.pricePence / 100).toFixed(0)}
                    </p>
                  )}
                  <select
                    value={job.status}
                    onChange={(e) => updateStatus.mutate({ id: job.id, status: e.target.value })}
                    className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          {(!jobs || jobs.length === 0) && (
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
              <Briefcase className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No jobs scheduled yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
