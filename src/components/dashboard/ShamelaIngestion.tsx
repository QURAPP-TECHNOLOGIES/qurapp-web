import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Square,
  Terminal,
  Database,
  Loader2,
  RefreshCw,
  Cookie,
  Layers,
  FileText,
  User,
  Hash,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Key,
  Library
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth, apiGatewayUrl } from "@/lib/api";

type JobStatus = {
  status: 'idle' | 'running' | 'stopping' | 'stopped' | 'failed' | 'completed';
  startId: number | null;
  endId: number | null;
  currentBookId: number | null;
  processedCount: number;
  totalCount: number;
  logs: string[];
  startTime: string | null;
  endTime: string | null;
  error: string | null;
};

type DBStats = {
  totalBooks: number;
  totalAuthors: number;
  totalCategories: number;
  totalSections: number;
  totalChapters: number;
};

export function ShamelaIngestion() {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [dbStats, setDbStats] = useState<DBStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Inputs
  const [startId, setStartId] = useState("");
  const [endId, setEndId] = useState("");
  const [cfCookie, setCfCookie] = useState("");
  const [cfUserAgent, setCfUserAgent] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startingJob, setStartingJob] = useState(false);
  const [stoppingJob, setStoppingJob] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [concurrency, setConcurrency] = useState("3");

  // Derived pgvector Indexing & Embeddings State
  const [indexingStatus, setIndexingStatus] = useState<{
    totalChunks: number;
    totalBooks: number;
    indexedBooks: number;
    indexingProgressPercent: string;
  } | null>(null);
  const [indexingMode, setIndexingMode] = useState<'all' | 'range'>('all');
  const [indexingStartId, setIndexingStartId] = useState("");
  const [indexingEndId, setIndexingEndId] = useState("");
  const [startingIndexing, setStartingIndexing] = useState(false);
  const [incrementalOnly, setIncrementalOnly] = useState(true);
  const [openaiApiKey, setOpenaiApiKey] = useState("");

  const { toast } = useToast();
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDbStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/knowledge/shamela/db-stats`);
      if (res.ok) {
        const data = await res.json();
        setDbStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch DB stats", e);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchIndexingStatus = async () => {
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/knowledge/shamela/indexing/status`);
      if (res.ok) {
        const data = await res.json();
        setIndexingStatus(data);
      }
    } catch (e) {
      console.error("Failed to fetch Shamela indexing status", e);
    }
  };

  const handleStartIndexing = async () => {
    setStartingIndexing(true);
    try {
      const payload: any = {
        incrementalOnly,
        apiKey: openaiApiKey ? openaiApiKey.trim() : undefined,
      };

      if (indexingMode === 'all') {
        payload.bookId = 'all';
      } else {
        if (indexingStartId) payload.startId = indexingStartId.trim();
        if (indexingEndId) payload.endId = indexingEndId.trim();
      }

      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/knowledge/shamela/indexing/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({
          title: "Shamela Indexing Job Started",
          description: `Generating pgvector retrieval chunks for ${indexingMode === 'all' ? 'all books' : `Books ${indexingStartId || '1'} to ${indexingEndId || 'Max'}`}...`,
        });
        fetchIndexingStatus();
      } else {
        const data = await res.json();
        throw new Error(data?.message || "Failed to start Shamela indexing.");
      }
    } catch (e: any) {
      toast({
        title: "Indexing Failed",
        description: e.message || String(e),
        variant: "destructive",
      });
    } finally {
      setStartingIndexing(false);
    }
  };

  const fetchJobStatus = async () => {
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/knowledge/shamela/status`);
      if (res.ok) {
        const data: JobStatus = await res.json();
        setStatus(data);

        // Auto-scroll terminal logs if running
        if (terminalEndRef.current) {
          terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }
    } catch (e) {
      console.error("Failed to fetch job status", e);
    }
  };

  // Start polling
  useEffect(() => {
    fetchDbStats();
    fetchJobStatus();
    fetchIndexingStatus();

    pollTimerRef.current = setInterval(() => {
      fetchJobStatus();
      fetchIndexingStatus();
    }, 2000);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  // Update DB stats when a job finishes
  useEffect(() => {
    if (status && (status.status === 'completed' || status.status === 'failed' || status.status === 'stopped')) {
      fetchDbStats();
      fetchIndexingStatus();
    }
  }, [status?.status]);

  // Real-time ticking timer for elapsed duration
  useEffect(() => {
    let ticker: NodeJS.Timeout | null = null;
    if (status?.status === 'running') {
      setNow(Date.now());
      ticker = setInterval(() => {
        setNow(Date.now());
      }, 1000);
    }
    return () => {
      if (ticker) clearInterval(ticker);
    };
  }, [status?.status]);

  const getElapsedDuration = () => {
    if (!status || !status.startTime) return "—";
    const start = new Date(status.startTime).getTime();
    const end = status.endTime ? new Date(status.endTime).getTime() : now;
    const diffMs = Math.max(0, end - start);

    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const handleStartPipeline = async () => {
    if (!startId.trim() || !endId.trim()) {
      toast({
        title: "Validation Error",
        description: "Please specify start and end Book IDs.",
        variant: "destructive"
      });
      return;
    }

    setStartingJob(true);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/knowledge/shamela/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: parseInt(startId, 10),
          end: parseInt(endId, 10),
          cfCookie: cfCookie.trim() || undefined,
          cfUserAgent: cfUserAgent.trim() || undefined,
          concurrency: parseInt(concurrency, 10) || 1
        })
      });

      if (res.ok) {
        toast({
          title: "Pipeline Started",
          description: "Scraper & ingestion pipeline spawned successfully."
        });
        fetchJobStatus();
      } else {
        const data = await res.json();
        throw new Error(data?.message || "Failed to start pipeline.");
      }
    } catch (e: any) {
      toast({
        title: "Execution Failed",
        description: e.message || String(e),
        variant: "destructive"
      });
    } finally {
      setStartingJob(false);
    }
  };

  const handleStopPipeline = async () => {
    if (!confirm("Are you sure you want to stop the active ingestion pipeline? This will abort the current book crawl.")) return;
    setStoppingJob(true);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/knowledge/shamela/stop`, {
        method: "POST"
      });

      if (res.ok) {
        toast({
          title: "Stopping Pipeline",
          description: "Stop command sent successfully."
        });
        fetchJobStatus();
      } else {
        const data = await res.json();
        throw new Error(data?.message || "Failed to stop pipeline.");
      }
    } catch (e: any) {
      toast({
        title: "Stop Failed",
        description: e.message || String(e),
        variant: "destructive"
      });
    } finally {
      setStoppingJob(false);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "running": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "completed": return "bg-green-500/10 text-green-500 border-green-500/30";
      case "failed": return "bg-red-500/10 text-red-500 border-red-500/30";
      case "stopped": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case "stopping": return "bg-amber-500/15 text-amber-600 border-amber-600/30 animate-pulse";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getProgressPercentage = () => {
    if (!status || status.totalCount <= 0) return 0;
    return Math.min(Math.round((status.processedCount / status.totalCount) * 100), 100);
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Shamela Ingestion Manager
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Scrape Shamela books, chunk content into sections, and upload pages directly to Cloudflare R2 bucket.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={loadingStats}
          onClick={() => {
            fetchDbStats();
            fetchJobStatus();
          }}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loadingStats ? "animate-spin" : ""}`} />
          Refresh Stats
        </Button>
      </div>

      {/* Database Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card/50 border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Total Books</span>
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-display">
              {dbStats ? dbStats.totalBooks.toLocaleString() : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Authors</span>
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-display">
              {dbStats ? dbStats.totalAuthors.toLocaleString() : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Categories</span>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-display">
              {dbStats ? dbStats.totalCategories : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Chapters</span>
              <Hash className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-display">
              {dbStats ? dbStats.totalChapters.toLocaleString() : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Indexed Sections</span>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-display">
              {dbStats ? dbStats.totalSections.toLocaleString() : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Controls */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Start Ingestion Range</CardTitle>
              <CardDescription>Specify the start and end Book IDs to fetch.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Start ID</label>
                  <Input
                    type="number"
                    value={startId}
                    onChange={(e) => setStartId(e.target.value)}
                    placeholder="e.g. 50"
                    disabled={status?.status === "running"}
                    className="bg-muted/30 focus:border-primary text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">End ID</label>
                  <Input
                    type="number"
                    value={endId}
                    onChange={(e) => setEndId(e.target.value)}
                    placeholder="e.g. 100"
                    disabled={status?.status === "running"}
                    className="bg-muted/30 focus:border-primary text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Concurrency</label>
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={concurrency}
                    onChange={(e) => setConcurrency(e.target.value)}
                    placeholder="e.g. 3"
                    disabled={status?.status === "running"}
                    className="bg-muted/30 focus:border-primary text-xs"
                  />
                </div>
              </div>

              {/* Collapsible Advanced Section */}
              <div className="border-t border-border/60 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Cookie className="h-3.5 w-3.5" />
                  {showAdvanced ? "Hide" : "Show"} Cloudflare Bypass Settings
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 mt-3 overflow-hidden"
                    >
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Clearance Cookie (CF_COOKIE)
                        </label>
                        <Input
                          value={cfCookie}
                          onChange={(e) => setCfCookie(e.target.value)}
                          placeholder="cf_clearance=xxxx; __cf_bm=xxxx"
                          disabled={status?.status === "running"}
                          className="bg-muted/30 font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Clearance User Agent
                        </label>
                        <Input
                          value={cfUserAgent}
                          onChange={(e) => setCfUserAgent(e.target.value)}
                          placeholder="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)..."
                          disabled={status?.status === "running"}
                          className="bg-muted/30 font-mono text-xs"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        To scrape from protected sites, copy your active browser cookie Clearance parameters and matching User-Agent.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="pt-2">
                {status?.status === "running" ? (
                  <Button
                    variant="destructive"
                    onClick={handleStopPipeline}
                    disabled={stoppingJob}
                    className="w-full gap-2 font-semibold shadow"
                  >
                    {stoppingJob ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    Abort Active Pipeline
                  </Button>
                ) : (
                  <Button
                    onClick={handleStartPipeline}
                    disabled={startingJob || !startId || !endId}
                    className="w-full gap-2 font-semibold shadow-md bg-gradient-to-r from-primary to-primary-hover hover:scale-[1.01] active:scale-[0.99] transition-transform"
                  >
                    {startingJob ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" />
                    )}
                    Spawn Ingestion Pipeline
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Derived pgvector Indexing & Embeddings Card */}
          <Card className="border-border/60 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Derived pgvector Indexing & Embeddings (QurAI RAG)
              </CardTitle>
              <CardDescription>
                Derive semantic embeddings and multi-source retrieval chunks from ingested Shamela classical books.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Library className="h-3.5 w-3.5 text-primary" />
                  Target Books Scope
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={indexingMode === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIndexingMode('all')}
                    disabled={startingIndexing}
                    className="text-xs h-8"
                  >
                    🌟 All Books ({indexingStatus?.totalBooks ? `${indexingStatus.totalBooks.toLocaleString()}` : '3,642'})
                  </Button>
                  <Button
                    type="button"
                    variant={indexingMode === 'range' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIndexingMode('range')}
                    disabled={startingIndexing}
                    className="text-xs h-8"
                  >
                    🔢 Custom ID Range
                  </Button>
                </div>

                {indexingMode === 'range' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground font-medium">Start Book ID</label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g. 1"
                        value={indexingStartId}
                        onChange={(e) => setIndexingStartId(e.target.value)}
                        disabled={startingIndexing}
                        className="bg-muted/30 text-xs h-8 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground font-medium">End Book ID</label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g. 50"
                        value={indexingEndId}
                        onChange={(e) => setIndexingEndId(e.target.value)}
                        disabled={startingIndexing}
                        className="bg-muted/30 text-xs h-8 font-mono"
                      />
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground">
                  {indexingMode === 'all'
                    ? "Generate retrieval chunks and vector embeddings across all verified ingested Shamela books."
                    : `Will index books from #${indexingStartId || '1'} to #${indexingEndId || 'Max'}. Automatically maps to canonical IDs.`}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="shamelaIncrementalCheckbox"
                  checked={incrementalOnly}
                  onChange={(e) => setIncrementalOnly(e.target.checked)}
                  disabled={startingIndexing}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="shamelaIncrementalCheckbox" className="text-xs text-muted-foreground cursor-pointer">
                  Incremental Only (skip already indexed books to save API tokens)
                </label>
              </div>

              {indexingStatus && (
                <div className="bg-muted/20 p-3 rounded-lg border text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Indexed Books:</span>
                    <span className="font-semibold">{indexingStatus.indexedBooks.toLocaleString()} / {indexingStatus.totalBooks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Generated Retrieval Chunks:</span>
                    <span className="font-semibold text-primary">{indexingStatus.totalChunks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Index Coverage:</span>
                    <span className="font-semibold text-emerald-500">{indexingStatus.indexingProgressPercent}%</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-primary" />
                    OpenAI API Key (Dynamic Override)
                  </span>
                  <span className="text-[10px] text-muted-foreground">Optional</span>
                </label>
                <Input
                  type="password"
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  placeholder="sk-proj-... (Uses server .env if left blank)"
                  disabled={startingIndexing}
                  className="bg-muted/30 text-xs font-mono"
                />
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Passes your API key securely to generate dense vector embeddings (<code className="text-primary font-mono">text-embedding-3-small</code>) dynamically without modifying server configuration files.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleStartIndexing}
                  disabled={startingIndexing}
                  variant="secondary"
                  className="w-full gap-2 font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-transform"
                >
                  {startingIndexing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Layers className="h-4 w-4 text-primary" />
                  )}
                  Trigger Retrieval Indexing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Active Status & Logs */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border/60 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Pipeline Monitor</CardTitle>
                <CardDescription>Status and progress tracking of the job.</CardDescription>
              </div>
              {status && (
                <Badge variant="outline" className={getStatusColor(status.status)}>
                  {status.status.toUpperCase()}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {status && status.status !== "idle" ? (
                <div className="space-y-4 bg-muted/20 p-4 rounded-xl border">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">Active Range</span>
                      <span className="font-semibold">{status.startId} ➔ {status.endId}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Current Book ID</span>
                      <span className="font-semibold text-primary">
                        {status.currentBookId ? `Book ${status.currentBookId}` : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Elapsed Progression</span>
                      <span className="font-semibold">{status.processedCount} / {status.totalCount || "..."} Books</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Time Elapsed</span>
                      <span className="font-mono text-xs">
                        {getElapsedDuration()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {status.totalCount > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                        <span>Job Progress</span>
                        <span>{getProgressPercentage()}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${getProgressPercentage()}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {status.error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-xs text-red-500 flex gap-2 items-start mt-2">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{status.error}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/10 rounded-xl border border-dashed text-muted-foreground flex flex-col items-center">
                  <CheckCircle2 className="h-10 w-10 opacity-30 mb-2" />
                  <p className="text-sm font-semibold">No Active Pipeline Job</p>
                  <p className="text-xs text-muted-foreground mt-1">Specify a range and trigger the button to run.</p>
                </div>
              )}

              {/* Terminal Logs */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Terminal className="h-3.5 w-3.5" />
                  Execution Logs
                </span>
                <div className="h-64 bg-zinc-950 text-zinc-300 font-mono text-[10px] p-4 rounded-xl overflow-y-auto space-y-1 border border-zinc-800 shadow-inner">
                  {status && status.logs.length > 0 ? (
                    status.logs.map((log, index) => {
                      let color = "text-zinc-300";
                      if (log.includes("[STDERR]") || log.includes("ERROR")) color = "text-red-400";
                      else if (log.includes("Successfully")) color = "text-green-400";
                      else if (log.includes("already fully ingested")) color = "text-yellow-400";
                      return (
                        <div key={index} className={`${color} leading-relaxed whitespace-pre-wrap`}>
                          {log}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-zinc-500 italic">Terminal waiting for stdout dispatches...</div>
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
