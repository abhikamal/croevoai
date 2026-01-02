import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw } from "lucide-react";

interface SiteContent {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  button_text: string | null;
  button_link: string | null;
  is_active: boolean;
}

export default function AdminSiteContent() {
  const [content, setContent] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from("site_content")
      .select("*")
      .order("section_key");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setContent(data || []);
    }
    setLoading(false);
  };

  const handleUpdate = async (item: SiteContent) => {
    setSaving(item.id);
    const { error } = await supabase
      .from("site_content")
      .update({
        title: item.title,
        subtitle: item.subtitle,
        content: item.content,
        button_text: item.button_text,
        button_link: item.button_link,
      })
      .eq("id", item.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Content updated successfully" });
    }
    setSaving(null);
  };

  const updateField = (id: string, field: keyof SiteContent, value: string) => {
    setContent((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Home Page Content</h1>
        <Button variant="outline" onClick={fetchContent}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        {content.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="capitalize">
                {item.section_key.replace("_", " ")} Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={item.title || ""}
                    onChange={(e) => updateField(item.id, "title", e.target.value)}
                    placeholder="Section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={item.subtitle || ""}
                    onChange={(e) => updateField(item.id, "subtitle", e.target.value)}
                    placeholder="Section subtitle"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={item.content || ""}
                  onChange={(e) => updateField(item.id, "content", e.target.value)}
                  placeholder="Section content"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={item.button_text || ""}
                    onChange={(e) => updateField(item.id, "button_text", e.target.value)}
                    placeholder="Button label"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Link</Label>
                  <Input
                    value={item.button_link || ""}
                    onChange={(e) => updateField(item.id, "button_link", e.target.value)}
                    placeholder="/about"
                  />
                </div>
              </div>

              <Button
                onClick={() => handleUpdate(item)}
                disabled={saving === item.id}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving === item.id ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
