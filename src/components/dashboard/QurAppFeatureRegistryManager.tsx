import React, { useState, useEffect } from "react";
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Smartphone,
  Globe,
  ExternalLink,
  Layers,
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth, apiGatewayUrl } from "@/lib/api";

export interface QurAppFeature {
  feature_id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  capabilities: string[];
  supported_intents: string[];
  deeplink: string;
  web_url: string;
  platforms: string[];
  is_active: boolean;
  requires_auth: boolean;
  requires_premium: boolean;
  minimum_app_version: string;
  priority: number;
  safety_class: string;
  metadata_version: string;
  created_at?: string;
  updated_at?: string;
}

const ALL_INTENTS = [
  "QURAN_INCONSISTENCY",
  "QURAN_TILAWAH",
  "QURAN_REFLECTION",
  "KHATMAH",
  "MEMORIZATION",
  "HIFZ_REVISION",
  "ISLAMIC_LEARNING",
  "HADITH_LEARNING",
  "TAFSIR_LEARNING",
  "DHIKR_CONSISTENCY",
  "WORSHIP_DISCIPLINE",
  "ACCOUNTABILITY",
  "DIGITAL_DISTRACTION",
  "TIME_MANAGEMENT",
  "COMMUNITY_SUPPORT",
  "MAJLIS_PARTICIPATION",
  "PERSONAL_GOAL_SETTING",
  "ROUTINE_BUILDING",
];

const CATEGORIES = ["QURAN", "HABIT", "LEARNING", "DUA", "COMMUNITY"];

