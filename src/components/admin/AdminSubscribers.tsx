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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Send, Users, Mail, Trash2, RefreshCw, Eye } from "lucide-react";
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
  const [previewNewsletter, setPreviewNewsletter] = useState<Newsletter | null>(null);
  const { toast } = useToast();

  const generateEmailHtml = (subject: string, content: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a1a2e; margin: 0; padding: 0; background-color: #f5f7fa;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Croevo AI</h1>
        </div>
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1a1a2e; margin-top: 0; font-size: 22px;">${subject}</h2>
          <div style="color: #4a5568; font-size: 16px; white-space: pre-wrap;">${content}</div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #718096; font-size: 14px; margin-bottom: 0;">
            You received this email because you subscribed to Croevo AI updates.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

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
              <div className="flex gap-2">
                <Button onClick={handleCreateNewsletter}>Save as Draft</Button>
                {newNewsletter.subject && newNewsletter.content && (
                  <Button
                    variant="outline"
                    onClick={() => setPreviewNewsletter({ 
                      id: "preview", 
                      subject: newNewsletter.subject, 
                      content: newNewsletter.content,
                      status: "draft",
                      sent_at: null,
                      sent_count: 0,
                      created_at: new Date().toISOString()
                    })}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                )}
              </div>
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewNewsletter(newsletter)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

      {/* Preview Dialog */}
      <Dialog open={!!previewNewsletter} onOpenChange={() => setPreviewNewsletter(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-muted rounded-lg p-4">
            {previewNewsletter && (
              <iframe
                srcDoc={generateEmailHtml(previewNewsletter.subject, previewNewsletter.content)}
                className="w-full h-[500px] bg-white rounded-lg border-0"
                title="Newsletter Preview"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewNewsletter(null)}>
              Close
            </Button>
            {previewNewsletter?.status === "draft" && previewNewsletter.id !== "preview" && (
              <Button
                onClick={() => {
                  handleSendNewsletter(previewNewsletter);
                  setPreviewNewsletter(null);
                }}
                disabled={sending}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Newsletter
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
