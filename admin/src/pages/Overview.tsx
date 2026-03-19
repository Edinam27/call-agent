import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  TrendingUp, 
  Users,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

// Use relative URL to let Vite proxy or Vercel rewrites handle it
const API_URL = import.meta.env.VITE_API_URL || '';

interface Issue {
  topic: string;
  count: number;
}

interface Activity {
  id: number | string;
  type: string;
  detail: string;
  time: string;
}

interface Stats {
  totalCalls: number;
  totalLeads: number;
  commonIssues: Issue[];
  recentActivity: Activity[];
  insight: string;
}

export default function Overview() {
  const [stats, setStats] = useState<Stats>({
    totalCalls: 0,
    totalLeads: 0,
    commonIssues: [],
    recentActivity: [],
    insight: ""
  });
  const [loading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/admin/analytics`);
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Interactions</p>
              <p className="text-3xl font-bold text-card-foreground mt-2">{stats.totalCalls}</p>
            </div>
            <div className="p-3 bg-secondary text-secondary-foreground rounded-lg">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-primary font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" /> Live
            </span>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Leads Captured</p>
              <p className="text-3xl font-bold text-card-foreground mt-2">{stats.totalLeads}</p>
            </div>
            <div className="p-3 bg-accent text-accent-foreground rounded-lg">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-primary font-medium flex items-center">
              Database Sync
            </span>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">System Status</p>
              <p className="text-3xl font-bold text-card-foreground mt-2">Active</p>
            </div>
            <div className="p-3 bg-secondary text-secondary-foreground rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-muted-foreground">All systems operational</span>
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Common Issues (LLM Analysis) */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
            <h2 className="text-lg font-semibold text-card-foreground">Top Query Topics</h2>
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">AI Analyzed</span>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Array.isArray(stats.commonIssues) && stats.commonIssues.length > 0 ? (
                stats.commonIssues.map((issue, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-foreground">{issue.topic}</span>
                      <span className="text-muted-foreground">{issue.count} queries</span>
                    </div>
                    <div className="w-full bg-input rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((issue.count / Math.max(stats.totalCalls, 1)) * 100 * 2, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">No issue data available yet.</div>
              )}
            </div>
            <div className="mt-6 p-4 bg-secondary rounded-lg border border-border">
              <h3 className="text-sm font-semibold text-secondary-foreground mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                AI Insight
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {stats.insight || "Gathering more data to provide insights..."}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <h2 className="text-lg font-semibold text-card-foreground">Recent Activity</h2>
          </div>
          <div className="flex-1 p-0 overflow-y-auto max-h-[400px]">
            <ul className="divide-y divide-border">
              {Array.isArray(stats.recentActivity) && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <li key={activity.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${activity.type === 'Lead Generated' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                        {activity.type === 'Lead Generated' ? <Users className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{activity.type}</p>
                        <p className="text-xs text-muted-foreground">{activity.detail}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{activity.time}</span>
                  </li>
                ))
              ) : (
                <li className="p-8 text-center text-muted-foreground text-sm">
                  No recent activity found.
                </li>
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}