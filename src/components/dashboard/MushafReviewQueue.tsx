import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Loader2,
  AlertTriangle,
  FileCode2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpenCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface MushafTask {
  id: string;
  slug: string;
  riwayah: string;
  name: string;
  source_type: string;
  status: string;
  resolution: string;
  r2_staging_prefix: string;
  r2_production_prefix?: string | null;
  total_pages: number;
  info_pages_count: number;
  verified_pages_count: number;
  verified_pages: number[];
  anomalous_pages: number[];
  validation_summary: {
    total_glyphs?: number;
    total_surahs_detected?: number;
    inverted_boxes_count?: number;
    missing_pages_count?: number;
  };
  submitted_by?: string | null;
  reviewer_notes?: string | null;
  updated_at: string;
}

interface GlyphBox {
  glyph_id: number;
  page_number: number;
  line_number: number;
  sura_number: number;
  ayah_number: number;
  position: number;
  min_x: number;
  max_x: number;
  min_y: number;
  max_y: number;
}

interface MarkerData {
  marker_id: string;
  sura_number: number;
  ayah_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  ocr_ayah?: number | null;
  ocr_status?: string | null;
}

interface PagePreviewData {
  page_number: number;
  width: number;
  height: number;
  image_url: string;
  glyphs: GlyphBox[];
  markers?: MarkerData[];
  ocr_report?: {
    page_number: number;
    total_markers: number;
    verified_markers: number;
    mismatched_markers: number;
    results: any[];
  } | null;
}

