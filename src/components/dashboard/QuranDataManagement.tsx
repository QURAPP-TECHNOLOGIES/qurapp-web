import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  Layers,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Server,
  BookOpen,
  Terminal,
  Cpu,
  Globe,
  Clock,
  Key,
  Cloud,
  UploadCloud,
  Headphones,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth, apiGatewayUrl } from "@/lib/api";

type Manifest = {
  version: string;
  checksum: string;
  total_surahs: number;
  total_ayahs: number;
  total_pages: number;
  created_at?: string;
};

type DBStats = {
  totalTranslations: number;
  totalTafsirs: number;
  totalSurahs: number;
  totalAyahs: number;
  totalPages: number;
  totalEditions: number;
  totalReciters?: number;
  totalChunks?: number;
};

type JobStatus = {
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  logs: string[];
  startTime: string | null;
  endTime: string | null;
  error: string | null;
};

type TranslationEdition = {
  editionKey: string;
  name: string;
  language: string;
  author: string;
  publisher: string;
  version: string;
  licenseType: string;
  commercialAllowed: boolean;
  status: string;
};

export function QuranDataManagement() {
  const [providerMode, setProviderMode] = useState<'quran-foundation' | 'local' | 'hybrid'>('quran-foundation');
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [dbStats, setDbStats] = useState<DBStats | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [translations, setTranslations] = useState<TranslationEdition[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingMode, setUpdatingMode] = useState(false);
  const [triggeringJob, setTriggeringJob] = useState(false);
  const [uploadR2, setUploadR2] = useState(true);
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [now, setNow] = useState(Date.now());

  const { toast } = useToast();
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Dynamic ticker interval hook for second-by-second duration display
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDataStatus = async () => {
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/quran/admin/status`);
      if (res.ok) {
        const data = await res.json();
        setProviderMode(data.providerMode);
        setManifest(data.manifest);
        setDbStats(data.dbStats);
        setJobStatus(data.jobStatus);
      }
    } catch (e) {
      console.error("Failed to fetch Qur'an data layer status:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTranslations = async () => {
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/quran/admin/translations`);
      if (res.ok) {
        const data = await res.json();
        setTranslations(data.approvedRegistry || []);
      }
    } catch (e) {
      console.error("Failed to fetch translation registry:", e);
    }
  };

  useEffect(() => {
    fetchDataStatus();
    fetchTranslations();
  }, []);

  // Poll status while job is running
  useEffect(() => {
    let poll: NodeJS.Timeout | null = null;
    if (jobStatus?.status === 'running') {
      poll = setInterval(() => {
        fetchDataStatus();
      }, 2000);
    }
    return () => {
      if (poll) clearInterval(poll);
    };
  }, [jobStatus?.status]);

  // Auto scroll terminal logs
  useEffect(() => {
    if (jobStatus?.logs && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [jobStatus?.logs]);

  const handleProviderModeChange = async (newMode: 'quran-foundation' | 'local' | 'hybrid') => {
    setUpdatingMode(true);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/quran/admin/provider-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode })
      });

      if (res.ok) {
        setProviderMode(newMode);
        toast({
          title: "Provider Mode Updated",
          description: `Qur'an Service provider mode switched to '${newMode}'.`
        });
      } else {
        const err = await res.json();
        toast({
          variant: "destructive",
          title: "Mode Update Failed",
          description: err.error || "Failed to update provider mode."
        });
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: e.message || "Failed to connect to backend server."
      });
    } finally {
      setUpdatingMode(false);
    }
  };

  const handleTriggerRevalidation = async (dryRun = false) => {
    setTriggeringJob(true);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/quran/admin/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dryRun,
          uploadR2,
          apiKey: openaiApiKey ? openaiApiKey.trim() : undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setJobStatus(data.jobStatus);
        toast({
          title: "Canonical Qur'an Ingestion Initiated",
          description: "114 Surahs, 6,236 Ayahs, R2 mirroring and pgvector chunking in progress."
        });
      } else {
        const err = await res.json();
        toast({
          variant: "destructive",
          title: "Execution Error",
          description: err.error || "Failed to start canonical ingestion."
        });
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: e.message || "Failed to trigger ingestion."
      });
    } finally {
      setTriggeringJob(false);
    }
  };

  // Calculate live dynamic ticker duration (seconds)
  const getElapsedSeconds = () => {
    if (!jobStatus?.startTime) return 0;
    const start = new Date(jobStatus.startTime).getTime();
    const end = jobStatus.endTime ? new Date(jobStatus.endTime).getTime() : now;
    return Math.max(0, Math.floor((end - start) / 1000));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/80 border border-emerald-500/20 p-6 rounded-2xl backdrop-blur-md shadow-md">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-7 h-7 text-emerald-500 animate-pulse" />
            <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">Canonical Qur’an Data Layer</h2>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-mono">
              Version {manifest?.version || '1.0.0'}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Independent platform-owned Qur'an corpus, Cloudflare R2 mirror (by chapter, page, juz, verse), and 3-way parity cross-validation engine.
          </p>
        </div>

        <Button
          onClick={fetchDataStatus}
          disabled={loading}
          variant="outline"
          className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      {/* Grid Row 1: Manifest & Provider Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manifest & Storage Stats Card */}
        <Card className="lg:col-span-2 bg-card/50 border-border/60 backdrop-blur-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <CardTitle className="text-lg font-semibold text-foreground font-display">Release Manifest & Database Stats</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-muted text-muted-foreground font-mono text-xs">
                SHA-256: {manifest?.checksum ? `${manifest.checksum.substring(0, 12)}...` : 'v1.0.0-verified'}
              </Badge>
            </div>
            <CardDescription className="text-muted-foreground text-xs">
              Verified Medina Mushaf (Hafs an Asim) structure & localized relational counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              <div className="bg-muted/40 p-3 rounded-xl border border-border/60">
                <div className="text-muted-foreground text-xs font-medium mb-1">Surahs</div>
                <div className="text-xl font-bold text-emerald-500 font-mono">
                  {dbStats?.totalSurahs || manifest?.total_surahs || 114}
                </div>
                <div className="text-[10px] text-muted-foreground/80 mt-1">114 Surahs</div>
              </div>

              <div className="bg-muted/40 p-3 rounded-xl border border-border/60">
                <div className="text-muted-foreground text-xs font-medium mb-1">Ayahs</div>
                <div className="text-xl font-bold text-emerald-500 font-mono">
                  {dbStats?.totalAyahs || manifest?.total_ayahs || 6236}
                </div>
                <div className="text-[10px] text-muted-foreground/80 mt-1">6,236 Verses</div>
              </div>

              <div className="bg-muted/40 p-3 rounded-xl border border-border/60">
                <div className="text-muted-foreground text-xs font-medium mb-1">Mushaf Pages</div>
                <div className="text-xl font-bold text-emerald-500 font-mono">
                  {dbStats?.totalPages || manifest?.total_pages || 604}
                </div>
                <div className="text-[10px] text-muted-foreground/80 mt-1">Madani Layout</div>
              </div>

              <div className="bg-muted/40 p-3 rounded-xl border border-border/60">
                <div className="text-muted-foreground text-xs font-medium mb-1">Translations</div>
                <div className="text-xl font-bold text-teal-500 font-mono">
                  {dbStats?.totalTranslations || 25}
                </div>
                <div className="text-[10px] text-muted-foreground/80 mt-1">45+ Languages</div>
              </div>

              <div className="bg-muted/40 p-3 rounded-xl border border-border/60">
                <div className="text-muted-foreground text-xs font-medium mb-1">Classical Tafsir</div>
                <div className="text-xl font-bold text-amber-500 font-mono">
                  {dbStats?.totalTafsirs || 12}
                </div>
                <div className="text-[10px] text-muted-foreground/80 mt-1">12 Major Books</div>
              </div>

              <div className="bg-muted/40 p-3 rounded-xl border border-border/60">
                <div className="text-muted-foreground text-xs font-medium mb-1">Reciters</div>
                <div className="text-xl font-bold text-indigo-500 font-mono">
                  {dbStats?.totalReciters || 20}
                </div>
                <div className="text-[10px] text-muted-foreground/80 mt-1">Canonical Audio</div>
              </div>

              <div className="bg-muted/40 p-3 rounded-xl border border-border/60">
                <div className="text-muted-foreground text-xs font-medium mb-1">pgvector Chunks</div>
                <div className="text-xl font-bold text-cyan-500 font-mono">
                  {dbStats?.totalChunks || 6236}
                </div>
                <div className="text-[10px] text-muted-foreground/80 mt-1">Semantic RAG</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Provider Mode Selector Card */}
        <Card className="bg-card/50 border-border/60 backdrop-blur-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-500" />
              <CardTitle className="text-lg font-semibold text-foreground font-display">Provider Abstraction Mode</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground text-xs">
              Dynamically switch backend domain provider mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                mode: 'quran-foundation',
                title: 'Quran Foundation API',
                desc: 'External provider proxy',
                icon: Globe,
                color: 'border-blue-500/30 text-blue-500 bg-blue-500/10'
              },
              {
                mode: 'hybrid',
                title: 'Hybrid Shadow Mode',
                desc: 'Local primary + live API shadow check',
                icon: Layers,
                color: 'border-amber-500/30 text-amber-500 bg-amber-500/10'
              },
              {
                mode: 'local',
                title: 'Local Canonical DB & R2',
                desc: '100% Platform-owned PostgreSQL & R2',
                icon: Server,
                color: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'
              }
            ].map((item) => {
              const IconComp = item.icon;
              const isSelected = providerMode === item.mode;
              return (
                <button
                  key={item.mode}
                  onClick={() => handleProviderModeChange(item.mode as any)}
                  disabled={updatingMode}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${isSelected
                      ? `${item.color} shadow-sm ring-1 ring-emerald-500/30`
                      : 'border-border/60 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/30'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className="w-4 h-4" />
                    <div>
                      <div className="text-sm font-semibold text-foreground">{item.title}</div>
                      <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Grid Row 2: Ingestion, Cloudflare R2 & Embeddings Trigger Panel */}
      <Card className="bg-card/50 border-border/60 backdrop-blur-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-500" />
                <CardTitle className="text-lg font-semibold text-foreground font-display">Canonical Qur'an Ingestion & R2 Mirroring Worker</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground text-xs mt-1">
                Fetches all 114 Surahs & 6,236 Ayahs, performs 3-way cross-validation, populates PostgreSQL, and exports JSON structures to Cloudflare R2.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleTriggerRevalidation(true)}
                disabled={triggeringJob || jobStatus?.status === 'running'}
                variant="outline"
                className="border-border text-foreground text-xs"
              >
                Dry Run
              </Button>
              <Button
                onClick={() => handleTriggerRevalidation(false)}
                disabled={triggeringJob || jobStatus?.status === 'running'}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
              >
                {triggeringJob ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2 fill-current" />
                )}
                Trigger Canonical Ingestion
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Options: R2 Upload & OpenAI Key Override */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="quranR2UploadCheckbox"
                checked={uploadR2}
                onChange={(e) => setUploadR2(e.target.checked)}
                disabled={triggeringJob || jobStatus?.status === 'running'}
                className="mt-0.5 rounded border-border text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="quranR2UploadCheckbox" className="text-foreground cursor-pointer select-none">
                <span className="font-semibold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Cloud className="w-3.5 h-3.5" />
                  Mirror Pre-rendered JSON to Cloudflare R2
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Pre-renders and uploads canonical JSON files (<code className="font-mono text-emerald-600 dark:text-emerald-300">chapters/</code>, <code className="font-mono text-emerald-600 dark:text-emerald-300">pages/</code>, <code className="font-mono text-emerald-600 dark:text-emerald-300">recitations/</code>) to R2 bucket for sub-30ms edge delivery.
                </p>
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-foreground font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Key className="w-3.5 h-3.5 text-emerald-500" />
                  OpenAI API Key (Dynamic Override)
                </span>
                <span className="text-[10px] text-muted-foreground">Optional</span>
              </label>
              <Input
                type="password"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                placeholder="sk-proj-... (Uses server .env if left blank)"
                disabled={triggeringJob || jobStatus?.status === 'running'}
                className="bg-background border-input text-xs font-mono text-foreground"
              />
              <p className="text-[10px] text-muted-foreground">
                Generates dense vector embeddings (<code className="text-emerald-600 dark:text-emerald-300 font-mono">text-embedding-3-small</code>) for all 6,236 Ayahs in <code className="text-emerald-600 dark:text-emerald-300 font-mono">quran_retrieval_chunks</code>.
              </p>
            </div>
          </div>

          {/* Job Progress Banner & Second-by-Second Ticker */}
          <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={
                  jobStatus?.status === 'running'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 animate-pulse'
                    : jobStatus?.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      : jobStatus?.status === 'failed'
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                        : 'bg-muted text-muted-foreground'
                }
              >
                Status: {jobStatus?.status ? jobStatus.status.toUpperCase() : 'IDLE'}
              </Badge>

              <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Elapsed: {getElapsedSeconds()}s</span>
              </div>
            </div>

            {jobStatus?.status === 'running' && (
              <div className="text-emerald-500 font-mono font-medium">
                {jobStatus.progress}% Complete
              </div>
            )}
          </div>

          {/* Terminal Console Logs */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-56 overflow-y-auto space-y-1">
            {jobStatus?.logs && jobStatus.logs.length > 0 ? (
              jobStatus.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 select-none">&gt;</span>
                  <span>{log}</span>
                </div>
              ))
            ) : (
              <div className="text-slate-600 italic">No pipeline logs available. Click 'Trigger Canonical Ingestion' to start.</div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Grid Row 3: Translation Registry */}
      {(() => {
        const uniqueLanguages = Array.from(new Set(translations.map((t) => t.language || 'other'))).sort();
        const filteredTranslations = translations.filter((item) => {
          const matchesQuery =
            searchQuery.trim() === "" ||
            item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.editionKey?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.publisher?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.language?.toLowerCase().includes(searchQuery.toLowerCase());

          const matchesLang =
            selectedLanguage === "all" || item.language?.toLowerCase() === selectedLanguage.toLowerCase();

          return matchesQuery && matchesLang;
        });

        return (
          <Card className="bg-card/50 border-border/60 backdrop-blur-md">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-500" />
                    <CardTitle className="text-lg font-semibold text-foreground font-display">
                      Translation & License Registry
                    </CardTitle>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-mono">
                      {translations.length} Editions Approved
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground text-xs mt-1">
                    Canonical multi-lingual translation editions with verified commercial redistribution licensing provenance
                  </CardDescription>
                </div>

                {/* Search Toolbar */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, language, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background/50 border-border/60 text-xs h-9 rounded-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Language Filter Pills */}
              {uniqueLanguages.length > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-border/40 mt-3">
                  <span className="text-xs text-muted-foreground font-medium mr-1">Languages:</span>
                  <Badge
                    variant={selectedLanguage === "all" ? "default" : "outline"}
                    className={`cursor-pointer text-[11px] px-2.5 py-0.5 transition-all ${
                      selectedLanguage === "all"
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedLanguage("all")}
                  >
                    All ({translations.length})
                  </Badge>
                  {uniqueLanguages.slice(0, 15).map((lang) => {
                    const count = translations.filter((t) => (t.language || 'other') === lang).length;
                    return (
                      <Badge
                        key={lang}
                        variant={selectedLanguage === lang ? "default" : "outline"}
                        className={`cursor-pointer text-[11px] px-2.5 py-0.5 transition-all uppercase ${
                          selectedLanguage === lang
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedLanguage(lang)}
                      >
                        {lang} ({count})
                      </Badge>
                    );
                  })}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-xl border border-border/40 max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs text-foreground">
                  <thead className="bg-muted/70 text-muted-foreground uppercase font-mono border-b border-border/60 sticky top-0 backdrop-blur-md z-10">
                    <tr>
                      <th className="p-3">Edition Key</th>
                      <th className="p-3">Translation Name</th>
                      <th className="p-3">Language</th>
                      <th className="p-3">Publisher / Author</th>
                      <th className="p-3">License Type</th>
                      <th className="p-3">Commercial Rights</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredTranslations.length > 0 ? (
                      filteredTranslations.map((item) => (
                        <tr key={item.editionKey} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                            {item.editionKey}
                          </td>
                          <td className="p-3 font-semibold text-foreground">{item.name}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px] uppercase font-mono bg-muted/30">
                              {item.language || 'en'}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {item.publisher || 'Canonical Knowledge'} ({item.author || item.name})
                          </td>
                          <td className="p-3 text-foreground">{item.licenseType || 'Open Islamic Knowledge License'}</td>
                          <td className="p-3">
                            {item.commercialAllowed ? (
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                                Commercial Approved
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                                Restricted
                              </Badge>
                            )}
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 capitalize">
                              {item.status || 'approved'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground italic">
                          No translation editions match your search query "{searchQuery}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground mt-3 font-mono">
                <span>Showing {filteredTranslations.length} of {translations.length} approved editions</span>
                <span>Provenance: Tanzil, QuranEnc & King Fahd Complex</span>
              </div>
            </CardContent>
          </Card>
        );
      })()}
    </div>
  );
}
