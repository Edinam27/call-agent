import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Mail, Phone, BookOpen, Clock, Download } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Lead {
  id: number;
  name: string;
  contact_info: string;
  program_of_interest: string;
  highest_degree: string;
  created_at: string;
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/admin/leads`);
        setLeads(response.data);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Captured Leads</h2>
          <p className="text-sm text-muted-foreground mt-1">Prospective students extracted from conversations.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prospect Details</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Program Interest</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Background</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Captured Date</th>
                <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm font-medium text-muted-foreground">#{lead.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xs">
                        {lead.name ? lead.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{lead.name || 'Unknown'}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {lead.contact_info?.includes('@') ? (
                            <Mail className="w-3 h-3 text-muted-foreground" />
                          ) : (
                            <Phone className="w-3 h-3 text-muted-foreground" />
                          )}
                          <p className="text-xs text-muted-foreground">{lead.contact_info || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-secondary-foreground/10">
                      <BookOpen className="w-3 h-3" />
                      {lead.program_of_interest || 'Undecided'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-foreground">
                    {lead.highest_degree || 'Not specified'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-sm text-primary font-medium hover:underline">View</button>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Users className="w-10 h-10 text-muted-foreground/50" />
                      <p>No leads have been captured yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}