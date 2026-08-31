import { useState, useEffect, useRef } from "react";
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
  ShieldCheck,
  Library,
  GitBranch,
  Info,
  Key
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
  collectionId: string | null;
  datasetVersion: string | null;
  repositoryCommit: string | null;
  configurationVersion: string | null;
  upstreamSourceId: string | null;
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

const COLLECTIONS_LIST = [
  { id: "nawawi", name: "Forty Hadith of an-Nawawi (42 hadiths)", upstream: "fawazahmed0-hadith" },
  { id: "qudsi", name: "Forty Hadith Qudsi (40 hadiths)", upstream: "fawazahmed0-hadith" },
  { id: "dehlawi", name: "Forty Hadith of Shah Waliullah Dehlawi (40 hadiths)", upstream: "fawazahmed0-hadith" },
  { id: "bukhari", name: "Sahih al-Bukhari (7,563 hadiths)", upstream: "fawazahmed0-hadith" },
  { id: "muslim", name: "Sahih Muslim (7,500 hadiths)", upstream: "fawazahmed0-hadith" },
  { id: "tirmidhi", name: "Jami' al-Tirmidhi (3,956 hadiths)", upstream: "fawazahmed0-hadith" },
  { id: "abudawud", name: "Sunan Abi Dawud (5,274 hadiths)", upstream: "fawazahmed0-hadith" },
  { id: "nasai", name: "Sunan an-Nasa'i (5,758 hadiths)", upstream: "fawazahmed0-hadith" },
  { id: "ibnmajah", name: "Sunan Ibn Majah (4,341 hadiths)", upstream: "fawazahmed0-hadith" },
  { id: "malik", name: "Muwatta Malik (1,858 hadiths)", upstream: "fawazahmed0-hadith" },
  { id: "ahmad", name: "Musnad Ahmad (26,363 hadiths)", upstream: "open-hadith-data" },
  { id: "darimi", name: "Sunan al-Darimi (3,367 hadiths)", upstream: "open-hadith-data" },
  { id: "hadeethenc", name: "HadeethEnc Curated Selection (72-lang with Sharh & Benefits)", upstream: "hadeethenc.com" },
  { id: "all", name: "All Canonical Collections (Sequential Batch)", upstream: "multi-source" },
];

const SOURCE_REGISTRY_METRICS = [
  {
    id: "quranlab-hadith",
    name: "QuranLab Hadith & Sunnah",
    role: "PRIMARY_ACQUISITION",
    lineage: "Packaging Layer (HF Parquet)",
    version: "2026.08-rev1 (Commit c3a81f8)",
    license: "Mixed / ODbL-1.0 (Arabic) / Educational Reference",
    commercial: "Arabic: OK / Trans: Ref Only",
    badge: "Primary Source",
  },
  {
    id: "fawazahmed0-hadith",
    name: "Fawaz Ahmed Multi-lingual API",
    role: "UPSTREAM_PROVENANCE",
    lineage: "Upstream for 6 Books + 40 Hadiths",
    version: "v1.0 (Commit @1)",
    license: "MIT / Public Domain / Darussalam",
    commercial: "Arabic: OK / Trans: Notice-TD",
    badge: "Upstream Baseline",
  },
  {
    id: "open-hadith-data",
    name: "Open-Hadith-Data Corpus",
    role: "UPSTREAM_PROVENANCE",
    lineage: "Upstream for Ahmad & Darimi",
    version: "v2.1",
    license: "ODbL-1.0 + DbCL-1.0",
    commercial: "Open Database (Attribution)",
    badge: "Arabic Provenance",
  },
  {
    id: "hadeethenc",
    name: "Encyclopedia of Translated Hadiths",
    role: "SEPARATE_SOURCE_LAYER",
    lineage: "IslamHouse / Saudi MoIA (72 Langs)",
    version: "v2026.1",
    license: "Verbatim Educational Redistribution",
    commercial: "Non-Commercial Verbatim",
    badge: "Explanations & Grades",
  },
  {
    id: "sunnah-com-reference",
    name: "Sunnah.com Reference Standard",
    role: "REFERENCE",
    lineage: "External Abdul-Baqi Numbering Standard",
    version: "v2026",
    license: "Proprietary Reference Only",
    commercial: "Reference Only",
    badge: "Reference Standard",
  },
];

