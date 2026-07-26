import { useState, useEffect, useCallback } from "react";
import { 
  Trash2, Search, Filter, Bug, Lightbulb, Languages, 
  HelpCircle, Mail, Terminal, Smartphone, Calendar, Loader2, AlertTriangle, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

type Feedback = {
  id: string;
  category: "bug" | "suggestion" | "translation" | "other";
  message: string;
  contactEmail: string;
  appVersion: string;
  devicePlatform: string;
  appName: string;
  systemLogs?: string;
  createdAt: string;
};

export function HisnulMuslimFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [appNameFilter, setAppNameFilter] = useState<string>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const { toast } = useToast();
  const apiGatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const loadFeedbacks = useCallback(async () => {
    setIsLoading(true);
    try {
      const { fetchWithAuth } = await import("@/lib/api");
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/hisnul_muslim/feedback`);
      
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      } else {
        throw new Error("Failed to retrieve feedbacks from server");
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error Loading Feedback",
        description: error?.message || String(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiGatewayUrl, toast]);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  const handleDeleteFeedback = async (id: string) => {
    setIsDeletingId(id);
    try {
      const { fetchWithAuth } = await import("@/lib/api");
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/hisnul_muslim/feedback/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFeedbacks(prev => prev.filter(f => f.id !== id));
        toast({
          title: "Feedback Deleted",
          description: "The feedback report has been deleted successfully.",
        });
      } else {
        throw new Error("Failed to delete feedback");
      }
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error?.message || String(error),
        variant: "destructive",
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "bug":
        return <Bug className="h-4 w-4 text-red-500" />;
      case "suggestion":
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case "translation":
        return <Languages className="h-4 w-4 text-blue-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-purple-500" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "bug":
        return <Badge variant="destructive" className="capitalize">Bug</Badge>;
      case "suggestion":
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 capitalize">Suggestion</Badge>;
      case "translation":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20 capitalize">Translation</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{category}</Badge>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    return <Smartphone className="h-3.5 w-3.5 text-muted-foreground mr-1" />;
  };

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch = 
      f.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.systemLogs && f.systemLogs.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === "all" || f.category === categoryFilter;
    const matchesPlatform = platformFilter === "all" || f.devicePlatform === platformFilter;
    const matchesAppName = appNameFilter === "all" || f.appName === appNameFilter;

    return matchesSearch && matchesCategory && matchesPlatform && matchesAppName;
  });

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          User Feedback & Crash Reports
        </CardTitle>
        <CardDescription>
          View ratings, feature requests, translation corrections, and automatic crash logs submitted from the Hisnul Muslim app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, message contents, or stack trace logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30 border-border/50 focus:border-primary"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-muted/30 border border-border/50 rounded-xl px-3 py-1.5">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent border-none text-sm focus:outline-none text-foreground font-medium cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="bug">Bugs</option>
                <option value="suggestion">Suggestions</option>
                <option value="translation">Translation Gaps</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-muted/30 border border-border/50 rounded-xl px-3 py-1.5">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="bg-transparent border-none text-sm focus:outline-none text-foreground font-medium cursor-pointer"
              >
                <option value="all">All Platforms</option>
                <option value="android">Android</option>
                <option value="ios">iOS</option>
                <option value="web">Web</option>
                <option value="unknown">Other/Unknown</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-muted/30 border border-border/50 rounded-xl px-3 py-1.5">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <select
                value={appNameFilter}
                onChange={(e) => setAppNameFilter(e.target.value)}
                className="bg-transparent border-none text-sm focus:outline-none text-foreground font-medium cursor-pointer"
              >
                <option value="all">All Apps</option>
                <option value="hisnul_muslim">Hisnul Muslim</option>
                <option value="qurapp">QurApp</option>
              </select>
            </div>

            <Button variant="outline" size="icon" onClick={loadFeedbacks} disabled={isLoading}>
              <Terminal className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground text-sm">Fetching user feedbacks...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl bg-muted/10">
            <ShieldCheck className="h-12 w-12 text-muted-foreground/60 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground text-lg mb-1">No Feedbacks Found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {searchQuery || categoryFilter !== "all" || platformFilter !== "all" 
                ? "No items match your active filters. Try resetting search parameters."
                : "Great news! No bug reports or feedback submissions have been posted yet."}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[200px]">Sender Email</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead className="w-[150px]">App / Environment</TableHead>
                  <TableHead className="w-[140px]">Date Submitted</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbacks.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/20">
                    <TableCell className="align-middle">
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(item.category)}
                        {getCategoryBadge(item.category)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium align-middle">
                      <a href={`mailto:${item.contactEmail}`} className="hover:text-primary transition flex items-center gap-1">
                        <Mail className="h-3 w-3 opacity-60" />
                        <span className="truncate max-w-[160px]">{item.contactEmail}</span>
                      </a>
                    </TableCell>
                    <TableCell className="max-w-[300px] align-middle">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button 
                            onClick={() => setSelectedFeedback(item)}
                            className="text-left hover:text-primary transition font-normal focus:outline-none w-full"
                          >
                            <p className="line-clamp-2 text-sm text-foreground/80">{item.message}</p>
                            {item.systemLogs && (
                              <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 rounded font-mono mt-1 inline-block">
                                Contains Stack Trace
                              </span>
                            )}
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-card border border-border/50">
                          {selectedFeedback && (
                            <>
                              <DialogHeader>
                                <div className="flex items-center gap-2 mb-2">
                                  {getCategoryIcon(selectedFeedback.category)}
                                  {getCategoryBadge(selectedFeedback.category)}
                                  <span className="text-xs text-muted-foreground font-mono">ID: {selectedFeedback.id}</span>
                                </div>
                                <DialogTitle className="text-lg">Feedback Details</DialogTitle>
                                <DialogDescription className="flex items-center gap-4 text-xs font-mono text-muted-foreground mt-1">
                                  <span className="flex items-center">
                                    <Smartphone className="h-3.5 w-3.5 mr-1" />
                                    Platform: {selectedFeedback.devicePlatform}
                                  </span>
                                  <span>Version: v{selectedFeedback.appVersion}</span>
                                  <span className="capitalize">App: {selectedFeedback.appName ? selectedFeedback.appName.replace('_', ' ') : 'Hisnul Muslim'}</span>
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4 my-2 text-foreground">
                                <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contact Email</h4>
                                  <a href={`mailto:${selectedFeedback.contactEmail}`} className="text-primary hover:underline font-medium text-sm flex items-center gap-1.5">
                                    <Mail className="h-4 w-4" />
                                    {selectedFeedback.contactEmail}
                                  </a>
                                </div>

                                <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
                                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Message</h4>
                                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedFeedback.message}</p>
                                </div>

                                {selectedFeedback.systemLogs && (
                                  <div className="bg-red-500/[0.03] border border-red-500/20 rounded-xl p-4">
                                    <div className="flex items-center gap-1.5 text-red-500 font-semibold text-xs uppercase tracking-wider mb-2">
                                      <Terminal className="h-4 w-4" />
                                      System Log / Stack Trace
                                    </div>
                                    <pre className="text-[11px] font-mono p-3 bg-black/60 text-red-200 border border-red-500/10 rounded-lg max-h-60 overflow-y-auto whitespace-pre">
                                      {selectedFeedback.systemLogs}
                                    </pre>
                                  </div>
                                )}
                              </div>

                              <DialogFooter className="flex justify-between md:justify-between items-center border-t border-border/50 pt-4">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  Received: {new Date(selectedFeedback.createdAt).toLocaleString()}
                                </div>
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => {
                                    handleDeleteFeedback(selectedFeedback.id);
                                  }}
                                  disabled={isDeletingId === selectedFeedback.id}
                                >
                                  {isDeletingId === selectedFeedback.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Trash2 className="h-4 w-4 mr-1.5" />
                                      Delete Report
                                    </>
                                  )}
                                </Button>
                              </DialogFooter>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="text-xs flex flex-col gap-0.5 font-mono text-muted-foreground">
                        <span className="font-semibold text-foreground capitalize">
                          {item.appName ? item.appName.replace('_', ' ') : 'Hisnul Muslim'}
                        </span>
                        <span className="flex items-center">
                          {getPlatformIcon(item.devicePlatform)}
                          {item.devicePlatform} (v{item.appVersion})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle text-muted-foreground text-xs font-mono">
                      {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="align-middle text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-8 w-8"
                        onClick={() => handleDeleteFeedback(item.id)}
                        disabled={isDeletingId === item.id}
                      >
                        {isDeletingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