export const QurAppFeatureRegistryManager: React.FC = () => {
  const { toast } = useToast();
  const [features, setFeatures] = useState<QurAppFeature[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Modal State
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [editingFeature, setEditingFeature] = useState<QurAppFeature | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Form State
  const [formFeatureId, setFormFeatureId] = useState<string>("");
  const [formSlug, setFormSlug] = useState<string>("");
  const [formTitle, setFormTitle] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [formCategory, setFormCategory] = useState<string>("QURAN");
  const [formDeeplink, setFormDeeplink] = useState<string>("qurapp://");
  const [formWebUrl, setFormWebUrl] = useState<string>("/products/qurapp");
  const [formCapabilities, setFormCapabilities] = useState<string>("");
  const [formSupportedIntents, setFormSupportedIntents] = useState<string[]>([]);
  const [formPlatforms, setFormPlatforms] = useState<string[]>(["ios", "android", "web"]);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formRequiresAuth, setFormRequiresAuth] = useState<boolean>(false);
  const [formRequiresPremium, setFormRequiresPremium] = useState<boolean>(false);
  const [formPriority, setFormPriority] = useState<number>(100);

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      let res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/mentor/admin/features?include_inactive=true`);
      if (!res.ok) {
        res = await fetchWithAuth(`${apiGatewayUrl}/v1/mentor/admin/features?include_inactive=true`);
      }
      if (res.ok) {
        const data = await res.json();
        setFeatures(data.features || []);
      }
    } catch (e: any) {
      toast({
        title: "Failed to load features",
        description: e.message || String(e),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const openCreateModal = () => {
    setEditingFeature(null);
    setFormFeatureId("");
    setFormSlug("");
    setFormTitle("");
    setFormDescription("");
    setFormCategory("QURAN");
    setFormDeeplink("qurapp://");
    setFormWebUrl("/products/qurapp");
    setFormCapabilities("");
    setFormSupportedIntents(["QURAN_INCONSISTENCY", "QURAN_TILAWAH"]);
    setFormPlatforms(["ios", "android", "web"]);
    setFormIsActive(true);
    setFormRequiresAuth(false);
    setFormRequiresPremium(false);
    setFormPriority(100);
    setDialogOpen(true);
  };

  const openEditModal = (feat: QurAppFeature) => {
    setEditingFeature(feat);
    setFormFeatureId(feat.feature_id);
    setFormSlug(feat.slug);
    setFormTitle(feat.title);
    setFormDescription(feat.description);
    setFormCategory(feat.category);
    setFormDeeplink(feat.deeplink);
    setFormWebUrl(feat.web_url);
    setFormCapabilities(feat.capabilities.join(", "));
    setFormSupportedIntents(feat.supported_intents || []);
    setFormPlatforms(feat.platforms || ["ios", "android", "web"]);
    setFormIsActive(feat.is_active);
    setFormRequiresAuth(feat.requires_auth);
    setFormRequiresPremium(feat.requires_premium);
    setFormPriority(feat.priority);
    setDialogOpen(true);
  };

  const handleSaveFeature = async () => {
    if (!formFeatureId.trim() || !formTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Feature ID and Title are required.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const payload: QurAppFeature = {
      feature_id: formFeatureId.trim(),
      slug: formSlug.trim() || formFeatureId.replace(".", "-"),
      title: formTitle.trim(),
      description: formDescription.trim(),
      category: formCategory,
      capabilities: formCapabilities
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      supported_intents: formSupportedIntents,
      deeplink: formDeeplink.trim(),
      web_url: formWebUrl.trim(),
      platforms: formPlatforms,
      is_active: formIsActive,
      requires_auth: formRequiresAuth,
      requires_premium: formRequiresPremium,
      minimum_app_version: "1.0.0",
      priority: formPriority,
      safety_class: "STANDARD",
      metadata_version: "v1.0",
    };

    try {
      const endpoint = editingFeature
        ? `${apiGatewayUrl}/api/v1/mentor/admin/features/${encodeURIComponent(formFeatureId)}`
        : `${apiGatewayUrl}/api/v1/mentor/admin/features`;

      const method = editingFeature ? "PUT" : "POST";

      let res = await fetchWithAuth(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const altEndpoint = editingFeature
          ? `${apiGatewayUrl}/v1/mentor/admin/features/${encodeURIComponent(formFeatureId)}`
          : `${apiGatewayUrl}/v1/mentor/admin/features`;
        res = await fetchWithAuth(altEndpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast({
          title: "Feature Saved",
          description: `Feature ${payload.title} (${payload.feature_id}) persisted in PostgreSQL.`,
        });
        setDialogOpen(false);
        fetchFeatures();
      } else {
        throw new Error("Server failed to save feature.");
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

  const handleDeleteFeature = async (featureId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete feature "${title}" (${featureId})?`)) return;

    try {
      let res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/mentor/admin/features/${encodeURIComponent(featureId)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        res = await fetchWithAuth(`${apiGatewayUrl}/v1/mentor/admin/features/${encodeURIComponent(featureId)}`, {
          method: "DELETE",
        });
      }

      if (res.ok) {
        toast({
          title: "Feature Deleted",
          description: `Removed ${title} from registry.`,
        });
        fetchFeatures();
      }
    } catch (e: any) {
      toast({
        title: "Delete Failed",
        description: e.message || String(e),
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (feat: QurAppFeature) => {
    const updated = { ...feat, is_active: !feat.is_active };
    try {
      await fetchWithAuth(`${apiGatewayUrl}/api/v1/mentor/admin/features/${encodeURIComponent(feat.feature_id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setFeatures((prev) => prev.map((f) => (f.feature_id === feat.feature_id ? updated : f)));
      toast({
        title: updated.is_active ? "Feature Activated" : "Feature Deactivated",
        description: `${feat.title} is now ${updated.is_active ? "active for AI recommendations" : "disabled"}.`,
      });
    } catch (e: any) {
      fetchFeatures();
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm("Re-seed default canonical QurApp features into PostgreSQL?")) return;
    try {
      let res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/mentor/admin/features/seed`, {
        method: "POST",
      });
      if (!res.ok) {
        res = await fetchWithAuth(`${apiGatewayUrl}/v1/mentor/admin/features/seed`, {
          method: "POST",
        });
      }
      if (res.ok) {
        toast({
          title: "Defaults Seeded",
          description: "Default QurApp features synced with PostgreSQL.",
        });
        fetchFeatures();
      }
    } catch (e: any) {
      toast({ title: "Seed Error", description: String(e), variant: "destructive" });
    }
  };

  const toggleIntent = (intent: string) => {
    setFormSupportedIntents((prev) =>
      prev.includes(intent) ? prev.filter((i) => i !== intent) : [...prev, intent]
    );
  };

  const togglePlatform = (plat: string) => {
    setFormPlatforms((prev) =>
      prev.includes(plat) ? prev.filter((p) => p !== plat) : [...prev, plat]
    );
  };

  const filteredFeatures = features.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.feature_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            QurApp Feature Registry & Action Catalog
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            PostgreSQL-backed canonical capability registry empowering QurAI to recommend real in-app actions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDefaults}
            className="text-xs gap-1.5 border-border/80 hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            Seed Defaults
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFeatures}
            disabled={loading}
            className="text-xs gap-1.5 border-border/80 hover:bg-muted"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={openCreateModal}
            className="text-xs gap-1.5 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            <Plus className="h-4 w-4" />
            Add Feature
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search features by ID, title, or capabilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Button
            variant={selectedCategory === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("ALL")}
            className="text-xs h-8 px-2.5"
          >
            All ({features.length})
          </Button>
          {CATEGORIES.map((cat) => {
            const count = features.filter((f) => f.category === cat).length;
            return (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="text-xs h-8 px-2.5"
              >
                {cat} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeatures.map((feat) => (
          <Card
            key={feat.feature_id}
            className={`border transition-all ${
              feat.is_active ? "border-border/80 bg-card hover:border-primary/40" : "border-border/40 bg-muted/20 opacity-70"
            }`}
          >
            <CardHeader className="pb-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 border-border/60">
                      {feat.category}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground">P:{feat.priority}</span>
                  </div>
                  <CardTitle className="text-sm font-semibold mt-1 text-foreground leading-snug">
                    {feat.title}
                  </CardTitle>
                </div>
                <Switch
                  checked={feat.is_active}
                  onCheckedChange={() => handleToggleActive(feat)}
                  title={feat.is_active ? "Active for AI recommendation" : "Inactive"}
                />
              </div>
              <CardDescription className="text-xs line-clamp-2 mt-1">
                {feat.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {/* Deep Link & Web URL */}
              <div className="p-2 rounded-lg bg-muted/40 border border-border/40 space-y-1 text-[11px] font-mono">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px]">Deep Link:</span>
                  <code className="text-primary font-semibold truncate max-w-[170px]">{feat.deeplink}</code>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px]">Web Fallback:</span>
                  <span className="truncate max-w-[170px]">{feat.web_url}</span>
                </div>
              </div>

              {/* Supported Intents */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                  Supported AI Intents ({feat.supported_intents?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1">
                  {(feat.supported_intents || []).slice(0, 3).map((intent) => (
                    <Badge key={intent} variant="secondary" className="text-[9px] py-0 px-1.5 font-sans">
                      {intent}
                    </Badge>
                  ))}
                  {(feat.supported_intents || []).length > 3 && (
                    <Badge variant="outline" className="text-[9px] py-0 px-1 text-muted-foreground">
                      +{feat.supported_intents.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Badges & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                <div className="flex items-center gap-1.5">
                  {feat.requires_auth && (
                    <Badge variant="outline" className="text-[9px] py-0 px-1 border-amber-500/40 text-amber-500">
                      Auth Req
                    </Badge>
                  )}
                  {feat.requires_premium && (
                    <Badge variant="outline" className="text-[9px] py-0 px-1 border-purple-500/40 text-purple-400">
                      Premium
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {feat.platforms?.join(", ") || "all"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(feat)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFeature(feat.feature_id, feat.title)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFeatures.length === 0 && !loading && (
        <div className="p-8 text-center bg-muted/20 border border-dashed border-border rounded-xl space-y-2">
          <Compass className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">No matching features found</h3>
          <p className="text-xs text-muted-foreground">
            Adjust your search filter or click "Add Feature" to register a new QurApp capability.
          </p>
        </div>
      )}

      {/* Feature Add / Edit Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              {editingFeature ? `Edit Feature: ${editingFeature.title}` : "Register New QurApp Feature"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Authoritative feature metadata persisted in PostgreSQL. QurAI will immediately use these capabilities for recommendations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* ID & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Canonical Feature ID *</Label>
                <Input
                  placeholder="e.g. quran.tilawah"
                  value={formFeatureId}
                  disabled={!!editingFeature}
                  onChange={(e) => setFormFeatureId(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Slug</Label>
                <Input
                  placeholder="e.g. quran-reader"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold">Feature Title *</Label>
                <Input
                  placeholder="e.g. Qur'an Recitation & Mushaf Reader"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                placeholder="Explain the capability of this feature and what problem it solves..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="text-xs h-20"
              />
            </div>

            {/* Deep Link & Web URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Deep Link (Mobile Protocol) *</Label>
                <Input
                  placeholder="e.g. qurapp://quran/reader"
                  value={formDeeplink}
                  onChange={(e) => setFormDeeplink(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Web URL Fallback *</Label>
                <Input
                  placeholder="e.g. /products/qurapp"
                  value={formWebUrl}
                  onChange={(e) => setFormWebUrl(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* Capabilities */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Capabilities (comma separated)</Label>
              <Input
                placeholder="e.g. mushaf_reading, audio_recitation, word_by_word"
                value={formCapabilities}
                onChange={(e) => setFormCapabilities(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Supported Intents Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Supported AI Mentoring Intents</Label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-lg bg-muted/40 border border-border/40">
                {ALL_INTENTS.map((intent) => {
                  const selected = formSupportedIntents.includes(intent);
                  return (
                    <button
                      key={intent}
                      type="button"
                      onClick={() => toggleIntent(intent)}
                      className={`text-[10px] py-1 px-2 rounded font-mono border transition-all flex items-center gap-1 ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-background text-muted-foreground border-border/60 hover:border-primary/40"
                      }`}
                    >
                      {selected && <Check className="h-3 w-3" />}
                      {intent}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platforms & Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-lg bg-muted/20 border border-border/40">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Supported Platforms</Label>
                <div className="flex items-center gap-2">
                  {["ios", "android", "web"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`text-xs uppercase px-2.5 py-1 rounded border font-semibold ${
                        formPlatforms.includes(p)
                          ? "bg-primary/20 text-primary border-primary/40"
                          : "bg-background text-muted-foreground border-border/60"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Recommendation Priority (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formPriority}
                  onChange={(e) => setFormPriority(parseInt(e.target.value) || 0)}
                  className="text-xs h-8 w-24"
                />
              </div>

              <div className="flex items-center justify-between sm:col-span-2 pt-2 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <Switch checked={formIsActive} onCheckedChange={setFormIsActive} id="active-switch" />
                  <Label htmlFor="active-switch" className="text-xs cursor-pointer">
                    Active & Available for AI Recommendations
                  </Label>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Switch checked={formRequiresAuth} onCheckedChange={setFormRequiresAuth} id="auth-switch" />
                    <Label htmlFor="auth-switch" className="text-xs cursor-pointer">
                      Requires Auth
                    </Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Switch checked={formRequiresPremium} onCheckedChange={setFormRequiresPremium} id="prem-switch" />
                    <Label htmlFor="prem-switch" className="text-xs cursor-pointer">
                      Premium
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={saving}
              onClick={handleSaveFeature}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {saving ? "Saving to PostgreSQL..." : "Save Feature"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