export function MushafReviewQueue() {
  const [tasks, setTasks] = useState<MushafTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("IN_REVIEW");
  const [processingSlug, setProcessingSlug] = useState<string | null>(null);
  const [riwayahOverrides, setRiwayahOverrides] = useState<Record<string, string>>({});
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  // Spot-check preview modal state
  const [previewTask, setPreviewTask] = useState<MushafTask | null>(null);
  const [previewPage, setPreviewPage] = useState<number>(1);
  const [previewData, setPreviewData] = useState<PagePreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [baseServiceUrl, setBaseServiceUrl] = useState<string>("");
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [pageOcrReport, setPageOcrReport] = useState<{
    verified_markers: number;
    mismatched_markers: number;
    total_markers: number;
    results: any[];
  } | null>(null);

  const { toast } = useToast();

  const resolveEndpoint = async () => {
    const { apiGatewayUrl } = await import("@/lib/api");
    // In local dev, allow falling back to localhost:3012 if gateway doesn't proxy yet
    const customUrl = localStorage.getItem("mushafProcessorUrl");
    if (customUrl) return customUrl;
    return `${apiGatewayUrl}/api/v1/mushaf-processor`;
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const { fetchWithAuth } = await import("@/lib/api");
      const endpoint = await resolveEndpoint();
      setBaseServiceUrl(endpoint);

      let res: Response;
      try {
        res = await fetchWithAuth(`${endpoint}/tasks`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch {
        // Fallback to local mushaf-processor-service on port 3012 during local development
        const localEndpoint = "http://localhost:3012/api/v1/mushaf-processor";
        setBaseServiceUrl(localEndpoint);
        res = await fetch(`${localEndpoint}/tasks`);
      }

      if (!res.ok) throw new Error("Failed to load Mushaf processor tasks");
      const data: MushafTask[] = await res.json();
      setTasks(data);

      // Default to ALL if no tasks are currently IN_REVIEW
      if (
        statusFilter === "IN_REVIEW" &&
        !data.some((t) => t.status === "IN_REVIEW")
      ) {
        setStatusFilter("ALL");
      }
    } catch (err: any) {
      toast({
        title: "Could not load Mushaf Review Queue",
        description: err.message || "Ensure mushaf-processor-service is running.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const loadPreviewPage = async (task: MushafTask, pageNum: number) => {
    setPreviewTask(task);
    setPreviewPage(pageNum);
    setPreviewLoading(true);
    setPageOcrReport(null);
    try {
      const res = await fetch(`${baseServiceUrl}/tasks/${task.slug}/pages/${pageNum}?verify_ocr=true`);
      if (!res.ok) throw new Error(`Failed to load page ${pageNum}`);
      const data = await res.json();
      setPreviewData(data);
      if (data.ocr_report) {
        setPageOcrReport(data.ocr_report);
      }
    } catch (err: any) {
      toast({
        title: "Preview failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const runPageOcr = async () => {
    if (!previewTask) return;
    setOcrLoading(true);
    try {
      const res = await fetch(`${baseServiceUrl}/tasks/${previewTask.slug}/pages/${previewPage}/ocr`);
      if (!res.ok) throw new Error("OCR verification request failed");
      const report = await res.json();
      setPageOcrReport(report);
      toast({
        title: "OCR Verification Complete",
        description: `${report.verified_markers}/${report.total_markers} markers verified on Page ${previewPage}.`,
      });
    } catch (err: any) {
      toast({
        title: "OCR Check Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setOcrLoading(false);
    }
  };

  const handleApproveAndFinalize = async (task: MushafTask) => {
    setProcessingSlug(task.slug);
    try {
      const targetRiwayah = (riwayahOverrides[task.slug] || task.riwayah).trim();
      const notes =
        adminNotes[task.slug] ||
        "Approved and finalized to production R2 for QurApp client.";

      const res = await fetch(`${baseServiceUrl}/tasks/${task.slug}/admin/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_riwayah: targetRiwayah,
          reviewer_notes: notes,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(errBody || "Approval failed");
      }

      const result = await res.json();
      const prod = result.production_r2 || {};
      toast({
        title: "Mushaf Approved & Finalized to R2!",
        description: `Copied ${prod.page_count || 604} pages & database to riwayahs/${targetRiwayah}/ and registered in Quran Assets.`,
      });
      fetchTasks();
    } catch (err: any) {
      toast({
        title: "Finalization Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setProcessingSlug(null);
    }
  };

  const handleReject = async (task: MushafTask) => {
    setProcessingSlug(task.slug);
    try {
      const notes =
        adminNotes[task.slug] || "Changes requested during Admin verification.";
      const res = await fetch(`${baseServiceUrl}/tasks/${task.slug}/admin/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewer_notes: notes,
        }),
      });

      if (!res.ok) throw new Error("Failed to reject task");
      toast({
        title: "Returned for Changes",
        description: `${task.name} has been marked REJECTED with feedback.`,
      });
      fetchTasks();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setProcessingSlug(null);
    }
  };

  const handleAutoRepair = async (task: MushafTask) => {
    setProcessingSlug(task.slug);
    try {
      const res = await fetch(
        `${baseServiceUrl}/tasks/${task.slug}/repair-coordinates`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Auto-repair failed");
      const data = await res.json();
      const fixed = data.repair_report?.fixed_inverted_boxes ?? 0;
      toast({
        title: "Coordinates Auto-Repaired",
        description: `Fixed ${fixed} inverted bounding boxes and rebuilt Pages 1–3 for ${task.slug}.`,
      });
      fetchTasks();
    } catch (err: any) {
      toast({
        title: "Repair Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setProcessingSlug(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === "ALL") return true;
    return t.status === statusFilter;
  });

  const inReviewCount = tasks.filter((t) => t.status === "IN_REVIEW").length;
  const approvedCount = tasks.filter((t) => t.status === "APPROVED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-primary" />
            Mushaf Verification & R2 Finalization Queue
          </h2>
          <p className="text-muted-foreground text-sm">
            Review verified Mushafs from qurapp-tools, spot-check verse coordinates, and finalize approved packages into production R2 storage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={statusFilter === "IN_REVIEW" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("IN_REVIEW")}
          >
            In Review ({inReviewCount})
          </Button>
          <Button
            variant={statusFilter === "APPROVED" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("APPROVED")}
          >
            Approved ({approvedCount})
          </Button>
          <Button
            variant={statusFilter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("ALL")}
          >
            All Staging ({tasks.length})
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchTasks}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {previewTask && (
        <Card className="border-primary/40 shadow-lg">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Spot-Check Coordinate Preview: {previewTask.name} (Page {previewPage}/604)
              </CardTitle>
              <CardDescription>
                Inspecting live SQLite glyph bounding boxes over the sanitized Mushaf page.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={previewPage <= 1 || previewLoading}
                onClick={() => loadPreviewPage(previewTask, previewPage - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPreviewPage(previewTask, 1)}
              >
                P.1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPreviewPage(previewTask, 2)}
              >
                P.2
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPreviewPage(previewTask, 3)}
              >
                P.3
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={previewPage >= 604 || previewLoading}
                onClick={() => loadPreviewPage(previewTask, previewPage + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPreviewTask(null);
                  setPreviewData(null);
                }}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {previewLoading || !previewData ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex justify-center bg-muted/30 p-4 rounded-lg overflow-auto">
                <div
                  className="relative bg-[#FFFDF8] shadow-md border"
                  style={{ width: 420, height: 629 }}
                >
                  <img
                    src={`${baseServiceUrl.replace(/\/api(\/v1\/mushaf-processor)?$/, "")}${previewData.image_url}`}
                    alt={`Page ${previewPage}`}
                    className="w-full h-full object-fill"
                  />
                  <svg
                    viewBox={`0 0 ${previewData.width} ${previewData.height}`}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  >
                    {previewData.glyphs.map((g) => {
                      const x = Math.min(g.min_x, g.max_x);
                      const w = Math.max(4, Math.abs(g.max_x - g.min_x));
                      const y = Math.min(g.min_y, g.max_y);
                      const h = Math.max(4, Math.abs(g.max_y - g.min_y));
                      const isBad = g.min_x >= g.max_x;
                      return (
                        <rect
                          key={g.glyph_id}
                          x={x}
                          y={y}
                          width={w}
                          height={h}
                          fill={
                            isBad
                              ? "rgba(239, 68, 68, 0.35)"
                              : "rgba(16, 185, 129, 0.18)"
                          }
                          stroke={isBad ? "#ef4444" : "#10b981"}
                          strokeWidth={2}
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Mushaf Tasks ({filteredTasks.length})</CardTitle>
          <CardDescription>
            Once approved, pages and databases are copied to{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
              riwayahs/&#123;riwayah&#125;/pages/&#123;resolution&#125;/
            </code>{" "}
            and{" "}
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
              riwayahs/&#123;riwayah&#125;/databases/
            </code>{" "}
            in production R2.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
              <p>Loading Mushaf tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              <p>No Mushaf tasks in this filter state.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const isBusy = processingSlug === task.slug;
                const surahsCount =
                  task.validation_summary?.total_surahs_detected ?? 0;
                const invertedCount =
                  task.validation_summary?.inverted_boxes_count ?? 0;

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-base">
                            {task.name}
                          </span>
                          <Badge
                            variant={
                              task.status === "APPROVED"
                                ? "default"
                                : task.status === "IN_REVIEW"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {task.status}
                          </Badge>
                          <Badge variant="outline" className="font-mono text-xs">
                            {task.source_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          Staging: {task.r2_staging_prefix} • Res: {task.resolution}
                          {task.r2_production_prefix
                            ? ` • Production: ${task.r2_production_prefix}`
                            : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          Verified: {task.verified_pages_count}/{task.total_pages}
                        </Badge>
                        {task.source_type !== "UNPROCESSED" && (
                          <>
                            <Badge
                              variant={surahsCount >= 114 ? "secondary" : "destructive"}
                              className="text-xs"
                            >
                              Surahs: {surahsCount}/114
                            </Badge>
                            <Badge
                              variant={
                                task.anomalous_pages.length === 0
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              Anomalous Pages: {task.anomalous_pages.length} ({invertedCount} inverted)
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>

                    {(task.submitted_by || task.reviewer_notes) && (
                      <div className="text-xs bg-muted/50 p-2.5 rounded-lg border">
                        {task.submitted_by && (
                          <span className="font-semibold mr-2">
                            Submitted by {task.submitted_by}:
                          </span>
                        )}
                        <span>{task.reviewer_notes}</span>
                      </div>
                    )}

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          Production Riwayah Key:
                        </span>
                        <Input
                          value={riwayahOverrides[task.slug] ?? task.riwayah}
                          onChange={(e) =>
                            setRiwayahOverrides((prev) => ({
                              ...prev,
                              [task.slug]: e.target.value,
                            }))
                          }
                          className="h-8 w-36 text-xs font-mono"
                          placeholder="e.g. bazzi"
                        />
                        <Input
                          value={adminNotes[task.slug] ?? ""}
                          onChange={(e) =>
                            setAdminNotes((prev) => ({
                              ...prev,
                              [task.slug]: e.target.value,
                            }))
                          }
                          className="h-8 w-56 text-xs"
                          placeholder="Reviewer notes (optional)..."
                        />
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadPreviewPage(task, 1)}
                        >
                          <Eye className="w-4 h-4 mr-1.5" />
                          Spot-Check Pages
                        </Button>

                        {task.anomalous_pages.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => handleAutoRepair(task)}
                          >
                            <Sparkles className="w-4 h-4 mr-1.5 text-amber-500" />
                            Auto-Repair
                          </Button>
                        )}

                        {task.status !== "APPROVED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive/40 hover:bg-destructive/10"
                            disabled={isBusy}
                            onClick={() => handleReject(task)}
                          >
                            <XCircle className="w-4 h-4 mr-1.5" />
                            Request Changes
                          </Button>
                        )}

                        <Button
                          size="sm"
                          disabled={isBusy}
                          onClick={() => handleApproveAndFinalize(task)}
                        >
                          {isBusy ? (
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          )}
                          Approve & Finalize to R2
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spot-Check Preview Modal */}
      <Dialog
        open={!!previewTask}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewTask(null);
            setPreviewData(null);
            setPageOcrReport(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-4">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
            <div>
              <DialogTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Spot-Check: {previewTask?.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Page {previewPage} of {previewTask?.total_pages || 604} | {previewTask?.riwayah}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={previewPage <= 1 || previewLoading}
                onClick={() => previewTask && loadPreviewPage(previewTask, previewPage - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs font-mono font-medium px-1">
                {previewPage} / {previewTask?.total_pages || 604}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={
                  previewPage >= (previewTask?.total_pages || 604) ||
                  previewLoading
                }
                onClick={() => previewTask && loadPreviewPage(previewTask, previewPage + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                variant={
                  pageOcrReport?.mismatched_markers
                    ? "destructive"
                    : "secondary"
                }
                className="h-8 text-xs ml-2"
                disabled={ocrLoading || previewLoading}
                onClick={runPageOcr}
              >
                {ocrLoading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <BookOpenCheck className="w-3.5 h-3.5 mr-1.5" />
                )}
                OCR Ayah Check
              </Button>

              {pageOcrReport && (
                <Badge
                  variant={
                    pageOcrReport.mismatched_markers === 0
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-xs font-mono"
                >
                  {pageOcrReport.mismatched_markers === 0
                    ? `✓ ${pageOcrReport.verified_markers}/${pageOcrReport.total_markers} Verified`
                    : `⚠️ ${pageOcrReport.mismatched_markers} Mismatch`}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {/* Page Image & Overlays */}
          <div className="relative border rounded-lg overflow-auto flex-1 min-h-[400px] max-h-[65vh] flex justify-center bg-muted/20 p-2">
            {previewLoading ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">
                  Loading Page {previewPage}...
                </p>
              </div>
            ) : previewData ? (
              <div className="relative inline-block max-h-full">
                <img
                  src={
                    previewData.image_url.startsWith("http")
                      ? previewData.image_url
                      : `${baseServiceUrl.replace(/\/api\/v1\/mushaf-processor\/?$/, "")}${previewData.image_url}`
                  }
                  alt={`Page ${previewPage}`}
                  className="max-h-[62vh] w-auto object-contain select-none shadow-md rounded"
                />
                {/* SVG Overlay for verse markers & OCR status */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox={`0 0 ${previewData.width} ${previewData.height}`}
                >
                  {(pageOcrReport?.results || previewData.markers || []).map(
                    (m: any, idx: number) => {
                      const isVerified =
                        m.ocr_status === "VERIFIED" ||
                        (m.expected_ayah != null &&
                          m.ocr_ayah != null &&
                          m.expected_ayah === m.ocr_ayah);
                      const isMismatch = m.ocr_status === "MISMATCH";
                      const strokeColor = isMismatch
                        ? "#ef4444"
                        : isVerified
                        ? "#22c55e"
                        : "#3b82f6";
                      const fillColor = isMismatch
                        ? "rgba(239, 68, 68, 0.25)"
                        : isVerified
                        ? "rgba(34, 197, 94, 0.25)"
                        : "rgba(59, 130, 246, 0.2)";

                      const mw = m.width || 40;
                      const mh = m.height || 40;
                      const cx = m.x + mw / 2;
                      const cy = m.y + mh / 2;
                      const r = Math.max(mw, mh) / 2;

                      return (
                        <g
                          key={m.marker_id || idx}
                          className="pointer-events-auto cursor-pointer"
                        >
                          <title>{`Marker: Sura ${m.sura_number || "?"}, Ayah ${m.expected_ayah ?? m.ayah_number ?? "?"} | OCR: ${m.ocr_ayah ?? "N/A"} (${m.ocr_status || "UNVERIFIED"})`}</title>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={r}
                            stroke={strokeColor}
                            strokeWidth="4"
                            fill={fillColor}
                          />
                          <text
                            x={cx}
                            y={cy + 6}
                            textAnchor="middle"
                            fill={strokeColor}
                            fontSize="20"
                            fontWeight="bold"
                          >
                            {m.ocr_ayah ?? m.expected_ayah ?? m.ayah_number ?? ""}
                          </text>
                        </g>
                      );
                    }
                  )}
                </svg>
              </div>
            ) : null}
          </div>

          {/* OCR Mismatch details if present */}
          {pageOcrReport && pageOcrReport.mismatched_markers > 0 && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-xs text-destructive mt-2">
              <div className="font-semibold flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-4 h-4" />
                OCR Ayah Numeral Mismatch Detected:
              </div>
              <div className="flex flex-wrap gap-2">
                {pageOcrReport.results
                  .filter((r: any) => r.ocr_status === "MISMATCH")
                  .map((r: any, i: number) => (
                    <span
                      key={i}
                      className="bg-background/80 px-2 py-0.5 rounded border border-destructive/20 font-mono"
                    >
                      Sura {r.sura_number}: Expected Ayah {r.expected_ayah} vs OCR read {r.ocr_ayah}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
