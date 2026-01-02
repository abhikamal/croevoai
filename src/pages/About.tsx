import { Layout } from "@/components/layout/Layout";
import { Target, Eye, Heart } from "lucide-react";

export default function About() {
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
              About <span className="text-gradient">Croevo AI</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              We are pioneers in artificial intelligence, dedicated to creating innovative 
              solutions that transform how businesses and people interact with technology.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-8 md:p-12 space-y-6 animate-fade-in">
              <h2 className="text-3xl font-display font-bold">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded with a vision to democratize artificial intelligence, Croevo AI has 
                  grown from a small team of passionate researchers to a leading force in the 
                  AI industry. Our journey began with a simple belief: that AI should be 
                  accessible, ethical, and beneficial to all.
                </p>
                <p>
                  Today, we work with enterprises across the globe, helping them harness the 
                  power of AI to solve complex challenges, streamline operations, and unlock 
                  new possibilities. Our commitment to innovation and excellence drives 
                  everything we do.
                </p>
                <p>
                  As we continue to push the boundaries of what's possible, we remain 
                  grounded in our core values: integrity, collaboration, and a relentless 
                  pursuit of knowledge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="glass rounded-2xl p-8 space-y-4 animate-fade-in-up">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Target className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold">Our Mission</h3>
              <p className="text-muted-foreground">
                To develop cutting-edge AI solutions that empower businesses and individuals 
                to achieve their full potential through intelligent automation and insights.
              </p>
            </div>

            <div className="glass rounded-2xl p-8 space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold">Our Vision</h3>
              <p className="text-muted-foreground">
                To be the global leader in ethical AI development, creating a future where 
                artificial intelligence works harmoniously alongside humanity.
              </p>
            </div>

            <div className="glass rounded-2xl p-8 space-y-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold">Our Values</h3>
              <p className="text-muted-foreground">
                Innovation, integrity, collaboration, and a commitment to making AI 
                accessible and beneficial for everyone, everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-8 md:p-12 space-y-8 animate-fade-in">
              <h2 className="text-3xl font-display font-bold text-center">
                What Makes Us <span className="text-gradient">Different</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h4 className="font-display font-semibold text-lg">Research-Driven</h4>
                  <p className="text-muted-foreground text-sm">
                    Our solutions are built on the latest research and breakthroughs in AI, 
                    ensuring you get the most advanced technology available.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-display font-semibold text-lg">Ethical AI</h4>
                  <p className="text-muted-foreground text-sm">
                    We prioritize responsible AI development, ensuring our solutions are 
                    fair, transparent, and respect user privacy.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-display font-semibold text-lg">Custom Solutions</h4>
                  <p className="text-muted-foreground text-sm">
                    We don't believe in one-size-fits-all. Every solution is tailored to 
                    meet your specific needs and challenges.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-display font-semibold text-lg">Global Expertise</h4>
                  <p className="text-muted-foreground text-sm">
                    Our diverse team brings together talent from around the world, offering 
                    unique perspectives and innovative approaches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
