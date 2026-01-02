import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, Cpu, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { SubscribeForm } from "@/components/home/SubscribeForm";
import { supabase } from "@/integrations/supabase/client";

const features = [
  {
    icon: Brain,
    title: "Advanced AI",
    description: "Cutting-edge machine learning and neural network solutions",
  },
  {
    icon: Cpu,
    title: "Scalable Infrastructure",
    description: "Enterprise-grade systems built for performance",
  },
  {
    icon: Sparkles,
    title: "Innovation First",
    description: "Pioneering new frontiers in artificial intelligence",
  },
  {
    icon: Zap,
    title: "Real-time Processing",
    description: "Lightning-fast AI inference and data processing",
  },
];

interface SiteContent {
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  button_text: string | null;
  button_link: string | null;
}

export default function Index() {
  const [heroContent, setHeroContent] = useState<SiteContent | null>(null);
  const [ctaContent, setCtaContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("*")
        .in("section_key", ["hero", "cta"]);

      if (data) {
        setHeroContent(data.find((d) => d.section_key === "hero") || null);
        setCtaContent(data.find((d) => d.section_key === "cta") || null);
      }
    };
    fetchContent();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-glow-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{heroContent?.subtitle || "The Future of AI is Here"}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight">
              {heroContent?.title?.split(" ").slice(0, 2).join(" ") || "Building Tomorrow's"}
              <span className="text-gradient block">
                {heroContent?.title?.split(" ").slice(2).join(" ") || "Intelligence Today"}
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {heroContent?.content || "Croevo AI is at the forefront of artificial intelligence innovation, creating solutions that transform industries and empower businesses worldwide."}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={heroContent?.button_link || "/about"}>
                <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 glow-primary">
                  {heroContent?.button_text || "Discover More"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/careers">
                <Button size="lg" variant="outline" className="border-border hover:bg-secondary">
                  Join Our Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              What We <span className="text-gradient">Excel At</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our expertise spans across multiple domains of artificial intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl glass glass-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="glass rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
              Stay Updated
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Subscribe to our newsletter for the latest AI insights, company updates, and industry news.
            </p>
            <div className="flex justify-center">
              <SubscribeForm />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl glass overflow-hidden p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-4xl font-display font-bold">
                {ctaContent?.title || "Ready to Shape the Future?"}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {ctaContent?.content || "Join our team of innovators and help build the next generation of AI solutions."}
              </p>
              <Link to={ctaContent?.button_link || "/careers"}>
                <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                  {ctaContent?.button_text || "View Open Positions"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
