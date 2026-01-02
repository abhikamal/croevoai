import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Mail, Phone, Clock, Linkedin, Twitter, Facebook, Instagram } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ContactDetails {
  address: string | null;
  email: string | null;
  phone: string | null;
  working_hours: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
}

export default function Contact() {
  const [contact, setContact] = useState<ContactDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    const { data, error } = await supabase.from("contact_details").select("*").limit(1).maybeSingle();
    if (!error && data) setContact(data);
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
              Get in <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground">We'd love to hear from you</p>
          </div>

          {loading ? (
            <div className="max-w-2xl mx-auto glass rounded-2xl p-8">
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ) : contact ? (
            <div className="max-w-2xl mx-auto glass rounded-2xl p-8 space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contact.address && (
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-display font-semibold mb-1">Address</h3>
                      <p className="text-muted-foreground">{contact.address}</p>
                    </div>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-display font-semibold mb-1">Email</h3>
                      <a href={`mailto:${contact.email}`} className="text-muted-foreground hover:text-primary">{contact.email}</a>
                    </div>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-display font-semibold mb-1">Phone</h3>
                      <a href={`tel:${contact.phone}`} className="text-muted-foreground hover:text-primary">{contact.phone}</a>
                    </div>
                  </div>
                )}
                {contact.working_hours && (
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-display font-semibold mb-1">Working Hours</h3>
                      <p className="text-muted-foreground">{contact.working_hours}</p>
                    </div>
                  </div>
                )}
              </div>

              {(contact.linkedin_url || contact.twitter_url || contact.facebook_url || contact.instagram_url) && (
                <div className="pt-6 border-t border-border">
                  <h3 className="font-display font-semibold mb-4">Follow Us</h3>
                  <div className="flex gap-4">
                    {contact.linkedin_url && <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"><Linkedin className="h-5 w-5" /></a>}
                    {contact.twitter_url && <a href={contact.twitter_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"><Twitter className="h-5 w-5" /></a>}
                    {contact.facebook_url && <a href={contact.facebook_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"><Facebook className="h-5 w-5" /></a>}
                    {contact.instagram_url && <a href={contact.instagram_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"><Instagram className="h-5 w-5" /></a>}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Contact information not available.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
