import { useEffect, useState } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { LayoutDashboard, Users, Briefcase, FileText, Mail, LogOut, Menu, X, Home, Newspaper, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminTeam from "@/components/admin/AdminTeam";
import AdminJobs from "@/components/admin/AdminJobs";
import AdminMemos from "@/components/admin/AdminMemos";
import AdminApplications from "@/components/admin/AdminApplications";
import AdminContact from "@/components/admin/AdminContact";
import AdminSiteContent from "@/components/admin/AdminSiteContent";
import AdminSubscribers from "@/components/admin/AdminSubscribers";
import AdminInvites from "@/components/admin/AdminInvites";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/site-content", label: "Home Page", icon: Home },
  { path: "/admin/team", label: "Team", icon: Users },
  { path: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { path: "/admin/memos", label: "News", icon: Newspaper },
  { path: "/admin/subscribers", label: "Newsletter", icon: Mail },
  { path: "/admin/applications", label: "Applications", icon: Briefcase },
  { path: "/admin/contact", label: "Contact", icon: FileText },
  { path: "/admin/invites", label: "Admin Invites", icon: UserPlus },
];

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        setTimeout(() => checkAdminRole(session.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        checkAdminRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-display font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have admin privileges.</p>
          <Button onClick={handleLogout}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 glass border-r border-border transform transition-transform lg:transform-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <h1 className="text-xl font-display font-bold text-gradient">Admin Panel</h1>
        </div>
        <nav className="px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 pt-16 lg:pt-8">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/site-content" element={<AdminSiteContent />} />
          <Route path="/team" element={<AdminTeam />} />
          <Route path="/jobs" element={<AdminJobs />} />
          <Route path="/memos" element={<AdminMemos />} />
          <Route path="/subscribers" element={<AdminSubscribers />} />
          <Route path="/applications" element={<AdminApplications />} />
          <Route path="/contact" element={<AdminContact />} />
          <Route path="/invites" element={<AdminInvites />} />
        </Routes>
      </main>
    </div>
  );
}
