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
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  totalSurahs: number;
  totalAyahs: number;
  totalPages: number;
  totalEditions: number;
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
  const [loading, setLoading] = useState(true);
  const [updatingMode, setUpdatingMode] = useState(false);
  const [triggeringJob, setTriggeringJob] = useState(false);
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
        body: JSON.stringify({ dryRun })
      });

      if (res.ok) {
        const data = await res.json();
        setJobStatus(data.jobStatus);
        toast({
          title: "Re-validation Started",
          description: "3-Way Cross-Validation & Ingestion worker initiated."
        });
      } else {
        const err = await res.json();
        toast({
          variant: "destructive",
          title: "Execution Error",
          description: err.error || "Failed to start re-validation worker."
        });
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: e.message || "Failed to trigger re-validation."
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-900/40 p-6 rounded-2xl border border-emerald-500/20 backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-7 h-7 text-emerald-400 animate-pulse" />
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Canonical Qur’an Data Layer</h2>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono">
              Version {manifest?.version || '1.0.0'}
            </Badge>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl">
            Independent platform-owned Qur'an corpus, versioned dataset manifests, and 3-way parity cross-validation engine.
          </p>
        </div>

        <Button
          onClick={fetchDataStatus}
          disabled={loading}
          variant="outline"
          className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      {/* Grid Row 1: Manifest & Provider Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manifest & Storage Stats Card */}
        <Card className="lg:col-span-2 bg-slate-900/60 border-slate-800 backdrop-blur-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <CardTitle className="text-lg font-semibold text-slate-100">Release Manifest & Database Stats</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-slate-800 text-slate-300 font-mono text-xs">
                SHA-256: {manifest?.checksum ? `${manifest.checksum.substring(0, 12)}...` : 'v1.0.0-verified'}
              </Badge>
            </div>
            <CardDescription className="text-slate-400 text-xs">
              Verified Medina Mushaf (Hafs an Asim) structure & localized relational counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                <div className="text-slate-400 text-xs font-medium mb-1">Total Surahs</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {dbStats?.totalSurahs || manifest?.total_surahs || 114}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">114 Canonical Surahs</div>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                <div className="text-slate-400 text-xs font-medium mb-1">Total Ayahs</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {dbStats?.totalAyahs || manifest?.total_ayahs || 6236}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">6,236 Hafs Verses</div>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                <div className="text-slate-400 text-xs font-medium mb-1">Mushaf Pages</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {dbStats?.totalPages || manifest?.total_pages || 604}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Madani Page Mapping</div>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                <div className="text-slate-400 text-xs font-medium mb-1">Text Editions</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {dbStats?.totalEditions || 3}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Approved Datasets</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Provider Mode Selector Card */}
        <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <CardTitle className="text-lg font-semibold text-slate-100">Provider Abstraction Mode</CardTitle>
            </div>
            <CardDescription className="text-slate-400 text-xs">
              Dynamically switch backend domain provider mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                mode: 'quran-foundation',
                title: 'Quran Foundation API',
                desc: 'External MVP provider proxy',
                icon: Globe,
                color: 'border-blue-500/30 text-blue-400 bg-blue-500/10'
              },
              {
                mode: 'hybrid',
                title: 'Hybrid Shadow Mode',
                desc: 'Local primary + live API shadow check',
                icon: Layers,
                color: 'border-amber-500/30 text-amber-400 bg-amber-500/10'
              },
              {
                mode: 'local',
                title: 'Local Canonical DB',
                desc: '100% Platform-owned PostgreSQL',
                icon: Server,
                color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
              }
            ].map((item) => {
              const IconComp = item.icon;
              const isSelected = providerMode === item.mode;
              return (
                <button
                  key={item.mode}
                  onClick={() => handleProviderModeChange(item.mode as any)}
                  disabled={updatingMode}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? `${item.color} shadow-lg ring-1 ring-emerald-500/30`
                      : 'border-slate-800 bg-slate-800/30 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className="w-4 h-4" />
                    <div>
                      <div className="text-sm font-semibold">{item.title}</div>
                      <div className="text-[11px] opacity-70">{item.desc}</div>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Grid Row 2: 3-Way Re-validation Worker Panel */}
      <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <CardTitle className="text-lg font-semibold text-slate-100">3-Way Parity Re-validation Worker</CardTitle>
              </div>
              <CardDescription className="text-slate-400 text-xs mt-1">
                Cross-validate KFGQPC Uthmani Hafs, Tanzil Uthmani v1.1, and Quran Foundation API responses
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleTriggerRevalidation(true)}
                disabled={triggeringJob || jobStatus?.status === 'running'}
                variant="outline"
                className="border-slate-700 text-slate-300 text-xs"
              >
                Dry Run
              </Button>
              <Button
                onClick={() => handleTriggerRevalidation(false)}
                disabled={triggeringJob || jobStatus?.status === 'running'}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs"
              >
                {triggeringJob ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2 fill-current" />
                )}
                Run Re-validation Pipeline
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Job Progress Banner & Second-by-Second Ticker */}
          <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={
                  jobStatus?.status === 'running'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                    : jobStatus?.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : jobStatus?.status === 'failed'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-slate-800 text-slate-400'
                }
              >
                Status: {jobStatus?.status ? jobStatus.status.toUpperCase() : 'IDLE'}
              </Badge>

              <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Elapsed: {getElapsedSeconds()}s</span>
              </div>
            </div>

            {jobStatus?.status === 'running' && (
              <div className="text-emerald-400 font-mono font-medium">
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
              <div className="text-slate-600 italic">No pipeline logs available. Click 'Run Re-validation Pipeline' to start.</div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Grid Row 3: Translation Registry */}
      <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <CardTitle className="text-lg font-semibold text-slate-100">Translation & License Registry</CardTitle>
          </div>
          <CardDescription className="text-slate-400 text-xs">
            Approved translation editions with commercial redistribution licensing provenance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Edition Key</th>
                  <th className="p-3">Translation Name</th>
                  <th className="p-3">Publisher / Author</th>
                  <th className="p-3">License Type</th>
                  <th className="p-3">Commercial Rights</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {translations.map((item) => (
                  <tr key={item.editionKey} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-mono text-emerald-400 font-medium">{item.editionKey}</td>
                    <td className="p-3 font-semibold text-slate-200">{item.name}</td>
                    <td className="p-3 text-slate-400">{item.publisher} ({item.author})</td>
                    <td className="p-3 text-slate-300">{item.licenseType}</td>
                    <td className="p-3">
                      {item.commercialAllowed ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                          Commercial Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                          Restricted
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="bg-slate-800 text-slate-300 capitalize">
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