export function HadithIngestion() {
  const [status, setStatus] = useState<HadithJobStatus | null>(null);
  const [dbStats, setDbStats] = useState<HadithDBStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [startingJob, setStartingJob] = useState(false);
  const [selectedSource, setSelectedSource] = useState("quranlab-hadith");
  const [selectedCollection, setSelectedCollection] = useState("nawawi");
  const [datasetVersion, setDatasetVersion] = useState("2026.08-rev1");
  const [isDryRun, setIsDryRun] = useState(false);

  // Phase 9: Vector Indexing & Embeddings State
  const [indexingStatus, setIndexingStatus] = useState<{
    totalChunks: number;
    totalHadiths: number;
    indexedHadiths: number;
    indexingProgressPercent: string;
  } | null>(null);
  const [startingIndexing, setStartingIndexing] = useState(false);
  const [indexingCollection, setIndexingCollection] = useState("all");
  const [incrementalOnly, setIncrementalOnly] = useState(true);
  const [openaiApiKey, setOpenaiApiKey] = useState("");

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

  const fetchIndexingStatus = async () => {
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/knowledge/hadith/indexing/status`);
      if (res.ok) {
        const data = await res.json();
        setIndexingStatus(data);
      }
    } catch (e) {
      console.error("Failed to fetch Hadith indexing status", e);
    }
  };

  const handleStartIndexing = async () => {
    setStartingIndexing(true);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/knowledge/hadith/indexing/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionId: indexingCollection,
          incrementalOnly,
          apiKey: openaiApiKey ? openaiApiKey.trim() : undefined,
        }),
      });

      if (res.ok) {
        toast({
          title: "Indexing Job Started",
          description: `Generating pgvector retrieval chunks for ${indexingCollection === 'all' ? 'all collections' : indexingCollection}...`,
        });
        fetchIndexingStatus();
      } else {
        const data = await res.json();
        throw new Error(data?.message || "Failed to start Hadith indexing.");
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
    fetchIndexingStatus();

    pollTimerRef.current = setInterval(() => {
      fetchJobStatus();
      fetchIndexingStatus();
    }, 2500);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (status && (status.status === 'completed' || status.status === 'failed')) {
      fetchDbStats();
      fetchIndexingStatus();
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
          collectionId: selectedCollection,
          datasetVersion,
          repositoryCommit: "c3a81f8",
          configurationVersion: "2026.08",
          dryRun: isDryRun,
        }),
      });

      if (res.ok) {
        toast({
          title: isDryRun ? "Validation Run Started" : "Real Hadith Ingestion Started",
          description: `Ingestion job for ${selectedCollection} via ${selectedSource} spawned successfully.`,
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
            Primary acquisition via <span className="font-semibold text-primary">quranlab/hadith</span> with immutable version pinning, upstream lineage tracing, and direct Cloudflare R2 / PostgreSQL persistence.
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

      {/* Source Registry & Lineage Table */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            Source Registry, Roles & Lineage Governance
          </CardTitle>
          <CardDescription className="text-xs">
            QurAI distinguishes primary acquisition packaging from upstream historical provenance and separate source layers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground text-left">
                  <th className="pb-2 font-medium">Source / Provider</th>
                  <th className="pb-2 font-medium">QurAI Role</th>
                  <th className="pb-2 font-medium">Lineage / Upstream</th>
                  <th className="pb-2 font-medium">Version / Commit</th>
                  <th className="pb-2 font-medium">Licensing & Commercial Terms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {SOURCE_REGISTRY_METRICS.map((src) => (
                  <tr key={src.id} className="hover:bg-muted/30">
                    <td className="py-2.5 font-medium flex items-center gap-2">
                      <span>{src.name}</span>
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{src.badge}</Badge>
                    </td>
                    <td className="py-2.5">
                      <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">{src.role}</code>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{src.lineage}</td>
                    <td className="py-2.5 font-mono text-[11px]">{src.version}</td>
                    <td className="py-2.5 text-muted-foreground">{src.license} ({src.commercial})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Ingestion Configuration & Execution
              </CardTitle>
              <CardDescription>Select an approved canonical collection to acquire, canonicalize, and persist.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Library className="h-3.5 w-3.5 text-primary" />
                  Canonical Collection
                </label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  disabled={status?.status === "running"}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
                >
                  {COLLECTIONS_LIST.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Source Acquisition Provider</label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  disabled={status?.status === "running"}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="quranlab-hadith">quranlab/hadith (Primary Acquisition & Packaging Layer)</option>
                  <option value="fawazahmed0-hadith">fawazahmed0-hadith (Upstream Baseline Direct Fetcher)</option>
                  <option value="open-hadith-data">open-hadith-data (Arabic Classical Baseline)</option>
                  <option value="hadeethenc">HadeethEnc.com (72-lang Verbatim Selection with Explanations)</option>
                  <option value="lk-hadith-corpus" disabled>LK Hadith Corpus (Research Only - Restricted)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Dataset Version (Pinned)</label>
                <Input
                  value={datasetVersion}
                  onChange={(e) => setDatasetVersion(e.target.value)}
                  placeholder="e.g. 2026.08-rev1"
                  disabled={status?.status === "running"}
                  className="bg-muted/30 text-xs font-mono"
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

          {/* Phase 9: Vector Indexing & Embeddings Card */}
          <Card className="border-border/60 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Derived pgvector Indexing & Embeddings (Phase 9)
              </CardTitle>
              <CardDescription>
                Derive semantic embeddings and multi-source retrieval chunks from canonical Hadiths.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Library className="h-3.5 w-3.5 text-primary" />
                  Target Collection to Index
                </label>
                <select
                  value={indexingCollection}
                  onChange={(e) => setIndexingCollection(e.target.value)}
                  disabled={startingIndexing}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
                >
                  <option value="all">All Canonical Collections (Incremental Sweep)</option>
                  {COLLECTIONS_LIST.filter(c => c.id !== 'all').map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="incrementalCheckbox"
                  checked={incrementalOnly}
                  onChange={(e) => setIncrementalOnly(e.target.checked)}
                  disabled={startingIndexing}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="incrementalCheckbox" className="text-xs text-muted-foreground cursor-pointer">
                  Incremental Only (skip already indexed records to save API tokens)
                </label>
              </div>

              {indexingStatus && (
                <div className="bg-muted/20 p-3 rounded-lg border text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Indexed Hadiths:</span>
                    <span className="font-semibold">{indexingStatus.indexedHadiths.toLocaleString()} / {indexingStatus.totalHadiths.toLocaleString()}</span>
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

        {/* Right Status & Logs */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border/60 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Hadith Pipeline Monitor</CardTitle>
                <CardDescription>Execution progress, duplicate analysis, and streaming logs.</CardDescription>
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
                      <span className="text-xs text-muted-foreground block">Active Target & Source</span>
                      <span className="font-semibold">{status.collectionId || "All"} via {status.sourceId}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Upstream Lineage</span>
                      <span className="font-semibold text-primary">{status.upstreamSourceId || "fawazahmed0-hadith"}</span>
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
                  <p className="text-xs text-muted-foreground mt-1">Select a canonical collection and tap Publish.</p>
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
                      else if (log.includes("completed") || log.includes("accepted") || log.includes("Successfully")) color = "text-green-400";
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
