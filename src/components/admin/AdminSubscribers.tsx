import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, Users, Mail, Trash2, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
}

interface Newsletter {
  id: string;
  subject: string;
  content: string;
  status: string;
  sent_at: string | null;
  sent_count: number;
  created_at: string;
}

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newNewsletter, setNewNewsletter] = useState({ subject: "", content: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [subsRes, newsRes] = await Promise.all([
      supabase.from("subscribers").select("*").order("subscribed_at", { ascending: false }),
      supabase.from("newsletters").select("*").order("created_at", { ascending: false }),
    ]);

    if (subsRes.error) {
      toast({ title: "Error", description: subsRes.error.message, variant: "destructive" });
    } else {
      setSubscribers(subsRes.data || []);
    }

    if (newsRes.error) {
      toast({ title: "Error", description: newsRes.error.message, variant: "destructive" });
    } else {
      setNewsletters(newsRes.data || []);
    }
    setLoading(false);
  };

  const handleCreateNewsletter = async () => {
    if (!newNewsletter.subject || !newNewsletter.content) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("newsletters").insert({
      subject: newNewsletter.subject,
      content: newNewsletter.content,
      status: "draft",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Created", description: "Newsletter draft created" });
      setNewNewsletter({ subject: "", content: "" });
      fetchData();
    }
  };

  const handleSendNewsletter = async (newsletter: Newsletter) => {
    setSending(true);
    const activeSubscribers = subscribers.filter((s) => s.is_active);

    if (activeSubscribers.length === 0) {
      toast({ title: "No subscribers", description: "There are no active subscribers", variant: "destructive" });
      setSending(false);
      return;
    }

    try {
      const response = await supabase.functions.invoke("send-newsletter", {
        body: {
          newsletterId: newsletter.id,
          subject: newsletter.subject,
          content: newsletter.content,
          subscribers: activeSubscribers.map((s) => s.email),
        },
      });

      if (response.error) throw response.error;

      await supabase
        .from("newsletters")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          sent_count: activeSubscribers.length,
        })
        .eq("id", newsletter.id);

      toast({ title: "Sent!", description: `Newsletter sent to ${activeSubscribers.length} subscribers` });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send newsletter", variant: "destructive" });
    }
    setSending(false);
  };

  const handleDeleteSubscriber = async (id: string) => {
    const { error } = await supabase.from("subscribers").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Subscriber removed" });
      fetchData();
    }
  };

  const handleDeleteNewsletter = async (id: string) => {
    const { error } = await supabase.from("newsletters").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Newsletter removed" });
      fetchData();
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Newsletter & Subscribers</h1>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{subscribers.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{subscribers.filter((s) => s.is_active).length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Newsletters Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-accent" />
              <span className="text-2xl font-bold">{newsletters.filter((n) => n.status === "sent").length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose">Compose Newsletter</TabsTrigger>
          <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>Create Newsletter</CardTitle>
              <CardDescription>Compose a new newsletter to send to your subscribers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={newNewsletter.subject}
                  onChange={(e) => setNewNewsletter((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="Newsletter subject line"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={newNewsletter.content}
                  onChange={(e) => setNewNewsletter((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your newsletter content here..."
                  rows={10}
                />
              </div>
              <Button onClick={handleCreateNewsletter}>Save as Draft</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="newsletters">
          <Card>
            <CardHeader>
              <CardTitle>All Newsletters</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent To</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsletters.map((newsletter) => (
                    <TableRow key={newsletter.id}>
                      <TableCell className="font-medium">{newsletter.subject}</TableCell>
                      <TableCell>
                        <Badge variant={newsletter.status === "sent" ? "default" : "secondary"}>
                          {newsletter.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{newsletter.sent_count}</TableCell>
                      <TableCell>
                        {newsletter.sent_at
                          ? format(new Date(newsletter.sent_at), "MMM d, yyyy")
                          : format(new Date(newsletter.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {newsletter.status === "draft" && (
                            <Button
                              size="sm"
                              onClick={() => handleSendNewsletter(newsletter)}
                              disabled={sending}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Send
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteNewsletter(newsletter.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>All Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>
                        <Badge variant={subscriber.is_active ? "default" : "secondary"}>
                          {subscriber.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(subscriber.subscribed_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteSubscriber(subscriber.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
