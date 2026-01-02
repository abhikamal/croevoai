import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Tag, Pin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function News() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemos();
  }, []);

  const fetchMemos = async () => {
    const { data, error } = await supabase
      .from("memos")
      .select("*")
      .eq("visibility", "public")
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false });

    if (!error && data) {
      setMemos(data);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <section className="py-24 relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in-up mb-16">
            <h1 className="text-4xl md:text-6xl font-display font-bold">
              News & <span className="text-gradient">Updates</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Stay informed with the latest from Croevo AI
            </p>
          </div>

          {loading ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass rounded-2xl p-8">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/4 mb-4" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ))}
            </div>
          ) : memos.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {memos.map((memo, index) => (
                <article
                  key={memo.id}
                  className="glass rounded-2xl p-8 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    {memo.is_pinned && (
                      <Pin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <h2 className="text-xl font-display font-bold mb-2">{memo.title}</h2>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(memo.published_at), "MMM d, yyyy")}
                        </span>
                        <span>By {memo.author_name}</span>
                        {memo.category && (
                          <span className="flex items-center gap-1">
                            <Tag className="h-4 w-4" />
                            {memo.category}
                          </span>
                        )}
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          ID: {memo.verification_id}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                    {memo.content}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No news articles yet.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
