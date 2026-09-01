import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Layers,
  Sparkles,
  BookOpen,
  Eye,
  History,
  Activity,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Check,
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth, apiGatewayUrl } from "@/lib/api";

export interface GovernanceRevision {
  id: string;
  revision: number;
  status: "DRAFT" | "REVIEW" | "ACTIVE" | "RETIRED";
  created_by: string;
  reviewed_by?: string;
  activated_by?: string;
  change_summary: string;
  identity_data: {
    name?: string;
    role?: string;
    mission?: string;
    public_description?: string;
    supported_languages?: string[];
    public_limitations?: string[];
    privacy_policy?: string;
    architecture_description?: string;
  };
  capabilities_count?: number;
  sources_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RuntimeHealth {
  providers: {
    "quran-service": string;
    "knowledge-service": string;
    "postgres-governance": string;
    "llm-gateway": string;
  };
  timestamp: string;
}

export const QurAIGovernanceConsole: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"identity" | "capabilities" | "sources" | "disclosures" | "revisions" | "runtime">("identity");
  const [activeRecord, setActiveRecord] = useState<any>(null);
  const [revisions, setRevisions] = useState<GovernanceRevision[]>([]);
  const [runtimeHealth, setRuntimeHealth] = useState<RuntimeHealth | null>(null);
  const [loading, setLoading] = useState(false);

