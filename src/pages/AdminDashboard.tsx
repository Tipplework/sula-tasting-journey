import { BarChart3, Users, Star, MousePointerClick, CheckCircle2 } from "lucide-react";

// Mock data - will be replaced with Supabase queries
const mockStats = {
  totalSessions: 247,
  completionRate: 78,
  mostLikedWine: "The Source Moscato",
  averageRatings: [
    { name: "Tropicale Rosé", rating: 4.2 },
    { name: "Dindori Chardonnay", rating: 3.9 },
    { name: "Grenache Rosé", rating: 4.5 },
    { name: "Rasa Syrah", rating: 4.1 },
    { name: "The Source Moscato", rating: 4.6 },
  ],
  upsellClicks: 89,
};

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
}) {
  return (
    <div className="wine-card p-4 space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon size={14} />
        <p className="text-xs font-medium">{label}</p>
      </div>
      <p className="font-heading text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen px-5 py-8 max-w-lg mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Tasting Room Analytics
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Users}
            label="Total Sessions"
            value={mockStats.totalSessions}
          />
          <StatCard
            icon={CheckCircle2}
            label="Completion Rate"
            value={`${mockStats.completionRate}%`}
          />
          <StatCard
            icon={Star}
            label="Most Liked"
            value={mockStats.mostLikedWine}
          />
          <StatCard
            icon={MousePointerClick}
            label="Upsell Clicks"
            value={mockStats.upsellClicks}
          />
        </div>

        <div className="wine-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-muted-foreground" />
            <h2 className="font-heading font-semibold">
              Average Rating per Wine
            </h2>
          </div>
          <div className="space-y-3">
            {mockStats.averageRatings.map((wine) => (
              <div key={wine.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{wine.name}</span>
                  <span className="font-medium">{wine.rating}/5</span>
                </div>
                <div className="progress-track h-2">
                  <div
                    className="progress-fill h-2"
                    style={{ width: `${(wine.rating / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Data is mock — connect a database for live analytics
        </p>
      </div>
    </div>
  );
}
