import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Briefcase, FileText, Mail } from "lucide-react";

interface Stats {
  teamMembers: number;
  openJobs: number;
  applications: number;
  memos: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ teamMembers: 0, openJobs: 0, applications: 0, memos: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [teamRes, jobsRes, appsRes, memosRes] = await Promise.all([
      supabase.from("team_members").select("id", { count: "exact", head: true }),
      supabase.from("job_postings").select("id", { count: "exact", head: true }).eq("is_open", true),
      supabase.from("job_applications").select("id", { count: "exact", head: true }),
      supabase.from("memos").select("id", { count: "exact", head: true }),
    ]);

    setStats({
      teamMembers: teamRes.count || 0,
      openJobs: jobsRes.count || 0,
      applications: appsRes.count || 0,
      memos: memosRes.count || 0,
    });
  };

  const statCards = [
    { label: "Team Members", value: stats.teamMembers, icon: Users, color: "text-blue-400" },
    { label: "Open Jobs", value: stats.openJobs, icon: Briefcase, color: "text-green-400" },
    { label: "Applications", value: stats.applications, icon: Mail, color: "text-purple-400" },
    { label: "Memos", value: stats.memos, icon: FileText, color: "text-orange-400" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-display font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div className="text-3xl font-display font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-display font-bold mb-4">Quick Actions</h2>
        <p className="text-muted-foreground">
          Use the sidebar to manage team members, job postings, memos, applications, and contact details.
        </p>
      </div>
    </div>
  );
}
