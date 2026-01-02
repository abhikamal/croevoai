import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
}

export function JobApplicationForm({ jobId, jobTitle, onClose }: JobApplicationFormProps) {
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    linkedin_url: "",
    portfolio_url: "",
    cover_letter: "",
    experience: "",
    education: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let resume_url = null;

      if (resumeFile) {
        const fileExt = resumeFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(fileName, resumeFile);

        if (uploadError) throw uploadError;
        resume_url = fileName;
      }

      const { error } = await supabase.from("job_applications").insert({
        job_id: jobId,
        ...formData,
        resume_url,
      });

      if (error) throw error;

      toast.success("Application submitted successfully!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold">Apply for {jobTitle}</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" required value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input id="linkedin_url" value={formData.linkedin_url} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfolio URL</Label>
              <Input id="portfolio_url" value={formData.portfolio_url} onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume/CV (PDF)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <input type="file" id="resume" accept=".pdf" className="hidden" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
              <label htmlFor="resume" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{resumeFile ? resumeFile.name : "Click to upload"}</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_letter">Cover Letter</Label>
            <Textarea id="cover_letter" rows={4} value={formData.cover_letter} onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Work Experience</Label>
            <Textarea id="experience" rows={4} placeholder="Describe your relevant work experience..." value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Textarea id="education" rows={3} placeholder="Your educational background..." value={formData.education} onChange={(e) => setFormData({ ...formData, education: e.target.value })} />
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-primary text-primary-foreground">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
