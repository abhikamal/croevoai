import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ContactDetails {
  id: string;
  address: string;
  email: string;
  phone: string;
  working_hours: string;
  linkedin_url: string;
  twitter_url: string;
  facebook_url: string;
  instagram_url: string;
}

export default function AdminContact() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactId, setContactId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    address: "",
    email: "",
    phone: "",
    working_hours: "",
    linkedin_url: "",
    twitter_url: "",
    facebook_url: "",
    instagram_url: "",
  });

  useEffect(() => { fetchContact(); }, []);

  const fetchContact = async () => {
    const { data } = await supabase.from("contact_details").select("*").limit(1).maybeSingle();
    if (data) {
      setContactId(data.id);
      setFormData({
        address: data.address || "",
        email: data.email || "",
        phone: data.phone || "",
        working_hours: data.working_hours || "",
        linkedin_url: data.linkedin_url || "",
        twitter_url: data.twitter_url || "",
        facebook_url: data.facebook_url || "",
        instagram_url: data.instagram_url || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        address: formData.address || null,
        email: formData.email || null,
        phone: formData.phone || null,
        working_hours: formData.working_hours || null,
        linkedin_url: formData.linkedin_url || null,
        twitter_url: formData.twitter_url || null,
        facebook_url: formData.facebook_url || null,
        instagram_url: formData.instagram_url || null,
      };

      if (contactId) {
        const { error } = await supabase.from("contact_details").update(payload).eq("id", contactId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("contact_details").insert(payload);
        if (error) throw error;
      }
      toast.success("Contact details saved");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Contact Details</h1>

      <div className="glass rounded-xl p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <Label>Company Address</Label>
            <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="123 Business Street, City" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="contact@company.com" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 123-4567" />
            </div>
          </div>
          <div>
            <Label>Working Hours</Label>
            <Input value={formData.working_hours} onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })} placeholder="Mon-Fri: 9:00 AM - 6:00 PM" />
          </div>
          
          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold mb-4">Social Media Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>LinkedIn URL</Label>
                <Input value={formData.linkedin_url} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })} placeholder="https://linkedin.com/company/..." />
              </div>
              <div>
                <Label>Twitter URL</Label>
                <Input value={formData.twitter_url} onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })} placeholder="https://twitter.com/..." />
              </div>
              <div>
                <Label>Facebook URL</Label>
                <Input value={formData.facebook_url} onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })} placeholder="https://facebook.com/..." />
              </div>
              <div>
                <Label>Instagram URL</Label>
                <Input value={formData.instagram_url} onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })} placeholder="https://instagram.com/..." />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary text-primary-foreground">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
