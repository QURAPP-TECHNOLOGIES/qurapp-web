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
  Search,
  Sparkles,
  Zap
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
  totalEmbedded?: number;
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

type EmbeddingOptionTranslation = {
  editionKey: string;
  name: string;
  language: string;
  author: string;
  totalVerses: number;
  embeddedCount: number;
  isEmbedded: boolean;
};

type EmbeddingOptionTafsir = {
  id: string;
  name: string;
  language: string;
  author: string;
  totalPassages: number;
  embeddedCount: number;
  isEmbedded: boolean;
};

type EmbeddingsOptionsData = {
  ayahs: { total: number; embedded: number };
  translations: EmbeddingOptionTranslation[];
  tafsirs: EmbeddingOptionTafsir[];
};

export function QuranDataManagement() {
  const [providerMode, setProviderMode] = useState<'quran-foundation' | 'local' | 'hybrid'>('quran-foundation');
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [dbStats, setDbStats] = useState<DBStats | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [embeddingsJobStatus, setEmbeddingsJobStatus] = useState<JobStatus | null>(null);
  const [embeddingsOptions, setEmbeddingsOptions] = useState<EmbeddingsOptionsData | null>(null);
  const [includeAyahs, setIncludeAyahs] = useState(true);
  const [includeTafsirs, setIncludeTafsirs] = useState(false);
  const [includeTranslations, setIncludeTranslations] = useState(false);
  const [selectedTranslations, setSelectedTranslations] = useState<string[]>([]);
  const [selectedTafsirs, setSelectedTafsirs] = useState<string[]>([]);
  const [embeddingsScopeTab, setEmbeddingsScopeTab] = useState<'ayahs' | 'translations' | 'tafsirs'>('ayahs');
  const [embeddingsTransLang, setEmbeddingsTransLang] = useState('all');
  const [embeddingsTransSearch, setEmbeddingsTransSearch] = useState('');
  const [translations, setTranslations] = useState<TranslationEdition[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingMode, setUpdatingMode] = useState(false);
  const [triggeringJob, setTriggeringJob] = useState(false);
  const [triggeringEmbeddings, setTriggeringEmbeddings] = useState(false);
  const [uploadR2, setUploadR2] = useState(true);
  const [embeddingsApiKey, setEmbeddingsApiKey] = useState("");
  const [incrementalEmbeddings, setIncrementalEmbeddings] = useState(true);
  const [now, setNow] = useState(Date.now());

  const { toast } = useToast();
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const embeddingsTerminalEndRef = useRef<HTMLDivElement>(null);

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
        if (data.embeddingsJobStatus) {
          setEmbeddingsJobStatus(data.embeddingsJobStatus);
        }
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

  const fetchEmbeddingsOptions = async () => {
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/quran/admin/embeddings/options`);
      if (res.ok) {
        const data = await res.json();
        setEmbeddingsOptions(data);
      }
    } catch (e) {
      console.error("Failed to fetch embeddings options:", e);
    }
  };

  useEffect(() => {
    fetchDataStatus();
    fetchTranslations();
    fetchEmbeddingsOptions();
  }, []);

  // Poll status while jobs are running
  useEffect(() => {
    let poll: NodeJS.Timeout | null = null;
    if (jobStatus?.status === 'running' || embeddingsJobStatus?.status === 'running') {
      poll = setInterval(() => {
        fetchDataStatus();
      }, 2000);
    }
    return () => {
      if (poll) clearInterval(poll);
    };
  }, [jobStatus?.status, embeddingsJobStatus?.status]);

  // Auto scroll terminal logs
  useEffect(() => {
    if (jobStatus?.logs && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [jobStatus?.logs]);

  useEffect(() => {
    if (embeddingsJobStatus?.logs && embeddingsTerminalEndRef.current) {
      embeddingsTerminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [embeddingsJobStatus?.logs]);

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
          uploadR2
        })
      });

      if (res.ok) {
        const data = await res.json();
        setJobStatus(data.jobStatus);
        toast({
          title: "Canonical Qur'an Ingestion Initiated",
          description: "114 Surahs, 6,236 Ayahs, 117+ Translations, 12 Tafsirs, 49 Reciters syncing in background."
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

  const toggleTranslation = (editionKey: string) => {
    setSelectedTranslations(prev => 
      prev.includes(editionKey) ? prev.filter(k => k !== editionKey) : [...prev, editionKey]
    );
  };

  const selectTopGlobalTranslations = () => {
    if (!embeddingsOptions?.translations) return;
    const topLangs = ['ur', 'fr', 'id', 'tr', 'es', 'ru', 'de'];
    const matched = embeddingsOptions.translations
      .filter(t => topLangs.includes(t.language?.toLowerCase()))
      .map(t => t.editionKey);
    setSelectedTranslations(Array.from(new Set([...selectedTranslations, ...matched])));
    setIncludeTranslations(true);
  };

  const selectAllTranslations = () => {
    if (!embeddingsOptions?.translations) return;
    setSelectedTranslations(embeddingsOptions.translations.map(t => t.editionKey));
    setIncludeTranslations(true);
  };

  const clearSelectedTranslations = () => {
    setSelectedTranslations([]);
  };

  const toggleTafsir = (id: string) => {
    setSelectedTafsirs(prev => 
      prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
    );
  };

  const selectAllTafsirs = () => {
    if (!embeddingsOptions?.tafsirs) return;
    setSelectedTafsirs(embeddingsOptions.tafsirs.map(t => t.id));
    setIncludeTafsirs(true);
  };

  const clearSelectedTafsirs = () => {
    setSelectedTafsirs([]);
  };

  const handleTriggerEmbeddings = async () => {
    if (!embeddingsApiKey.trim()) {
      toast({
        variant: "destructive",
        title: "OpenAI API Key Required",
        description: "Please enter your OpenAI API key to generate semantic embeddings."
      });
      return;
    }

    const targetTypes: ('ayah' | 'translation' | 'tafsir')[] = [];
    if (includeAyahs) targetTypes.push('ayah');
    if (includeTranslations && selectedTranslations.length > 0) targetTypes.push('translation');
    if (includeTafsirs && selectedTafsirs.length > 0) targetTypes.push('tafsir');

    if (targetTypes.length === 0) {
      toast({
        variant: "destructive",
        title: "No Target Selected",
        description: "Please select at least one embedding target (Canonical Ayahs, Translations, or Tafsirs)."
      });
      return;
    }

    setTriggeringEmbeddings(true);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/quran/admin/embeddings/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: embeddingsApiKey.trim(),
          targetTypes,
          selectedTranslations,
          selectedTafsirs,
          incrementalOnly: incrementalEmbeddings,
          batchSize: 50
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEmbeddingsJobStatus(data.embeddingsJobStatus);
        toast({
          title: "QurAI Embeddings Generation Initiated",
          description: `Dense vector embeddings for ${targetTypes.join(', ')} are being generated in background.`
        });
      } else {
        const err = await res.json();
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: err.error || "Failed to start embeddings generator."
        });
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: e.message || "Failed to trigger embeddings."
      });
    } finally {
      setTriggeringEmbeddings(false);
    }
  };

  // Calculate live dynamic ticker duration (seconds)
  const getElapsedSeconds = () => {
    if (!jobStatus?.startTime) return 0;
    const start = new Date(jobStatus.startTime).getTime();
    const end = jobStatus.endTime ? new Date(jobStatus.endTime).getTime() : now;
    return Math.max(0, Math.floor((end - start) / 1000));
  };

  const getEmbeddingsElapsedSeconds = () => {
    if (!embeddingsJobStatus?.startTime) return 0;
    const start = new Date(embeddingsJobStatus.startTime).getTime();
    const end = embeddingsJobStatus.endTime ? new Date(embeddingsJobStatus.endTime).getTime() : now;
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

      {/* Grid Row 2: Ingestion & R2 Mirroring Panel */}
      <Card className="bg-card/50 border-border/60 backdrop-blur-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-500" />
                <CardTitle className="text-lg font-semibold text-foreground font-display">Canonical Qur'an Ingestion & Cloud Mirroring</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground text-xs mt-1">
                Synchronizes authentic 114 Surahs, 6,236 Ayahs, 117+ Translations, 12 Classical Tafsirs, 49 Reciters, and exports pre-rendered JSON files to Cloudflare R2.
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
          {/* Option: R2 Upload */}
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs">
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
                  Mirror Pre-rendered JSON to Cloudflare R2 Edge Storage
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Pre-renders and uploads canonical JSON bundles (<code className="font-mono text-emerald-600 dark:text-emerald-300">chapters/</code>, <code className="font-mono text-emerald-600 dark:text-emerald-300">pages/</code>, <code className="font-mono text-emerald-600 dark:text-emerald-300">recitations/</code>, <code className="font-mono text-emerald-600 dark:text-emerald-300">translations/</code>) for sub-30ms global edge delivery.
                </p>
              </label>
            </div>
          </div>

          {/* Ingestion Progress Banner */}
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

          {/* Ingestion Console Logs */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto space-y-1">
            {jobStatus?.logs && jobStatus.logs.length > 0 ? (
              jobStatus.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 select-none">&gt;</span>
                  <span>{log}</span>
                </div>
              ))
            ) : (
              <div className="text-slate-600 italic">No ingestion logs. Click 'Trigger Canonical Ingestion' to start.</div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Grid Row 2.5: Dedicated QurAI Semantic Embeddings & pgvector Indexing Panel */}
      <Card className="bg-card/50 border-emerald-500/30 backdrop-blur-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-lg font-semibold text-foreground font-display">QurAI Semantic Embeddings & pgvector Indexer</CardTitle>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 font-mono text-[11px]">
                  text-embedding-3-small
                </Badge>
              </div>
              <CardDescription className="text-muted-foreground text-xs mt-1">
                Generates 1536-dimensional dense vector embeddings for Canonical Ayahs, Multi-Lingual Translations, and Classical Tafsirs for semantic RAG search.
              </CardDescription>
            </div>

            <Button
              onClick={handleTriggerEmbeddings}
              disabled={triggeringEmbeddings || embeddingsJobStatus?.status === 'running'}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shrink-0"
            >
              {triggeringEmbeddings || embeddingsJobStatus?.status === 'running' ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2 fill-current" />
              )}
              Generate Semantic Embeddings
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Target Scope Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeAyahs}
                onChange={(e) => setIncludeAyahs(e.target.checked)}
                disabled={triggeringEmbeddings || embeddingsJobStatus?.status === 'running'}
                className="rounded border-border text-amber-500 focus:ring-amber-500"
              />
              <div>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                  Canonical Ayahs (6,236)
                </span>
                <span className="text-[10px] text-muted-foreground">Arabic Uthmani + Khattab English</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeTranslations}
                onChange={(e) => setIncludeTranslations(e.target.checked)}
                disabled={triggeringEmbeddings || embeddingsJobStatus?.status === 'running'}
                className="rounded border-border text-amber-500 focus:ring-amber-500"
              />
              <div>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-amber-500" />
                  Translations ({selectedTranslations.length} selected)
                </span>
                <span className="text-[10px] text-muted-foreground">Select any language / edition</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeTafsirs}
                onChange={(e) => setIncludeTafsirs(e.target.checked)}
                disabled={triggeringEmbeddings || embeddingsJobStatus?.status === 'running'}
                className="rounded border-border text-amber-500 focus:ring-amber-500"
              />
              <div>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  Classical Tafsirs ({selectedTafsirs.length} selected)
                </span>
                <span className="text-[10px] text-muted-foreground">12 Classical Scholarly Works</span>
              </div>
            </label>
          </div>

          {/* Interactive Multi-Source Configuration Tabs */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEmbeddingsScopeTab('ayahs')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    embeddingsScopeTab === 'ayahs'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  📖 Canonical Ayahs ({embeddingsOptions?.ayahs.embedded || 0}/6,236)
                </button>

                <button
                  type="button"
                  onClick={() => setEmbeddingsScopeTab('translations')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    embeddingsScopeTab === 'translations'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  🌐 Multi-Lingual Translations ({selectedTranslations.length}/{embeddingsOptions?.translations.length || 120})
                </button>

                <button
                  type="button"
                  onClick={() => setEmbeddingsScopeTab('tafsirs')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    embeddingsScopeTab === 'tafsirs'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  📜 Classical Tafsirs ({selectedTafsirs.length}/{embeddingsOptions?.tafsirs.length || 12})
                </button>
              </div>

              {embeddingsScopeTab === 'translations' && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={selectTopGlobalTranslations}
                    className="h-7 text-[11px] border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                  >
                    ⭐ Select Top Global (UR, FR, ID, TR, ES, RU, DE)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={selectAllTranslations}
                    className="h-7 text-[11px]"
                  >
                    Select All (120)
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearSelectedTranslations}
                    className="h-7 text-[11px] text-muted-foreground"
                  >
                    Clear
                  </Button>
                </div>
              )}

              {embeddingsScopeTab === 'tafsirs' && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={selectAllTafsirs}
                    className="h-7 text-[11px]"
                  >
                    Select All (12)
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearSelectedTafsirs}
                    className="h-7 text-[11px] text-muted-foreground"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* TAB CONTENT 1: CANONICAL AYAHS */}
            {embeddingsScopeTab === 'ayahs' && (
              <div className="p-3 bg-background/50 rounded-lg border border-border/50 text-xs flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground">Canonical 6,236 Qur'anic Ayahs (Core Corpus)</div>
                  <div className="text-muted-foreground text-[11px]">Includes Arabic Uthmani text + normalized search tokens + Dr. Mustafa Khattab & Sahih International English translation context.</div>
                </div>
                <Badge variant="outline" className="font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  {embeddingsOptions?.ayahs.embedded || 0} / 6,236 Indexed
                </Badge>
              </div>
            )}

            {/* TAB CONTENT 2: MULTI-LINGUAL TRANSLATIONS */}
            {embeddingsScopeTab === 'translations' && (
              <div className="space-y-3">
                {/* Search & Language Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search translation by name, language, or translator..."
                      value={embeddingsTransSearch}
                      onChange={(e) => setEmbeddingsTransSearch(e.target.value)}
                      className="pl-8 h-8 text-xs bg-background border-border"
                    />
                  </div>

                  {/* Language Pills */}
                  {(() => {
                    const transList = embeddingsOptions?.translations || [];
                    const langs = Array.from(new Set(transList.map(t => t.language?.toLowerCase()))).sort();
                    return (
                      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
                        <button
                          type="button"
                          onClick={() => setEmbeddingsTransLang('all')}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium shrink-0 transition-colors ${
                            embeddingsTransLang === 'all'
                              ? 'bg-foreground text-background font-semibold'
                              : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          All ({transList.length})
                        </button>
                        {langs.slice(0, 10).map((lng) => {
                          const count = transList.filter(t => t.language?.toLowerCase() === lng).length;
                          return (
                            <button
                              key={lng}
                              type="button"
                              onClick={() => setEmbeddingsTransLang(lng)}
                              className={`px-2 py-0.5 rounded text-[11px] uppercase font-mono font-medium shrink-0 transition-colors ${
                                embeddingsTransLang === lng
                                  ? 'bg-amber-500 text-white font-semibold'
                                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {lng} ({count})
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Translation List Table */}
                <div className="max-h-60 overflow-y-auto rounded-lg border border-border/50 bg-background/50 text-xs">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-muted/90 backdrop-blur-sm text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                      <tr>
                        <th className="p-2.5 w-10 text-center">Select</th>
                        <th className="p-2.5">Edition Name</th>
                        <th className="p-2.5">Language</th>
                        <th className="p-2.5">Translator / Author</th>
                        <th className="p-2.5 text-right">Vectors Indexed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {(() => {
                        const list = embeddingsOptions?.translations || [];
                        const filtered = list.filter(item => {
                          const q = embeddingsTransSearch.toLowerCase().trim();
                          const matchesQuery = !q || item.name?.toLowerCase().includes(q) || item.editionKey?.toLowerCase().includes(q) || item.author?.toLowerCase().includes(q) || item.language?.toLowerCase().includes(q);
                          const matchesLang = embeddingsTransLang === 'all' || item.language?.toLowerCase() === embeddingsTransLang.toLowerCase();
                          return matchesQuery && matchesLang;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="p-4 text-center text-muted-foreground italic">
                                No translations match your search.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((item) => {
                          const isChecked = selectedTranslations.includes(item.editionKey);
                          return (
                            <tr
                              key={item.editionKey}
                              onClick={() => toggleTranslation(item.editionKey)}
                              className={`cursor-pointer transition-colors ${
                                isChecked ? 'bg-amber-500/10 font-medium' : 'hover:bg-muted/30'
                              }`}
                            >
                              <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleTranslation(item.editionKey)}
                                  className="rounded border-border text-amber-500 focus:ring-amber-500"
                                />
                              </td>
                              <td className="p-2.5 text-foreground font-semibold">
                                {item.name}
                                <span className="ml-2 font-mono text-[10px] text-muted-foreground">{item.editionKey}</span>
                              </td>
                              <td className="p-2.5">
                                <Badge variant="secondary" className="uppercase font-mono text-[10px]">
                                  {item.language}
                                </Badge>
                              </td>
                              <td className="p-2.5 text-muted-foreground">{item.author || 'Scholarly Translation'}</td>
                              <td className="p-2.5 text-right">
                                {item.embeddedCount > 0 ? (
                                  <Badge variant="outline" className="font-mono text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                                    {item.embeddedCount} / 6,236 Indexed
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                                    0 / 6,236
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: CLASSICAL TAFSIRS */}
            {embeddingsScopeTab === 'tafsirs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {(() => {
                  const tafsirsList = embeddingsOptions?.tafsirs || [
                    { id: 'ar.ibnkathir', name: 'تفسير ابن كثير', language: 'ar', author: 'Ibn Kathir (d. 774H)', totalPassages: 6236, embeddedCount: 0, isEmbedded: false },
                    { id: 'ar.saadi', name: 'تيسير الكريم الرحمن (السعدي)', language: 'ar', author: "Abdur-Rahman as-Sa'di", totalPassages: 6236, embeddedCount: 0, isEmbedded: false },
                    { id: 'ar.jalalayn', name: 'تفسير الجلالين', language: 'ar', author: 'Al-Mahalli & Al-Suyuti', totalPassages: 6236, embeddedCount: 0, isEmbedded: false },
                    { id: 'ar.muyassar', name: 'التفسير الميسر', language: 'ar', author: 'King Fahd Complex (KFGQPC)', totalPassages: 6236, embeddedCount: 0, isEmbedded: false },
                    { id: 'ar.qurtubi', name: 'الجامع لأحكام القرآن (القرطبي)', language: 'ar', author: 'Imam Al-Qurtubi', totalPassages: 6236, embeddedCount: 0, isEmbedded: false },
                    { id: 'ar.tabari', name: 'جامع البيان (الطبري)', language: 'ar', author: 'Imam Al-Tabari', totalPassages: 6236, embeddedCount: 0, isEmbedded: false },
                    { id: 'en.ibnkathir', name: 'Tafsir Ibn Kathir (English)', language: 'en', author: 'Darussalam', totalPassages: 6236, embeddedCount: 0, isEmbedded: false },
                    { id: 'en.jalalayn', name: 'Tafsir Al-Jalalayn (English)', language: 'en', author: 'Feras Hamza', totalPassages: 6236, embeddedCount: 0, isEmbedded: false },
                    { id: 'en.saadi', name: "Tafsir As-Sa'di (English)", language: 'en', author: 'IIPH', totalPassages: 6236, embeddedCount: 0, isEmbedded: false },
                    { id: 'ur.maududi', name: 'تفہیم القرآن (مودودی)', language: 'ur', author: "Syed Abul A'la Maududi", totalPassages: 6236, embeddedCount: 0, isEmbedded: false }
                  ];

                  return tafsirsList.map((t) => {
                    const isChecked = selectedTafsirs.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => toggleTafsir(t.id)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
                            : 'bg-background/50 border-border/50 hover:border-border hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleTafsir(t.id)}
                            className="mt-0.5 rounded border-border text-amber-500 focus:ring-amber-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-foreground truncate">{t.name}</div>
                            <div className="text-[11px] text-muted-foreground truncate">{t.author}</div>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="secondary" className="uppercase font-mono text-[9px]">
                                {t.language}
                              </Badge>
                              {t.embeddedCount > 0 ? (
                                <Badge variant="outline" className="font-mono text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                                  {t.embeddedCount} Indexed
                                </Badge>
                              ) : (
                                <span className="text-[10px] text-muted-foreground font-mono">Not Indexed</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Options: API Key & Incremental Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs">
            <div className="space-y-1.5">
              <label className="text-foreground font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  OpenAI API Key
                </span>
                <span className="text-[10px] text-amber-500 font-medium">Required for Vectors</span>
              </label>
              <Input
                type="password"
                value={embeddingsApiKey}
                onChange={(e) => setEmbeddingsApiKey(e.target.value)}
                placeholder="sk-proj-..."
                disabled={triggeringEmbeddings || embeddingsJobStatus?.status === 'running'}
                className="bg-background border-input text-xs font-mono text-foreground"
              />
              <p className="text-[10px] text-muted-foreground">
                Uses 1536-dimensional cosine vectors with OpenAI <code className="font-mono text-amber-500">text-embedding-3-small</code>.
              </p>
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="incrementalEmbeddingsCheckbox"
                checked={incrementalEmbeddings}
                onChange={(e) => setIncrementalEmbeddings(e.target.checked)}
                disabled={triggeringEmbeddings || embeddingsJobStatus?.status === 'running'}
                className="mt-0.5 rounded border-border text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="incrementalEmbeddingsCheckbox" className="text-foreground cursor-pointer select-none">
                <span className="font-semibold text-foreground">Incremental Mode (Index Missing Only)</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Only generates embeddings for chunks where <code className="font-mono text-amber-500">embedding IS NULL</code>. Uncheck to regenerate and re-index.
                </p>
              </label>
            </div>
          </div>

          {/* Embeddings Progress Banner */}
          <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={
                  embeddingsJobStatus?.status === 'running'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 animate-pulse'
                    : embeddingsJobStatus?.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      : embeddingsJobStatus?.status === 'failed'
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                        : 'bg-muted text-muted-foreground'
                }
              >
                Status: {embeddingsJobStatus?.status ? embeddingsJobStatus.status.toUpperCase() : 'IDLE'}
              </Badge>

              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                Active Chunks: {dbStats?.totalChunks || 6236} | Embedded: {dbStats?.totalEmbedded || 0}
              </Badge>

              <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Elapsed: {getEmbeddingsElapsedSeconds()}s</span>
              </div>
            </div>

            {embeddingsJobStatus?.status === 'running' && (
              <div className="text-amber-500 font-mono font-medium">
                {embeddingsJobStatus.progress}% Complete
              </div>
            )}
          </div>

          {/* Embeddings Terminal Console Logs */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto space-y-1">
            {embeddingsJobStatus?.logs && embeddingsJobStatus.logs.length > 0 ? (
              embeddingsJobStatus.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 select-none">&gt;</span>
                  <span>{log}</span>
                </div>
              ))
            ) : (
              <div className="text-slate-600 italic">No embedding generation logs. Select targets and click 'Generate Semantic Embeddings' to start vectorization.</div>
            )}
            <div ref={embeddingsTerminalEndRef} />
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
