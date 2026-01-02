import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";

interface Application {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  cover_letter: string | null;
  experience: string | null;
  education: string | null;
  resume_url: string | null;
  status: string;
  internal_notes: string | null;
  created_at: string;
  job_title?: string;
}

const statuses = ["new", "reviewed", "shortlisted", "hired", "rejected"];

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterJob, setFilterJob] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [appsRes, jobsRes] = await Promise.all([
      supabase.from("job_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("job_postings").select("id, title"),
    ]);
    
    const jobsMap = new Map(jobsRes.data?.map(j => [j.id, j.title]) || []);
    const appsWithJobTitle = (appsRes.data || []).map(a => ({ ...a, job_title: jobsMap.get(a.job_id) || "Unknown" }));
    
    setApplications(appsWithJobTitle);
    setJobs(jobsRes.data || []);
    setLoading(false);
  };

  const filtered = applications.filter(a => 
    (filterJob === "all" || a.job_id === filterJob) &&
    (filterStatus === "all" || a.status === filterStatus)
  );

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("job_applications").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Status updated"); fetchData(); }
  };

  const saveNotes = async () => {
    if (!selectedApp) return;
    const { error } = await supabase.from("job_applications").update({ internal_notes: notes }).eq("id", selectedApp.id);
    if (error) toast.error(error.message);
    else { toast.success("Notes saved"); setSelectedApp({ ...selectedApp, internal_notes: notes }); }
  };

  const downloadResume = async (resumeUrl: string) => {
    const { data, error } = await supabase.storage.from("resumes").download(resumeUrl);
    if (error) { toast.error("Failed to download resume"); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = resumeUrl;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusColor = (s: string) => {
    switch(s) {
      case "new": return "bg-blue-500/20 text-blue-400";
      case "reviewed": return "bg-yellow-500/20 text-yellow-400";
      case "shortlisted": return "bg-purple-500/20 text-purple-400";
      case "hired": return "bg-green-500/20 text-green-400";
      case "rejected": return "bg-red-500/20 text-red-400";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Applications</h1>

      <div className="flex flex-wrap gap-4">
        <Select value={filterJob} onValueChange={setFilterJob}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by job" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {jobs.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((a) => (
            <div key={a.id} className="glass rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{a.full_name}</h3>
                <p className="text-sm text-muted-foreground">{a.email}</p>
                <p className="text-xs text-muted-foreground">{a.job_title} • {format(new Date(a.created_at), "MMM d, yyyy")}</p>
              </div>
              <Select value={a.status} onValueChange={(v) => updateStatus(a.id, v)}>
                <SelectTrigger className={`w-32 ${statusColor(a.status)}`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {a.resume_url && <Button size="icon" variant="ghost" onClick={() => downloadResume(a.resume_url!)}><Download className="h-4 w-4" /></Button>}
              <Button size="icon" variant="ghost" onClick={() => { setSelectedApp(a); setNotes(a.internal_notes || ""); }}><Eye className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">No applications found.</div>
      )}

      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="glass max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Application Details</DialogTitle></DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-sm text-muted-foreground">Name</span><p className="font-semibold">{selectedApp.full_name}</p></div>
                <div><span className="text-sm text-muted-foreground">Email</span><p>{selectedApp.email}</p></div>
                {selectedApp.phone && <div><span className="text-sm text-muted-foreground">Phone</span><p>{selectedApp.phone}</p></div>}
                {selectedApp.location && <div><span className="text-sm text-muted-foreground">Location</span><p>{selectedApp.location}</p></div>}
                {selectedApp.linkedin_url && <div><span className="text-sm text-muted-foreground">LinkedIn</span><a href={selectedApp.linkedin_url} target="_blank" className="text-primary hover:underline block truncate">{selectedApp.linkedin_url}</a></div>}
                {selectedApp.portfolio_url && <div><span className="text-sm text-muted-foreground">Portfolio</span><a href={selectedApp.portfolio_url} target="_blank" className="text-primary hover:underline block truncate">{selectedApp.portfolio_url}</a></div>}
              </div>
              {selectedApp.cover_letter && <div><span className="text-sm text-muted-foreground">Cover Letter</span><p className="mt-1 whitespace-pre-wrap text-sm">{selectedApp.cover_letter}</p></div>}
              {selectedApp.experience && <div><span className="text-sm text-muted-foreground">Experience</span><p className="mt-1 whitespace-pre-wrap text-sm">{selectedApp.experience}</p></div>}
              {selectedApp.education && <div><span className="text-sm text-muted-foreground">Education</span><p className="mt-1 whitespace-pre-wrap text-sm">{selectedApp.education}</p></div>}
              <div>
                <Label>Internal Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1" />
                <Button onClick={saveNotes} size="sm" className="mt-2">Save Notes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
