import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Linkedin, Twitter, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
}

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data) {
      setTeamMembers(data);
    }
    setLoading(false);
  };

  const departments = ["all", ...new Set(teamMembers.map((m) => m.department))];
  const filteredMembers = selectedDepartment === "all" 
    ? teamMembers 
    : teamMembers.filter((m) => m.department === selectedDepartment);

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
              Meet Our <span className="text-gradient">Team</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              The brilliant minds behind Croevo AI's innovations
            </p>
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

      {/* Team Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass rounded-2xl p-6 space-y-4">
                  <Skeleton className="w-24 h-24 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : filteredMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMembers.map((member, index) => (
                <div
                  key={member.id}
                  className="glass rounded-2xl p-6 text-center space-y-4 glass-hover animate-fade-in-up group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Photo */}
                  <div className="relative w-24 h-24 mx-auto">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover border-2 border-border group-hover:border-primary transition-colors"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center border-2 border-border group-hover:border-primary transition-colors">
                        <User className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="font-display font-semibold text-lg">{member.name}</h3>
                    <p className="text-primary text-sm">{member.role}</p>
                    <p className="text-muted-foreground text-xs">{member.department}</p>
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {member.bio}
                    </p>
                  )}

                  {/* Social Links */}
                  {(member.linkedin_url || member.twitter_url) && (
                    <div className="flex justify-center gap-3">
                      {member.linkedin_url && (
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {member.twitter_url && (
                        <a
                          href={member.twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No team members to display yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
