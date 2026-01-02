import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  display_order: number;
}

const emptyMember = { name: "", role: "", department: "", bio: "", photo_url: "", linkedin_url: "", twitter_url: "", display_order: 0 };

export default function AdminTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState(emptyMember);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    const { data } = await supabase.from("team_members").select("*").order("display_order");
    if (data) setMembers(data);
    setLoading(false);
  };

  const openDialog = (member?: TeamMember) => {
    if (member) {
      setEditing(member);
      setFormData({ name: member.name, role: member.role, department: member.department, bio: member.bio || "", photo_url: member.photo_url || "", linkedin_url: member.linkedin_url || "", twitter_url: member.twitter_url || "", display_order: member.display_order });
    } else {
      setEditing(null);
      setFormData(emptyMember);
    }
    setPhotoFile(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let photo_url = formData.photo_url;

      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("team-photos").upload(fileName, photoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("team-photos").getPublicUrl(fileName);
        photo_url = urlData.publicUrl;
      }

      const payload = { ...formData, photo_url: photo_url || null, bio: formData.bio || null, linkedin_url: formData.linkedin_url || null, twitter_url: formData.twitter_url || null };

      if (editing) {
        const { error } = await supabase.from("team_members").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Team member updated");
      } else {
        const { error } = await supabase.from("team_members").insert(payload);
        if (error) throw error;
        toast.success("Team member added");
      }
      setDialogOpen(false);
      fetchMembers();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team member?")) return;
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); fetchMembers(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold">Team Members</h1>
        <Button onClick={() => openDialog()} className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Add Member</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <div key={m.id} className="glass rounded-xl p-4 flex items-start gap-4">
              {m.photo_url ? (
                <img src={m.photo_url} alt={m.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center"><User className="h-8 w-8 text-muted-foreground" /></div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{m.name}</h3>
                <p className="text-sm text-primary">{m.role}</p>
                <p className="text-xs text-muted-foreground">{m.department}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => openDialog(m)}><Edit className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div><Label>Role *</Label><Input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} /></div>
            </div>
            <div><Label>Department *</Label><Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} /></div>
            <div><Label>Photo</Label><Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} /></div>
            <div><Label>Bio</Label><Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>LinkedIn URL</Label><Input value={formData.linkedin_url} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })} /></div>
              <div><Label>Twitter URL</Label><Input value={formData.twitter_url} onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })} /></div>
            </div>
            <div><Label>Display Order</Label><Input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} /></div>
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
