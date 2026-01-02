import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <span className="text-xl font-display font-bold text-gradient">
              Croevo AI
            </span>
            <p className="text-sm text-muted-foreground">
              Building the future of artificial intelligence, one innovation at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold">Company</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/team" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Our Team
              </Link>
              <Link to="/careers" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Careers
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold">Resources</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/news" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                News & Updates
              </Link>
              <Link to="/verify" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Verify Memo
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold">Legal</h4>
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-muted-foreground">Privacy Policy</span>
              <span className="text-sm text-muted-foreground">Terms of Service</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Croevo AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
