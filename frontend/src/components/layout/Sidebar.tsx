import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Sparkles, 
  Map, 
  PenTool, 
  MessageSquare,
  Settings,
  Shield,
  Zap,
  LogOut
} from 'lucide-react';
import { cn } from '../ui/Card';
import { authService } from '../../services/auth.service';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'analyzer', name: 'Website Analyzer', icon: Search },
  { id: 'optimizer', name: 'Content Optimizer', icon: Sparkles },
  { id: 'authority', name: 'Authority Map', icon: Map },
  { id: 'generator', name: 'Content Generator', icon: PenTool },
  { id: 'simulation', name: 'Answer Simulation', icon: MessageSquare },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  return (
    <div className="w-64 border-r border-border bg-sidebar flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
          <img
            src="/logos/small-Gemini_Generated_Image_h8ep7qh8ep7qh8ep.png"
            alt="EchoRank Logo"
            className="w-8 h-8 rounded-lg"
          />
        <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          EchoRank
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              activeTab === item.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
        <div className="mt-4 p-4 bg-accent/50 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Enterprise</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Your account is optimized for High-Volume AI analysis.
          </p>
        </div>
      </div>
    </div>
  );
}
