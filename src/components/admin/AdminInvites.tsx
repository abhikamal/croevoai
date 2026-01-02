import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link2, Copy, Trash2, RefreshCw, UserPlus, Check } from "lucide-react";
import { format } from "date-fns";

interface AdminInvite {
  id: string;
  token: string;
  email: string | null;
  created_by: string;
  used_by: string | null;
  used_at: string | null;
  expires_at: string;
  created_at: string;
}

export default function AdminInvites() {
  const [invites, setInvites] = useState<AdminInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_invites")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setInvites(data || []);
    }
    setLoading(false);
  };

  const handleCreateInvite = async () => {
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({ title: "Error", description: "Not authenticated", variant: "destructive" });
      setCreating(false);
      return;
    }

    const { error } = await supabase.from("admin_invites").insert({
      email: email || null,
      created_by: user.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Created", description: "Invite link created" });
      setEmail("");
      fetchInvites();
    }
    setCreating(false);
  };

  const handleDeleteInvite = async (id: string) => {
    const { error } = await supabase.from("admin_invites").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Invite removed" });
      fetchInvites();
    }
  };

  const copyInviteLink = async (token: string, id: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast({ title: "Copied!", description: "Invite link copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getInviteStatus = (invite: AdminInvite) => {
    if (invite.used_at) return { label: "Used", variant: "secondary" as const };
    if (new Date(invite.expires_at) < new Date()) return { label: "Expired", variant: "destructive" as const };
    return { label: "Active", variant: "default" as const };
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Invites</h1>
        <Button variant="outline" onClick={fetchInvites}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Invite Link</CardTitle>
          <CardDescription>
            Generate a link to invite someone as an admin. The link expires in 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label>Email (optional)</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to restrict invite"
              />
            </div>
            <Button onClick={handleCreateInvite} disabled={creating}>
              <UserPlus className="h-4 w-4 mr-2" />
              {creating ? "Creating..." : "Create Invite"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            If you specify an email, only that email can use the invite link.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Invites</CardTitle>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No invites created yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => {
                  const status = getInviteStatus(invite);
                  return (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">
                        {invite.email || <span className="text-muted-foreground">Anyone</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(invite.expires_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>{format(new Date(invite.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!invite.used_at && new Date(invite.expires_at) > new Date() && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyInviteLink(invite.token, invite.id)}
                            >
                              {copiedId === invite.id ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteInvite(invite.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
