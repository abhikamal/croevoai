import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

interface Invite {
  id: string;
  token: string;
  email: string | null;
  used_at: string | null;
  expires_at: string;
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkInviteAndAuth();
  }, [token]);

  const checkInviteAndAuth = async () => {
    // Check invite validity
    const { data: inviteData, error: inviteError } = await supabase
      .from("admin_invites")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (inviteError || !inviteData) {
      setError("Invalid invite link");
      setLoading(false);
      return;
    }

    if (inviteData.used_at) {
      setError("This invite has already been used");
      setLoading(false);
      return;
    }

    if (new Date(inviteData.expires_at) < new Date()) {
      setError("This invite has expired");
      setLoading(false);
      return;
    }

    setInvite(inviteData);
    if (inviteData.email) {
      setEmail(inviteData.email);
    }

    // Check if user is already logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      // Check if email matches invite restriction
      if (inviteData.email && session.user.email !== inviteData.email) {
        setError(`This invite is restricted to ${inviteData.email}`);
      }
    }

    setLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    if (invite?.email && email !== invite.email) {
      toast({ 
        title: "Email mismatch", 
        description: `This invite is restricted to ${invite.email}`, 
        variant: "destructive" 
      });
      setProcessing(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/invite/${token}`,
          },
        });
        if (error) throw error;
        if (data.user) {
          await claimInvite(data.user.id);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          await claimInvite(data.user.id);
        }
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setProcessing(false);
  };

  const claimInvite = async (userId: string) => {
    // Check if user already has admin role
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (existingRole) {
      toast({ title: "Already admin", description: "You already have admin privileges" });
      navigate("/admin");
      return;
    }

    // Add admin role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (roleError) {
      toast({ title: "Error", description: roleError.message, variant: "destructive" });
      return;
    }

    // Mark invite as used
    await supabase
      .from("admin_invites")
      .update({ used_by: userId, used_at: new Date().toISOString() })
      .eq("id", invite?.id);

    toast({ title: "Success!", description: "You are now an admin" });
    navigate("/admin");
  };

  const handleClaimAsLoggedIn = async () => {
    if (!user) return;
    setProcessing(true);
    await claimInvite(user.id);
    setProcessing(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Invalid Invite</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => navigate("/")}>Go Home</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (user && !error) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Accept Admin Invite</CardTitle>
              <CardDescription>
                You are logged in as {user.email}. Click below to become an admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                onClick={handleClaimAsLoggedIn}
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Become Admin
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle>Admin Invite</CardTitle>
            <CardDescription>
              {isSignUp ? "Create an account to become an admin" : "Sign in to become an admin"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={!!invite?.email}
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={processing}>
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isSignUp ? "Sign Up & Become Admin" : "Sign In & Become Admin"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary hover:underline"
              >
                {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
