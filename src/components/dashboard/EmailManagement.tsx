import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Search,
  Filter,
  Eye,
  Reply,
  Archive,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  X,
  Send,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Inquiry = Database["public"]["Tables"]["inquiries"]["Row"];
type InquiryReply = Database["public"]["Tables"]["inquiry_replies"]["Row"];
type InquiryStatus = Database["public"]["Enums"]["inquiry_status"];
type InquiryType = Database["public"]["Enums"]["inquiry_type"];

const statusConfig: Record<InquiryStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  new: { label: "New", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: AlertCircle },
  read: { label: "Read", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Eye },
  replied: { label: "Replied", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: Reply },
  resolved: { label: "Resolved", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  archived: { label: "Archived", color: "bg-muted text-muted-foreground border-border", icon: Archive },
};

const typeConfig: Record<InquiryType, { label: string; color: string }> = {
  general: { label: "General", color: "bg-primary/20 text-primary border-primary/30" },
  complaint: { label: "Complaint", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  feedback: { label: "Feedback", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  support: { label: "Support", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  other: { label: "Other", color: "bg-muted text-muted-foreground border-border" },
};

export function EmailManagement() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<InquiryType | "all">("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replies, setReplies] = useState<InquiryReply[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter, typeFilter]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (typeFilter !== "all") {
        query = query.eq("type", typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (inquiryId: string) => {
    try {
      const { data, error } = await supabase
        .from("inquiry_replies")
        .select("*")
        .eq("inquiry_id", inquiryId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  const handleViewInquiry = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsViewOpen(true);
    await fetchReplies(inquiry.id);

    // Mark as read if it's new
    if (inquiry.status === "new") {
      await updateInquiryStatus(inquiry.id, "read");
    }
  };

  const updateInquiryStatus = async (id: string, status: InquiryStatus) => {
    try {
      const { error } = await supabase
        .from("inquiries")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
      );

      if (selectedInquiry?.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleSendReply = async () => {
    if (!selectedInquiry || !replyMessage.trim()) return;

    setIsReplying(true);
    try {
      const { error } = await supabase.from("inquiry_replies").insert({
        inquiry_id: selectedInquiry.id,
        reply_message: replyMessage.trim(),
        replied_by: "Admin",
      });

      if (error) throw error;

      // Update inquiry status to replied
      await updateInquiryStatus(selectedInquiry.id, "replied");

      toast.success("Reply sent successfully");
      setReplyMessage("");
      await fetchReplies(selectedInquiry.id);
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply");
    } finally {
      setIsReplying(false);
    }
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Email Management</h2>
          <p className="text-muted-foreground">View and respond to user inquiries and complaints</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Mail className="h-3 w-3" />
            {inquiries.filter((i) => i.status === "new").length} new
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InquiryStatus | "all")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as InquiryType | "all")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(typeConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Inquiries List */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
            Loading inquiries...
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No inquiries found</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredInquiries.map((inquiry, index) => {
              const StatusIcon = statusConfig[inquiry.status].icon;
              return (
                <motion.div
                  key={inquiry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 hover:bg-muted/30 transition-colors cursor-pointer ${
                    inquiry.status === "new" ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleViewInquiry(inquiry)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground truncate">
                          {inquiry.name}
                        </span>
                        <Badge variant="outline" className={`text-xs ${typeConfig[inquiry.type].color}`}>
                          {typeConfig[inquiry.type].label}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${statusConfig[inquiry.status].color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[inquiry.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">
                        {inquiry.subject}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {inquiry.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{inquiry.email}</span>
                        <span>{formatDate(inquiry.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewInquiry(inquiry);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateInquiryStatus(inquiry.id, "resolved")}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateInquiryStatus(inquiry.id, "archived")}>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* View & Reply Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedInquiry?.subject}
            </DialogTitle>
          </DialogHeader>

          {selectedInquiry && (
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Original Message */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{selectedInquiry.name}</span>
                    <Badge variant="outline" className={`text-xs ${typeConfig[selectedInquiry.type].color}`}>
                      {typeConfig[selectedInquiry.type].label}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(selectedInquiry.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{selectedInquiry.email}</p>
                <p className="text-foreground whitespace-pre-wrap">{selectedInquiry.message}</p>
              </div>

              {/* Replies */}
              {replies.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Replies</h4>
                  {replies.map((reply) => (
                    <div key={reply.id} className="bg-primary/10 rounded-lg p-4 ml-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground">
                          {reply.replied_by || "Admin"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(reply.created_at)}
                        </span>
                      </div>
                      <p className="text-foreground whitespace-pre-wrap">{reply.reply_message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              <div className="space-y-3 pt-4 border-t border-border">
                <Textarea
                  placeholder="Type your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedInquiry.status}
                      onValueChange={(v) => updateInquiryStatus(selectedInquiry.id, v as InquiryStatus)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim() || isReplying}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isReplying ? "Sending..." : "Send Reply"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
