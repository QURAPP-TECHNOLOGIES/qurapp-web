import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Terminal,
  Database,
  Loader2,
  RefreshCw,
  Layers,
  FileText,
  Hash,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Award,
  Globe2,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth, apiGatewayUrl } from "@/lib/api";

type HadithJobStatus = {
  status: 'idle' | 'running' | 'completed' | 'failed';
  ingestionId: string | null;
  sourceId: string | null;
  datasetVersion: string | null;
  dryRun: boolean;
  totalRecords: number;
  processedRecords: number;
  acceptedRecords: number;
  rejectedRecords: number;
  duplicateRecords: number;
  variantRecords: number;
  logs: string[];
  startTime: string | null;
  endTime: string | null;
  error: string | null;
};

type HadithDBStats = {
  totalCollections: number;
  totalBooks: number;
  totalChapters: number;
  totalHadiths: number;
  totalTranslations: number;
  totalGradings: number;
  totalReferences: number;
  totalVariants: number;
  manifestCount: number;
  collections: Array<{
    id: string;
    canonicalName: string;
    arabicName: string;
    compiler: string;
    totalHadithCount: number;
  }>;
};

export function HadithIngestion() {
  const [status, setStatus] = useState<HadithJobStatus | null>(null);
  const [dbStats, setDbStats] = useState<HadithDBStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [startingJob, setStartingJob] = useState(false);
  const [selectedSource, setSelectedSource] = useState("open-hadith-data");
  const [datasetVersion, setDatasetVersion] = useState("v2.1");
  const [isDryRun, setIsDryRun] = useState(false);

  const { toast } = useToast();
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDbStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/knowledge/hadith/db-stats`);
      if (res.ok) {
        const data = await res.json();
        setDbStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch Hadith DB stats", e);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchJobStatus = async () => {
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/knowledge/hadith/status`);
      if (res.ok) {
        const data: HadithJobStatus = await res.json();
        setStatus(data);

        if (terminalEndRef.current) {
          terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }
    } catch (e) {
      console.error("Failed to fetch Hadith job status", e);
    }
  };

  useEffect(() => {
    fetchDbStats();
    fetchJobStatus();

    pollTimerRef.current = setInterval(() => {
      fetchJobStatus();
    }, 2000);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (status && (status.status === 'completed' || status.status === 'failed')) {
      fetchDbStats();
    }
  }, [status?.status]);

  const handleStartIngestion = async () => {
    setStartingJob(true);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/knowledge/hadith/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: selectedSource,
          datasetVersion,
          dryRun: isDryRun,
        }),
      });

      if (res.ok) {
        toast({
          title: isDryRun ? "Validation Run Started" : "Hadith Ingestion Started",
          description: "Corpus parsing and canonicalization spawned successfully.",
        });
        fetchJobStatus();
      } else {
        const data = await res.json();
        throw new Error(data?.message || "Failed to start Hadith ingestion.");
      }
    } catch (e: any) {
      toast({
        title: "Ingestion Failed",
        description: e.message || String(e),
        variant: "destructive",
      });
    } finally {
      setStartingJob(false);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "running": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "completed": return "bg-green-500/10 text-green-500 border-green-500/30";
      case "failed": return "bg-red-500/10 text-red-500 border-red-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getProgressPercentage = () => {
    if (!status || status.totalRecords <= 0) return 0;
    return Math.min(Math.round((status.processedRecords / status.totalRecords) * 100), 100);
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Hadith Corpus & Ingestion Manager
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Canonicalize, validate, and publish verified Hadith collections to PostgreSQL and Cloudflare R2 storage.
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-card/50 border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Collections</span>
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-display">
              {dbStats ? dbStats.totalCollections : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Canonical Hadiths</span>
              <Hash className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-display">
              {dbStats ? dbStats.totalHadiths.toLocaleString() : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Translations</span>
              <Globe2 className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-display">
              {dbStats ? dbStats.totalTranslations.toLocaleString() : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Gradings</span>
              <Award className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-display">
              {dbStats ? dbStats.totalGradings.toLocaleString() : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Variants</span>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-display">
              {dbStats ? dbStats.totalVariants.toLocaleString() : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Manifests</span>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold font-display">
              {dbStats ? dbStats.manifestCount : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Source Selection & Ingestion Gate
              </CardTitle>
              <CardDescription>Select an approved Hadith dataset to parse and canonicalize.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Source Dataset</label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  disabled={status?.status === "running"}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="open-hadith-data">Open-Hadith-Data (Canonical Arabic - Approved)</option>
                  <option value="fawazahmed0-hadith">Fawaz Ahmed Multi-lingual API (Secondary - Approved)</option>
                  <option value="lk-hadith-corpus" disabled>LK Hadith Corpus (Research Only - Restricted)</option>
                  <option value="sunnah-com-reference" disabled>Sunnah.com Reference (Reference Only)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Dataset Version</label>
                <Input
                  value={datasetVersion}
                  onChange={(e) => setDatasetVersion(e.target.value)}
                  placeholder="e.g. v2.1"
                  disabled={status?.status === "running"}
                  className="bg-muted/30 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="dryRunCheckbox"
                  checked={isDryRun}
                  onChange={(e) => setIsDryRun(e.target.checked)}
                  disabled={status?.status === "running"}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="dryRunCheckbox" className="text-xs text-muted-foreground cursor-pointer">
                  Dry-run validation mode (validate without writing to PostgreSQL/R2)
                </label>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleStartIngestion}
                  disabled={startingJob || status?.status === "running"}
                  className="w-full gap-2 font-semibold shadow-md bg-gradient-to-r from-primary to-primary-hover hover:scale-[1.01] active:scale-[0.99] transition-transform"
                >
                  {startingJob ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 fill-current" />
                  )}
                  {isDryRun ? "Execute Validation Dry-Run" : "Publish to Canonical Corpus"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Status & Logs */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border/60 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Hadith Pipeline Monitor</CardTitle>
                <CardDescription>Execution progress, duplicate analysis, and logs.</CardDescription>
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
                      <span className="text-xs text-muted-foreground block">Active Ingestion</span>
                      <span className="font-semibold">{status.sourceId} ({status.datasetVersion})</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Progress</span>
                      <span className="font-semibold">{status.processedRecords} / {status.totalRecords} Records</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Canonical Accepted</span>
                      <span className="font-semibold text-green-500">{status.acceptedRecords}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Duplicates / Variants</span>
                      <span className="font-semibold text-amber-500">{status.duplicateRecords} dup / {status.variantRecords} var</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {status.totalRecords > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                        <span>Ingestion Progress</span>
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
                  <p className="text-sm font-semibold">No Active Hadith Ingestion</p>
                  <p className="text-xs text-muted-foreground mt-1">Select a source dataset and trigger ingestion.</p>
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
                      if (log.includes("ERROR")) color = "text-red-400";
                      else if (log.includes("completed") || log.includes("accepted")) color = "text-green-400";
                      return (
                        <div key={index} className={`${color} leading-relaxed whitespace-pre-wrap`}>
                          {log}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-zinc-500 italic">Waiting for pipeline stdout...</div>
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
