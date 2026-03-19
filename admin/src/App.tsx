import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Search,
  FileText,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

// Get API URL from env, or default to backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalCalls: 0,
    totalLeads: 0,
    commonIssues: [],
    recentActivity: [],
    insight: ""
  });
  const [loading, setIsLoading] = useState(true);

  useEffect(() => {
    // We'll fetch data from the new admin endpoints here
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/admin/analytics`);
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        // Fallback mock data for development
        setStats({
          totalCalls: 124,
          totalLeads: 45,
          commonIssues: [
            { topic: "Fees & Payment", count: 42 },
            { topic: "Admission Deadlines", count: 35 },
            { topic: "Portal Login Issues", count: 18 }
          ],
          recentActivity: [
            { id: 1, type: "Lead Generated", detail: "MBA Applicant", time: "10 mins ago" },
            { id: 2, type: "Call Completed", detail: "Duration: 4m 20s", time: "1 hour ago" },
          ],
          insight: "There has been a 40% increase in queries regarding 'Portal Login Issues' in the last 48 hours. Consider updating the student portal instructions in the AI's knowledge base."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <BarChart3 className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-gray-800">SOGS Admin</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-md font-medium">
            <TrendingUp className="w-5 h-5" />
            Overview
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md font-medium">
            <Users className="w-5 h-5" />
            Leads CRM
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md font-medium">
            <MessageSquare className="w-5 h-5" />
            Conversations
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md font-medium">
            <FileText className="w-5 h-5" />
            Analysis Reports
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search logs..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-6">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Interactions</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCalls}</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600 font-medium flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" /> +12%
                    </span>
                    <span className="text-gray-500 ml-2">from last week</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Leads Captured</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLeads}</p>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600 font-medium flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" /> +5%
                    </span>
                    <span className="text-gray-500 ml-2">conversion rate</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pending Issues</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-gray-500">Requires human intervention</span>
                  </div>
                </div>
              </div>

              {/* Analysis Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Common Issues (LLM Analysis) */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Top Query Topics</h2>
                    <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-1 rounded-full">AI Analyzed</span>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {stats.commonIssues.map((issue, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{issue.topic}</span>
                            <span className="text-gray-500">{issue.count} queries</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(issue.count / 50) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                      <h3 className="text-sm font-semibold text-yellow-800 mb-1">AI Insight</h3>
                      <p className="text-sm text-yellow-700">
                        {stats.insight || "Gathering more data to provide insights..."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
                  </div>
                  <div className="p-0">
                    <ul className="divide-y divide-gray-200">
                      {stats.recentActivity.map((activity) => (
                        <li key={activity.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${activity.type === 'Lead Generated' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                              {activity.type === 'Lead Generated' ? <Users className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                              <p className="text-xs text-gray-500">{activity.detail}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">{activity.time}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <a href="#" className="text-sm text-blue-600 font-medium hover:text-blue-800">View all activity &rarr;</a>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}