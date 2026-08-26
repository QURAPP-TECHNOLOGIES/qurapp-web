import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Sparkles,
  Cpu,
  RefreshCw,
  Sliders,
  Key,
  ShieldCheck,
  Zap,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Server,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth, apiGatewayUrl } from "@/lib/api";

export type LLMProviderType = "openai" | "anthropic" | "local" | "mock";

export interface LLMProviderConfig {
  activeProvider: LLMProviderType;
  activeModel: string;
  temperature?: number;
  maxTokens?: number;
  apiKeyOverride?: string;
  baseUrlOverride?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface AvailableProviderInfo {
  type: LLMProviderType;
  name: string;
  defaultModel: string;
  supportedModels: string[];
  status: "configured" | "mock_fallback" | "available";
}

export function QMentorLLMConfig() {
  const [config, setConfig] = useState<LLMProviderConfig | null>(null);
  const [availableProviders, setAvailableProviders] = useState<AvailableProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Form State
  const [selectedProvider, setSelectedProvider] = useState<LLMProviderType>("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [temperature, setTemperature] = useState<number>(0.3);
  const [maxTokens, setMaxTokens] = useState<number>(300);
  const [apiKeyOverride, setApiKeyOverride] = useState("");
  const [testPrompt, setTestPrompt] = useState("Explain the importance of daily Qur'an recitation in one short sentence.");
  const [testResult, setTestResult] = useState<any>(null);

  const { toast } = useToast();

  const fetchConfig = async () => {
    setLoading(true);
    try {
      // Primary route via API gateway / qmentor-service admin route
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/mentor/admin/llm-provider`);
      if (res.ok) {
        const data = await res.json();
        const cfg: LLMProviderConfig = data.currentConfig;
        setConfig(cfg);
        setAvailableProviders(data.availableProviders || []);
        setSelectedProvider(cfg.activeProvider);
        setSelectedModel(cfg.activeModel);
        setTemperature(cfg.temperature ?? 0.3);
        setMaxTokens(cfg.maxTokens ?? 300);
        setApiKeyOverride(cfg.apiKeyOverride ?? "");
      } else {
        // Fallback endpoint via admin-service proxy
        const adminRes = await fetchWithAuth(`${apiGatewayUrl}/api/v1/admin/qmentor/llm-provider`);
        if (adminRes.ok) {
          const data = await adminRes.json();
          if (data.currentConfig) {
            const cfg: LLMProviderConfig = data.currentConfig;
            setConfig(cfg);
            setAvailableProviders(data.availableProviders || []);
            setSelectedProvider(cfg.activeProvider);
            setSelectedModel(cfg.activeModel);
            setTemperature(cfg.temperature ?? 0.3);
            setMaxTokens(cfg.maxTokens ?? 300);
          }
        }
      }
    } catch (e: any) {
      console.error("Failed to load QMentor LLM config", e);
      toast({
        title: "Load Error",
        description: "Failed to connect to QMentor LLM configuration service.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Update selected model when provider changes
  const handleProviderChange = (provider: LLMProviderType) => {
    setSelectedProvider(provider);
    const providerInfo = availableProviders.find((p) => p.type === provider);
    if (providerInfo && providerInfo.supportedModels.length > 0) {
      setSelectedModel(providerInfo.supportedModels[0]);
    } else {
      switch (provider) {
        case "openai":
          setSelectedModel("gpt-4o-mini");
          break;
        case "anthropic":
          setSelectedModel("claude-3-5-haiku-20241022");
          break;
        case "local":
          setSelectedModel("qurai-v1");
          break;
        case "mock":
          setSelectedModel("mock-v1");
          break;
      }
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const payload: Partial<LLMProviderConfig> = {
        activeProvider: selectedProvider,
        activeModel: selectedModel,
        temperature,
        maxTokens,
        apiKeyOverride: apiKeyOverride.trim() || undefined,
        updatedBy: "admin_web_dashboard",
      };

      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/mentor/admin/llm-provider`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data.currentConfig);
        toast({
          title: "LLM Configuration Saved",
          description: `Active provider updated to ${selectedProvider} (${selectedModel}).`,
        });
      } else {
        // Fallback dispatch via admin-service
        const fallbackRes = await fetchWithAuth(`${apiGatewayUrl}/api/v1/admin/qmentor/llm-provider`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (fallbackRes.ok) {
          toast({
            title: "LLM Configuration Saved",
            description: `Active provider updated to ${selectedProvider} (${selectedModel}).`,
          });
          fetchConfig();
        } else {
          throw new Error("Failed to update provider configuration.");
        }
      }
    } catch (e: any) {
      toast({
        title: "Save Failed",
        description: e.message || String(e),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestProvider = async () => {
    if (!testPrompt.trim()) return;
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/mentor/admin/llm-provider/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: testPrompt }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
        toast({
          title: "Test Execution Complete",
          description: `Response generated using ${data.providerUsed} (${data.modelUsed}) in ${data.latencyMs}ms.`,
        });
      } else {
        throw new Error("Failed to execute provider test.");
      }
    } catch (e: any) {
      toast({
        title: "Test Failed",
        description: e.message || String(e),
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "configured":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">Active & Ready</Badge>;
      case "available":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">Available</Badge>;
      case "mock_fallback":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30">Mock Fallback</Badge>;
      default:
        return <Badge variant="outline">Offline</Badge>;
    }
  };

  const currentModels = availableProviders.find((p) => p.type === selectedProvider)?.supportedModels || [selectedModel];

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            QurAI Mentor — Dynamic LLM Provider Control
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure dynamic AI model routing, switch active providers at runtime with 0 downtime, and inspect model telemetry.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchConfig} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </Button>
      </div>

      {/* Active Provider Overview Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-card to-card border-primary/20 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Active System Provider</span>
                  {config && getStatusBadge("configured")}
                </div>
                <h3 className="text-xl font-bold text-foreground mt-0.5">
                  {config?.activeProvider.toUpperCase()} — <span className="text-primary font-mono text-base">{config?.activeModel}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Temperature: <span className="font-mono text-foreground font-semibold">{config?.temperature ?? 0.3}</span> | Max Tokens:{" "}
                  <span className="font-mono text-foreground font-semibold">{config?.maxTokens ?? 300}</span> | Updated:{" "}
                  <span className="text-foreground">{config?.updatedAt ? new Date(config.updatedAt).toLocaleString() : "System Init"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-card/80">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Religious Safety Layer Enforced
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                LLM Provider & Model Selection
              </CardTitle>
              <CardDescription>Select the active inference engine used for QurAI mentoring and dynamic habit reminders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Provider Selection Cards */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select AI Provider Engine</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "openai", name: "OpenAI Cloud", desc: "GPT-4o-mini & GPT-4o", icon: Cpu, badge: "Recommended" },
                    { id: "anthropic", name: "Anthropic Claude", desc: "Claude 3.5 Haiku & Sonnet", icon: Zap },
                    { id: "local", name: "Local QurAI Model", desc: "On-Premises / Fine-Tuned GPU", icon: Server },
                    { id: "mock", name: "Mock LLM Engine", desc: "Deterministic Testing Fallback", icon: Bot },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleProviderChange(p.id as LLMProviderType)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative ${
                        selectedProvider === p.id
                          ? "bg-primary/10 border-primary shadow-sm text-foreground"
                          : "bg-card hover:bg-muted/40 border-border/60 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p.icon className={`h-4 w-4 ${selectedProvider === p.id ? "text-primary" : ""}`} />
                          <span className="text-sm font-semibold text-foreground">{p.name}</span>
                        </div>
                        {selectedProvider === p.id && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Model Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Model Architecture</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="bg-muted/30 border-border/60 font-mono text-xs">
                    <SelectValue placeholder="Select target model" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentModels.map((m) => (
                      <SelectItem key={m} value={m} className="font-mono text-xs">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Hyperparameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-muted-foreground">Temperature</span>
                    <span className="font-mono font-bold text-primary">{temperature}</span>
                  </div>
                  <Slider value={[temperature]} min={0} max={1} step={0.05} onValueChange={(val) => setTemperature(val[0])} />
                  <p className="text-[10px] text-muted-foreground">Lower values produce consistent, deterministic mentoring text.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-muted-foreground">Max Output Tokens</span>
                    <span className="font-mono font-bold text-primary">{maxTokens}</span>
                  </div>
                  <Slider value={[maxTokens]} min={50} max={1000} step={25} onValueChange={(val) => setMaxTokens(val[0])} />
                  <p className="text-[10px] text-muted-foreground">Caps maximum generation length per mentor response.</p>
                </div>
              </div>

              {/* API Key Override (Optional) */}
              <div className="space-y-2 border-t border-border/60 pt-4">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-primary" />
                  Runtime API Key Override (Optional)
                </label>
                <Input
                  type="password"
                  value={apiKeyOverride}
                  onChange={(e) => setApiKeyOverride(e.target.value)}
                  placeholder="sk-... (Leave blank to use environment default)"
                  className="bg-muted/30 font-mono text-xs border-border/60"
                />
                <p className="text-[10px] text-muted-foreground">
                  Overrides default server environment variable key at runtime. Persisted securely in QMentor config.
                </p>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveConfig}
                disabled={saving}
                className="w-full gap-2 font-semibold shadow-md bg-gradient-to-r from-primary to-primary-hover hover:scale-[1.01] active:scale-[0.99] transition-transform"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Apply Dynamic LLM Provider Configuration
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interactive Test Playground & Provider Catalog */}
        <div className="lg:col-span-5 space-y-6">
          {/* Test Generation Playground */}
          <Card className="border-border/60 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Play className="h-4 w-4 text-primary" />
                Live Model Test Playground
              </CardTitle>
              <CardDescription>Test output generation directly against the active provider configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Test Prompt</label>
                <Input
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Enter test prompt..."
                  className="bg-muted/30 text-xs border-border/60"
                />
              </div>

              <Button variant="secondary" size="sm" onClick={handleTestProvider} disabled={testing || !testPrompt.trim()} className="w-full gap-2">
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                Run Live Test Call
              </Button>

              {testResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 rounded-xl bg-zinc-950 text-zinc-200 border border-zinc-800 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-800 pb-2">
                    <span>Provider: <span className="text-emerald-400 font-bold">{testResult.providerUsed}</span></span>
                    <span>Model: <span className="text-blue-400 font-bold">{testResult.modelUsed}</span></span>
                    <span>Latency: <span className="text-yellow-400">{testResult.latencyMs}ms</span></span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap font-sans text-xs text-zinc-100">{testResult.response}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Provider Catalog Cards */}
          <Card className="border-border/60 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Provider Engine Catalog
              </CardTitle>
              <CardDescription>Available inference drivers registered in qmentor-service.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableProviders.map((p) => (
                <div key={p.type} className="p-3 rounded-xl border border-border/50 bg-muted/20 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{p.name}</span>
                      {selectedProvider === p.type && (
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">Active</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">Default: {p.defaultModel}</p>
                  </div>
                  <div>{getStatusBadge(p.status)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
