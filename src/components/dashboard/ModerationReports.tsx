import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Eye,
  Filter,
  User,
  Radio,
  FileText,
  MessageSquare,
  Camera,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { fetchWithAuth, apiGatewayUrl } from "@/lib/api";

interface Report {
  id: string;
  reporterId: string;
  targetType: "user" | "room" | "session" | "message";
  targetId: string;
  category: string;
  subcategory?: string;
  description?: string;
  evidenceUrls?: string[];
  metadata?: Record<string, any>;
  status: "pending" | "reviewed" | "actioned" | "dismissed";
  resolution?: string;
  resolvedBy?: string;
  priority: "low" | "normal" | "high" | "urgent";
  velocityAlert: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReportStats {
  total: number;
  pending: number;
  actioned: number;
  dismissed: number;
  reviewed: number;
  velocityAlerts: number;
  urgent: number;
}

export function ModerationReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats>({
    total: 0,
    pending: 0,
    actioned: 0,
    dismissed: 0,
    reviewed: 0,
    velocityAlerts: 0,
    urgent: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Action Dialog State
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionType, setActionType] = useState<"actioned" | "dismissed" | "reviewed">("actioned");
  const [resolutionNote, setResolutionNote] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/admin/reports/stats`);
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load moderation stats:", err);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (targetTypeFilter !== "all") params.append("targetType", targetTypeFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      if (searchQuery.trim()) params.append("q", searchQuery.trim());
      params.append("limit", "50");

      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/admin/reports?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error("Failed to fetch moderation reports:", err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, targetTypeFilter, priorityFilter, searchQuery]);

  useEffect(() => {
    fetchStats();
    fetchReports();
  }, [fetchStats, fetchReports]);

  const handleOpenActionModal = (report: Report, defaultAction: "actioned" | "dismissed" | "reviewed" = "actioned") => {
    setSelectedReport(report);
    setActionType(defaultAction);
    setResolutionNote(report.resolution || "");
    setActionError(null);
  };

  const handleResolveReport = async () => {
    if (!selectedReport) return;
    setIsSubmittingAction(true);
    setActionError(null);

    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/admin/reports/${selectedReport.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          resolution: resolutionNote.trim() || undefined,
        }),
      });

      if (res.ok) {
        setSelectedReport(null);
        setResolutionNote("");
        fetchReports();
        fetchStats();
      } else {
        const errData = await res.json().catch(() => ({}));
        setActionError(errData.message || "Failed to submit moderation decision.");
      }
    } catch (err: any) {
      setActionError(err.message || "Network error while saving moderation decision.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30 uppercase text-[10px] tracking-wider font-bold">Urgent</Badge>;
      case "high":
        return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 uppercase text-[10px] tracking-wider font-semibold">High</Badge>;
      case "normal":
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 text-[10px]">Normal</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground text-[10px]">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case "actioned":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Actioned
          </span>
        );
      case "dismissed":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">
            <XCircle className="w-3 h-3" /> Dismissed
          </span>
        );
      case "reviewed":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Eye className="w-3 h-3" /> Reviewed
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTargetTypeIcon = (targetType: string) => {
    switch (targetType) {
      case "user":
        return <User className="w-3.5 h-3.5 text-indigo-400" />;
      case "room":
      case "session":
        return <Radio className="w-3.5 h-3.5 text-emerald-400" />;
      case "message":
        return <MessageSquare className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Reports"
          value={stats.total.toLocaleString()}
          change={`${stats.pending} pending review`}
          changeType="neutral"
          icon={ShieldAlert}
          iconColor="text-indigo-500"
        />
        <StatsCard
          title="Pending Queue"
          value={stats.pending.toLocaleString()}
          change={stats.urgent > 0 ? `${stats.urgent} urgent priority` : "Queue healthy"}
          changeType={stats.pending > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          iconColor="text-amber-500"
        />
        <StatsCard
          title="Velocity Alerts"
          value={stats.velocityAlerts.toLocaleString()}
          change="Potential brigading detected"
          changeType={stats.velocityAlerts > 0 ? "negative" : "positive"}
          icon={Flame}
          iconColor="text-rose-500"
        />
        <StatsCard
          title="Actioned & Resolved"
          value={stats.actioned.toLocaleString()}
          change={`${stats.dismissed} dismissed`}
          changeType="positive"
          icon={CheckCircle2}
          iconColor="text-emerald-500"
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search reports by description, target ID, reporter ID, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-background/50"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-10 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="actioned">Actioned</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
              <SelectTrigger className="w-[130px] h-10 rounded-xl">
                <SelectValue placeholder="Target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Targets</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="room">Room / Majlis</SelectItem>
                <SelectItem value="session">Session</SelectItem>
                <SelectItem value="message">Message</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[125px] h-10 rounded-xl">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl"
              onClick={() => {
                fetchStats();
                fetchReports();
              }}
              title="Refresh Reports"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs font-semibold border-b border-border/50">
              <tr>
                <th className="px-6 py-4">Report Details</th>
                <th className="px-4 py-4">Target</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4">Priority</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Submitted</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500/50" />
                    No reports match the current filters.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex items-start gap-2">
                        {report.velocityAlert && (
                          <div
                            title="Velocity Alert: Multiple reports against this target recently!"
                            className="p-1 rounded-md bg-rose-500/10 text-rose-500 shrink-0 mt-0.5"
                          >
                            <Flame className="w-4 h-4 animate-pulse" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {report.description || "No description provided"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                            <span>Reporter: <span className="font-mono">{report.reporterId}</span></span>
                            {report.evidenceUrls && report.evidenceUrls.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium border border-primary/20">
                                <Camera className="w-2.5 h-2.5" />
                                {report.evidenceUrls.length} photo{report.evidenceUrls.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        {getTargetTypeIcon(report.targetType)}
                        <span className="capitalize text-xs font-medium text-foreground">
                          {report.targetType}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground truncate max-w-[120px]" title={report.targetId}>
                        {report.targetId}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <Badge variant="outline" className="font-normal capitalize text-xs">
                        {report.category.replace(/_/g, " ")}
                      </Badge>
                      {report.subcategory && (
                        <p className="text-[11px] text-muted-foreground capitalize mt-0.5">
                          {report.subcategory.replace(/_/g, " ")}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {getPriorityBadge(report.priority)}
                    </td>

                    <td className="px-4 py-4">
                      {getStatusBadge(report.status)}
                    </td>

                    <td className="px-4 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs font-medium hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleOpenActionModal(report, "actioned")}
                        >
                          Resolve
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution & Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              Report Resolution
            </DialogTitle>
            <DialogDescription>
              Review the report details and apply a moderation decision.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4 py-2 text-sm">
              {/* Report Information Summary */}
              <div className="bg-muted/40 rounded-xl p-3.5 space-y-2 border border-border/40">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Target Type / ID</span>
                  <span className="font-mono font-medium text-foreground">
                    {selectedReport.targetType}: {selectedReport.targetId}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium text-foreground capitalize">
                    {selectedReport.category.replace(/_/g, " ")} {selectedReport.subcategory ? `(${selectedReport.subcategory})` : ""}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Reporter ID</span>
                  <span className="font-mono text-muted-foreground">
                    {selectedReport.reporterId}
                  </span>
                </div>
                {selectedReport.velocityAlert && (
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                    <Flame className="w-4 h-4 shrink-0" />
                    <span>Multiple high-frequency reports flagged on this entity.</span>
                  </div>
                )}
                {selectedReport.description && (
                  <div className="pt-2 border-t border-border/30 text-xs">
                    <p className="text-muted-foreground mb-1 font-semibold">User Description:</p>
                    <p className="italic text-foreground bg-background/80 p-2 rounded-lg border border-border/30">
                      "{selectedReport.description}"
                    </p>
                  </div>
                )}
                {selectedReport.evidenceUrls && selectedReport.evidenceUrls.length > 0 && (
                  <div className="pt-2 border-t border-border/30 text-xs">
                    <p className="text-muted-foreground mb-2 font-semibold flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-primary" />
                      Visual Evidence ({selectedReport.evidenceUrls.length}):
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedReport.evidenceUrls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block aspect-square rounded-xl overflow-hidden border border-border/50 bg-background/50 hover:border-primary transition-all duration-200"
                        >
                          <img
                            src={url}
                            alt={`Evidence ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ExternalLink className="w-4 h-4 text-white" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Selection */}
              <div className="space-y-2">
                <Label htmlFor="action-type">Decision / Action</Label>
                <Select
                  value={actionType}
                  onValueChange={(val: any) => setActionType(val)}
                >
                  <SelectTrigger id="action-type" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actioned">
                      Actioned (Enforce penalty / Warn / Block)
                    </SelectItem>
                    <SelectItem value="dismissed">
                      Dismissed (No violation / False report)
                    </SelectItem>
                    <SelectItem value="reviewed">
                      Reviewed (Acknowledged without penalty)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Resolution Note */}
              <div className="space-y-2">
                <Label htmlFor="resolution-note">Resolution Note (Internal / Log)</Label>
                <Textarea
                  id="resolution-note"
                  placeholder="Explain the findings or actions taken (e.g., account suspended, content removed, warning sent)..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="rounded-xl min-h-[90px]"
                />
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  {actionError}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setSelectedReport(null)}
              disabled={isSubmittingAction}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolveReport}
              disabled={isSubmittingAction}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmittingAction ? "Applying..." : "Save Resolution"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
