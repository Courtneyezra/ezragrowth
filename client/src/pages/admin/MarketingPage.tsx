import { useQuery } from "@tanstack/react-query";
import { Globe, Eye, MousePointer, TrendingUp } from "lucide-react";

interface LandingPage {
  id: number;
  slug: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export default function MarketingPage() {
  const { data: pages } = useQuery<LandingPage[]>({
    queryKey: ["landing-pages"],
    queryFn: () => fetch("/api/landing-pages").then((r) => r.json()),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Marketing</h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Globe className="h-8 w-8 text-yellow-500" />
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">{pages?.length || 0}</p>
          <p className="text-gray-400">Landing Pages</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Eye className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">-</p>
          <p className="text-gray-400">Page Views (Coming Soon)</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <MousePointer className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-white mb-1">-</p>
          <p className="text-gray-400">Conversions (Coming Soon)</p>
        </div>
      </div>

      {/* Landing Pages */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Landing Pages</h2>
        <p className="text-gray-400 mb-4">Manage your public-facing landing pages.</p>

        <div className="space-y-3">
          {/* Default Landing Page */}
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Main Landing Page</p>
              <p className="text-gray-400 text-sm">/landing</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                Active
              </span>
              <a
                href="/landing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-500 hover:text-yellow-400"
              >
                View
              </a>
            </div>
          </div>

          {/* Custom Pages */}
          {pages?.map((page) => (
            <div
              key={page.id}
              className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
            >
              <div>
                <p className="text-white font-medium">{page.name}</p>
                <p className="text-gray-400 text-sm">/l/{page.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    page.isActive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {page.isActive ? "Active" : "Inactive"}
                </span>
                <a
                  href={`/l/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-500 hover:text-yellow-400"
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600 border-dashed">
          <p className="text-gray-400 text-center">
            Landing page builder coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
