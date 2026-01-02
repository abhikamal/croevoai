import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Clock, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobApplicationForm } from "@/components/careers/JobApplicationForm";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  job_type: string;
  description: string;
  requirements: string | null;
  is_open: boolean;
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    const { data, error } = await supabase
      .from("job_postings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      setJob(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24">
          <Skeleton className="h-10 w-1/2 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-display font-bold mb-4">Job Not Found</h1>
          <p className="text-muted-foreground mb-8">
            This position may no longer be available.
          </p>
          <Link to="/careers">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Careers
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24">
        <Link
          to="/careers"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Careers
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Job Header */}
          <div className="glass rounded-2xl p-8 mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-display font-bold">
                  {job.title}
                </h1>
                <p className="text-lg text-primary">{job.department}</p>
                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {job.job_type}
                  </span>
                  <span className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    {job.is_open ? "Open" : "Closed"}
                  </span>
                </div>
              </div>
              {job.is_open && (
                <Button
                  size="lg"
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90 glow-primary"
                >
                  Apply Now
                </Button>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div className="glass rounded-2xl p-8 space-y-8 animate-fade-in-up">
            <div>
              <h2 className="text-xl font-display font-bold mb-4">Description</h2>
              <div className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {job.requirements && (
              <div>
                <h2 className="text-xl font-display font-bold mb-4">Requirements</h2>
                <div className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                  {job.requirements}
                </div>
              </div>
            )}

            {job.is_open && (
              <div className="pt-4">
                <Button
                  size="lg"
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90 w-full md:w-auto"
                >
                  Apply for this Position
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showForm && (
        <JobApplicationForm
          jobId={job.id}
          jobTitle={job.title}
          onClose={() => setShowForm(false)}
        />
      )}
    </Layout>
  );
}
