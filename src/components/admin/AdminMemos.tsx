import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Pin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

interface Memo {
  id: string;
  verification_id: string;
  title: string;
  content: string;
  category: string | null;
  visibility: string;
  is_pinned: boolean;
  author_name: string;
  published_at: string;
}

const emptyMemo = { title: "", content: "", category: "", visibility: "public", is_pinned: false, author_name: "" };

export default function AdminMemos() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Memo | null>(null);
  const [formData, setFormData] = useState(emptyMemo);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchMemos(); }, []);

  const fetchMemos = async () => {
    const { data } = await supabase.from("memos").select("*").order("published_at", { ascending: false });
    if (data) setMemos(data);
    setLoading(false);
  };

  const openDialog = (memo?: Memo) => {
    if (memo) {
      setEditing(memo);
      setFormData({ title: memo.title, content: memo.content, category: memo.category || "", visibility: memo.visibility, is_pinned: memo.is_pinned, author_name: memo.author_name });
    } else {
      setEditing(null);
      setFormData(emptyMemo);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...formData, category: formData.category || null };
      if (editing) {
        const { error } = await supabase.from("memos").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Memo updated");
      } else {
        const { error } = await supabase.from("memos").insert({
          title: formData.title,
          content: formData.content,
          author_name: formData.author_name,
          category: formData.category || null,
          visibility: formData.visibility,
          is_pinned: formData.is_pinned,
          verification_id: `CRVO-${new Date().getFullYear()}-0000`,
        });
        if (error) throw error;
        toast.success("Memo created");
      }
      setDialogOpen(false);
      fetchMemos();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this memo?")) return;
    const { error } = await supabase.from("memos").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); fetchMemos(); }
  };

  const togglePin = async (memo: Memo) => {
    const { error } = await supabase.from("memos").update({ is_pinned: !memo.is_pinned }).eq("id", memo.id);
    if (error) toast.error(error.message);
    else fetchMemos();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold">Memos & News</h1>
        <Button onClick={() => openDialog()} className="bg-gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Add Memo</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {memos.map((m) => (
            <div key={m.id} className="glass rounded-xl p-4">
              <div className="flex items-start gap-4">
                {m.is_pinned && <Pin className="h-5 w-5 text-primary flex-shrink-0" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{m.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${m.visibility === "public" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {m.visibility}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {m.verification_id} • By {m.author_name} • {format(new Date(m.published_at), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => togglePin(m)} title="Toggle Pin"><Pin className={`h-4 w-4 ${m.is_pinned ? "text-primary" : ""}`} /></Button>
                  <Button size="icon" variant="ghost" onClick={() => openDialog(m)}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Create"} Memo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
            <div><Label>Author Name *</Label><Input value={formData.author_name} onChange={(e) => setFormData({ ...formData, author_name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category</Label><Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Announcement" /></div>
              <div>
                <Label>Visibility</Label>
                <Select value={formData.visibility} onValueChange={(v) => setFormData({ ...formData, visibility: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="internal">Internal (Employees Only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Content *</Label><Textarea rows={8} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} /></div>
            <div className="flex items-center gap-2"><Switch checked={formData.is_pinned} onCheckedChange={(v) => setFormData({ ...formData, is_pinned: v })} /><Label>Pin this memo</Label></div>
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
