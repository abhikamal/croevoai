import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  job_type: string;
  description: string;
  requirements: string | null;
  is_open: boolean;
}

const emptyJob = { title: "", department: "", location: "", job_type: "Full-time", description: "", requirements: "", is_open: true };

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [formData, setFormData] = useState(emptyJob);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    const { data } = await supabase.from("job_postings").select("*").order("created_at", { ascending: false });
    if (data) setJobs(data);
    setLoading(false);
  };

  const openDialog = (job?: Job) => {
    if (job) {
      setEditing(job);
      setFormData({ title: job.title, department: job.department, location: job.location, job_type: job.job_type, description: job.description, requirements: job.requirements || "", is_open: job.is_open });
    } else {
      setEditing(null);
      setFormData(emptyJob);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...formData, requirements: formData.requirements || null };
      if (editing) {
        const { error } = await supabase.from("job_postings").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Job updated");
      } else {
        const { error } = await supabase.from("job_postings").insert(payload);
        if (error) throw error;
        toast.success("Job created");
      }
      setDialogOpen(false);
      fetchJobs();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job posting?")) return;
    const { error } = await supabase.from("job_postings").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); fetchJobs(); }
  };

  const toggleOpen = async (job: Job) => {
    const { error } = await supabase.from("job_postings").update({ is_open: !job.is_open }).eq("id", job.id);
    if (error) toast.error(error.message);
    else fetchJobs();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold">Job Postings</h1>
        <Button onClick={() => openDialog()} className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Add Job</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {jobs.map((j) => (
            <div key={j.id} className="glass rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">{j.title}</h3>
                <p className="text-sm text-muted-foreground">{j.department} • {j.location} • {j.job_type}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${j.is_open ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {j.is_open ? "Open" : "Closed"}
                </span>
                <Switch checked={j.is_open} onCheckedChange={() => toggleOpen(j)} />
                <Button size="icon" variant="ghost" onClick={() => openDialog(j)}><Edit className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(j.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Create"} Job Posting</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Department *</Label><Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} /></div>
              <div><Label>Location *</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></div>
              <div><Label>Type</Label><Input value={formData.job_type} onChange={(e) => setFormData({ ...formData, job_type: e.target.value })} /></div>
            </div>
            <div><Label>Description *</Label><Textarea rows={6} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div><Label>Requirements</Label><Textarea rows={4} value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} /></div>
            <div className="flex items-center gap-2"><Switch checked={formData.is_open} onCheckedChange={(v) => setFormData({ ...formData, is_open: v })} /><Label>Position is Open</Label></div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary text-primary-foreground">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
