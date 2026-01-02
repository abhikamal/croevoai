import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, MapPin, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  job_type: string;
  description: string;
  is_open: boolean;
}

export default function Careers() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("job_postings")
      .select("*")
      .eq("is_open", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setJobs(data);
    }
    setLoading(false);
  };

  const departments = ["all", ...new Set(jobs.map((j) => j.department))];
  const filteredJobs = selectedDepartment === "all" 
    ? jobs 
    : jobs.filter((j) => j.department === selectedDepartment);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-display font-bold">
              Join <span className="text-gradient">Croevo AI</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Be part of a team that's shaping the future of artificial intelligence
            </p>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-8 md:p-12 space-y-6 animate-fade-in">
              <h2 className="text-3xl font-display font-bold text-center">
                Why Join <span className="text-gradient">Us?</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-display font-bold text-primary">Innovation</div>
                  <p className="text-sm text-muted-foreground">
                    Work on cutting-edge AI technology
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-display font-bold text-primary">Growth</div>
                  <p className="text-sm text-muted-foreground">
                    Continuous learning and development
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-display font-bold text-primary">Impact</div>
                  <p className="text-sm text-muted-foreground">
                    Make a real difference in the world
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Department Filter */}
      {departments.length > 1 && (
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedDepartment === dept
                      ? "bg-gradient-primary text-primary-foreground"
                      : "glass hover:bg-secondary"
                  }`}
                >
                  {dept === "all" ? "All Departments" : dept}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Job Listings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-display font-bold mb-8 text-center">
            Open Positions
          </h2>

          {loading ? (
            <div className="max-w-3xl mx-auto space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass rounded-xl p-6">
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3 mb-4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-4">
              {filteredJobs.map((job, index) => (
                <Link
                  key={job.id}
                  to={`/careers/${job.id}`}
                  className="block glass rounded-xl p-6 glass-hover animate-fade-in-up group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-display font-semibold group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-sm text-primary">{job.department}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.job_type}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-4">
                No open positions at the moment.
              </p>
              <p className="text-sm text-muted-foreground">
                Check back soon or follow us on social media for updates!
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
