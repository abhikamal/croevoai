import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface MemoResult {
  verification_id: string;
  title: string;
  author_name: string;
  published_at: string;
  visibility: string;
}

export default function Verify() {
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MemoResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setResult(null);
    setNotFound(false);

    const { data, error } = await supabase
      .from("memos")
      .select("verification_id, title, author_name, published_at, visibility")
      .eq("verification_id", searchId.trim().toUpperCase())
      .maybeSingle();

    if (error || !data) {
      setNotFound(true);
    } else {
      setResult(data);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <section className="py-24 relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl mx-auto text-center space-y-8">
            <div className="space-y-4 animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-display font-bold">
                Verify <span className="text-gradient">Memo</span>
              </h1>
              <p className="text-muted-foreground">
                Enter a memo verification ID to confirm its authenticity
              </p>
            </div>

            <form onSubmit={handleVerify} className="flex gap-2 animate-fade-in">
              <Input
                placeholder="e.g., CRVO-2026-0001"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="text-center text-lg"
              />
              <Button type="submit" disabled={loading} className="bg-gradient-primary text-primary-foreground">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>

            {result && (
              <div className="glass rounded-2xl p-8 text-left animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <span className="text-lg font-semibold text-green-500">Verified Memo</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Verification ID</span>
                    <p className="font-mono text-primary">{result.verification_id}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Title</span>
                    <p className="font-display font-semibold">{result.title}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Author</span>
                    <p>{result.author_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Published</span>
                    <p>{format(new Date(result.published_at), "MMMM d, yyyy")}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Visibility</span>
                    <p className="capitalize">{result.visibility}</p>
                  </div>
                </div>
              </div>
            )}

            {notFound && (
              <div className="glass rounded-2xl p-8 animate-fade-in-up">
                <div className="flex items-center justify-center gap-3">
                  <XCircle className="h-8 w-8 text-destructive" />
                  <span className="text-lg font-semibold text-destructive">Memo Not Found</span>
                </div>
                <p className="text-muted-foreground mt-4">
                  This verification ID does not match any official Croevo AI memo.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
