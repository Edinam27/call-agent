import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Users, MessageSquare, TrendingUp, Search } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <BarChart3 className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-sidebar-foreground">SOGS Admin</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            to="/" 
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${
              isActive('/') 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Overview
          </Link>
          <Link 
            to="/leads" 
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${
              isActive('/leads') 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            }`}
          >
            <Users className="w-5 h-5" />
            Leads CRM
          </Link>
          <Link 
            to="/conversations" 
            className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${
              isActive('/conversations') 
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Conversations
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8">
          <h1 className="text-2xl font-semibold text-card-foreground">
            {location.pathname === '/' && 'Dashboard Overview'}
            {location.pathname === '/leads' && 'Leads Management'}
            {location.pathname === '/conversations' && 'Conversation Logs'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-input border border-border text-foreground placeholder:text-muted-foreground rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring w-64"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}