  // Edit / Draft Dialog State
  const [isDraftDialogOpen, setIsDraftDialogOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<any>(null);
  const [draftSummary, setDraftSummary] = useState("");

  const loadGovernanceData = async () => {
    setLoading(true);
    try {
      // 1. Load active governance record
      const activeRes = await fetchWithAuth(
        `${apiGatewayUrl()}/api/v1/mentor/admin/governance/active`
      );
      if (activeRes.ok) {
        const data = await activeRes.json();
        setActiveRecord(data);
      }

      // 2. Load revision history
      const revRes = await fetchWithAuth(
        `${apiGatewayUrl()}/api/v1/mentor/admin/governance/revisions`
      );
      if (revRes.ok) {
        const data = await revRes.json();
        setRevisions(data.revisions || []);
      }

      // 3. Load live runtime health
      const healthRes = await fetchWithAuth(
        `${apiGatewayUrl()}/api/v1/mentor/admin/governance/runtime-health`
      );
      if (healthRes.ok) {
        const data = await healthRes.json();
        setRuntimeHealth(data);
      }
    } catch (err: any) {
      toast({
        title: "Governance Data Load Error",
        description: err.message || "Failed to load governance registry records.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGovernanceData();
  }, []);

  const handleCreateDraft = () => {
    const base = activeRecord?.record || {};
    setEditingDraft({
      id: "new-draft",
      identity_data: { ...(base.identity_data || {}) },
      capabilities_data: [...(base.capabilities_data || [])],
      knowledge_sources_data: [...(base.knowledge_sources_data || [])],
      disclosures_data: { ...(base.disclosures_data || {}) },
    });
    setDraftSummary("Update identity metadata & capabilities");
    setIsDraftDialogOpen(true);
  };

  const handleSaveDraft = async () => {
    try {
      const res = await fetchWithAuth(
        `${apiGatewayUrl()}/api/v1/mentor/admin/governance/drafts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identity_data: editingDraft.identity_data,
            capabilities_data: editingDraft.capabilities_data,
            knowledge_sources_data: editingDraft.knowledge_sources_data,
            disclosures_data: editingDraft.disclosures_data,
            created_by: "admin_console",
            change_summary: draftSummary,
          }),
        }
      );

      if (res.ok) {
        toast({
          title: "Draft Created",
          description: "Governance draft created successfully.",
        });
        setIsDraftDialogOpen(false);
        loadGovernanceData();
      } else {
        const data = await res.json();
        throw new Error(data.detail || "Failed to create draft");
      }
    } catch (err: any) {
      toast({
        title: "Draft Creation Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleActivateRevision = async (revisionId: string) => {
    try {
      const res = await fetchWithAuth(
        `${apiGatewayUrl()}/api/v1/mentor/admin/governance/revisions/${revisionId}/activate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.ok) {
        toast({
          title: "Revision Activated",
          description: `Governance revision ${revisionId} is now LIVE. Cache refreshed instantly.`,
        });
        loadGovernanceData();
      } else {
        const data = await res.json();
        throw new Error(data.detail || "Failed to activate revision");
      }
    } catch (err: any) {
      toast({
        title: "Activation Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const resolvedIdentity = activeRecord?.resolvedIdentity || {};
  const record = activeRecord?.record || {};

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-background to-teal-950/40 border border-emerald-500/20 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                QurAI Governance Console
              </h2>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                Revision {activeRecord?.activeRevision || 1} (ACTIVE)
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Authoritative PostgreSQL Governance Registry • Dynamic Runtime Health • Immutable Islamic & Security Boundaries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadGovernanceData}
            disabled={loading}
            className="border-border/60 hover:bg-muted/50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleCreateDraft}
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Draft Revision
          </Button>
        </div>
      </div>

      {/* Immutable Boundary Banner */}
      <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 flex items-start gap-3">
        <Lock className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-blue-300">
            Immutable Governance Boundaries (Enforced strictly in Code & Policy)
          </p>
          <p className="text-muted-foreground leading-relaxed">
            QurAI is an assistive AI habit companion, <strong>NOT a Mufti or Fatwa authority</strong>. Legal verdicts and crisis inquiries are escalated to human scholars. Internal system prompts and developer credentials are unconditionally protected against extraction.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
        {[
          { id: "identity", label: "Identity & Mission", icon: Sparkles },
          { id: "capabilities", label: "Declared Capabilities", icon: Layers },
          { id: "sources", label: "Knowledge Sources", icon: BookOpen },
          { id: "disclosures", label: "Approved Disclosures", icon: Eye },
          { id: "runtime", label: "Runtime Health", icon: Activity },
          { id: "revisions", label: "Audit & Revisions", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: IDENTITY & MISSION */}
      {activeTab === "identity" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Active Persona & Role
              </CardTitle>
              <CardDescription className="text-xs">
                Public display name and Islamic companion role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <Label className="text-muted-foreground">Display Name</Label>
                <div className="font-semibold text-foreground text-sm mt-1">
                  {resolvedIdentity.name || "QurAI Mentor"}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Role Definition</Label>
                <div className="text-foreground mt-1 leading-relaxed">
                  {resolvedIdentity.role || "Context-Aware Islamic Social-Learning & Habit Companion"}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Mission Statement</Label>
                <div className="text-foreground mt-1 leading-relaxed p-3 rounded-lg bg-muted/40 border border-border/40">
                  {resolvedIdentity.mission}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-teal-400" />
                Localization & Boundaries
              </CardTitle>
              <CardDescription className="text-xs">
                Supported languages and explicit public limitations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <Label className="text-muted-foreground">Supported Languages</Label>
                <div className="flex gap-2 mt-1.5">
                  {(record.identity_data?.supported_languages || ["en", "ar", "ur"]).map((lang: string) => (
                    <Badge key={lang} variant="secondary" className="uppercase font-mono text-[11px]">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Public Limitations</Label>
                <ul className="list-disc list-inside space-y-1.5 text-muted-foreground mt-1.5">
                  {(resolvedIdentity.nonCapabilities || []).map((nc: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">
                      {nc}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: CAPABILITIES */}
      {activeTab === "capabilities" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(resolvedIdentity.capabilities || []).map((cap: any) => {
            const isDegraded = cap.status === "DEGRADED";
            const isAvailable = cap.status === "AVAILABLE";
            return (
              <Card key={cap.id} className="border-border/60 bg-card/60 flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold leading-tight">
                      {cap.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 font-medium ${isAvailable
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : isDegraded
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}
                    >
                      {cap.status}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-[10px] w-fit font-mono mt-1">
                    {cap.category}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3 text-xs pt-1">
                  <p className="text-muted-foreground leading-relaxed">
                    {cap.description}
                  </p>
                  <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                    <span className="font-semibold text-foreground">Dependencies: </span>
                    {(cap.dependencies || []).join(", ") || "Internal"}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 3: SOURCES */}
      {activeTab === "sources" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(resolvedIdentity.knowledgeSources || []).map((src: any, idx: number) => (
            <Card key={idx} className="border-border/60 bg-card/60">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold">
                    {src.title}
                  </CardTitle>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                    {src.authorityLevel}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {src.author}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p className="text-muted-foreground leading-relaxed">{src.description}</p>
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/30 space-y-1 text-[11px]">
                  <div><span className="font-semibold text-foreground">Coverage:</span> {src.coverage}</div>
                  <div><span className="font-semibold text-foreground">Policy:</span> {src.updatePolicy}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 4: DISCLOSURES */}
      {activeTab === "disclosures" && (
        <div className="space-y-4">
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-400" />
                Approved Disclosure Tiers
              </CardTitle>
              <CardDescription className="text-xs">
                Registry-grounded transparency explanations delivered to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 space-y-1.5">
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  TIER 1: BASIC (Identity & Mission)
                </Badge>
                <p className="text-muted-foreground leading-relaxed">
                  {record.disclosures_data?.BASIC || "Discloses QurAI Mentor name, companion role, and non-fatwa Islamic authority boundary."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 space-y-1.5">
                <Badge variant="outline" className="text-[10px] bg-teal-500/10 text-teal-400 border-teal-500/30">
                  TIER 2: PRODUCT (Feature Discovery)
                </Badge>
                <p className="text-muted-foreground leading-relaxed">
                  {record.disclosures_data?.PRODUCT || "Discloses live verified QurApp capabilities with authenticated deep links (Tilawah, Khatmah, Hifz, Majlis)."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 space-y-1.5">
                <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/30">
                  TIER 3: TECHNICAL (Architecture & Sources)
                </Badge>
                <p className="text-muted-foreground leading-relaxed">
                  {record.disclosures_data?.TECHNICAL || "Explains the 7-stage Evidence Intelligence Pipeline, citation validation, and canonical Islamic corpora."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 space-y-1.5">
                <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/30 flex items-center gap-1 w-fit">
                  <Lock className="h-3 w-3" />
                  TIER 4: INTERNAL_SENSITIVE (Hardcoded Protection)
                </Badge>
                <p className="text-muted-foreground leading-relaxed">
                  System prompts, developer instructions, credentials, and security algorithms are <strong>strictly REFUSED</strong> with deterministic security blocks. Cannot be modified or disabled by database records.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 5: RUNTIME HEALTH */}
      {activeTab === "runtime" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(runtimeHealth?.providers || {
            "quran-service": "HEALTHY",
            "knowledge-service": "HEALTHY",
            "postgres-governance": "HEALTHY",
            "llm-gateway": "HEALTHY",
          }).map(([provider, status]) => {
            const isHealthy = status === "HEALTHY";
            return (
              <Card key={provider} className="border-border/60 bg-card/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono text-muted-foreground">
                    {provider}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between pt-1">
                  <span className="text-sm font-semibold text-foreground">
                    {status}
                  </span>
                  {isHealthy ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 6: REVISIONS & AUDIT LOG */}
      {activeTab === "revisions" && (
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <History className="h-4 w-4 text-emerald-400" />
              Governance Revision Audit History
            </CardTitle>
            <CardDescription className="text-xs">
              Complete traceable change log with draft-review-active lifecycle
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground text-[11px]">
                    <th className="pb-2.5 font-medium">Revision</th>
                    <th className="pb-2.5 font-medium">Status</th>
                    <th className="pb-2.5 font-medium">Change Summary</th>
                    <th className="pb-2.5 font-medium">Author</th>
                    <th className="pb-2.5 font-medium">Created At</th>
                    <th className="pb-2.5 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {revisions.map((rev) => (
                    <tr key={rev.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 font-mono font-semibold">Rev {rev.revision}</td>
                      <td className="py-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${rev.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : rev.status === "DRAFT"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-muted text-muted-foreground"
                            }`}
                        >
                          {rev.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">{rev.change_summary}</td>
                      <td className="py-3 font-mono text-[11px]">{rev.created_by}</td>
                      <td className="py-3 text-muted-foreground text-[11px]">
                        {rev.created_at ? new Date(rev.created_at).toLocaleString() : "—"}
                      </td>
                      <td className="py-3 text-right">
                        {rev.status === "DRAFT" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            onClick={() => handleActivateRevision(rev.id)}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Activate
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DRAFT CREATION DIALOG */}
      <Dialog open={isDraftDialogOpen} onOpenChange={setIsDraftDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-400" />
              Create Governance Revision Draft
            </DialogTitle>
            <DialogDescription className="text-xs">
              Draft modifications will undergo validation before being activated live.
            </DialogDescription>
          </DialogHeader>

          {editingDraft && (
            <div className="space-y-4 text-xs py-2">
              <div>
                <Label>Change Summary</Label>
                <Input
                  value={draftSummary}
                  onChange={(e) => setDraftSummary(e.target.value)}
                  placeholder="e.g. Updated public description and refined habit coaching capabilities"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Display Name</Label>
                <Input
                  value={editingDraft.identity_data.name || ""}
                  onChange={(e) =>
                    setEditingDraft({
                      ...editingDraft,
                      identity_data: { ...editingDraft.identity_data, name: e.target.value },
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Role Definition</Label>
                <Input
                  value={editingDraft.identity_data.role || ""}
                  onChange={(e) =>
                    setEditingDraft({
                      ...editingDraft,
                      identity_data: { ...editingDraft.identity_data, role: e.target.value },
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Mission Statement</Label>
                <Textarea
                  value={editingDraft.identity_data.mission || ""}
                  onChange={(e) =>
                    setEditingDraft({
                      ...editingDraft,
                      identity_data: { ...editingDraft.identity_data, mission: e.target.value },
                    })
                  }
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Public Description</Label>
                <Textarea
                  value={editingDraft.identity_data.public_description || ""}
                  onChange={(e) =>
                    setEditingDraft({
                      ...editingDraft,
                      identity_data: { ...editingDraft.identity_data, public_description: e.target.value },
                    })
                  }
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsDraftDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveDraft} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              Save Draft Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
