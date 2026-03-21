import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Users,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];
type NotificationChannel = Database["public"]["Enums"]["notification_channel"];
type NotificationStatus = Database["public"]["Enums"]["notification_status"];

const channelConfig: Record<NotificationChannel, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  in_app: { label: "In-App", icon: Bell },
  push: { label: "Push", icon: Smartphone },
  email: { label: "Email", icon: Mail },
  sms: { label: "SMS", icon: MessageSquare },
};

const statusConfig: Record<NotificationStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground border-border" },
  scheduled: { label: "Scheduled", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  sending: { label: "Sending", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  sent: { label: "Sent", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  failed: { label: "Failed", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export function NotificationManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | "all">("all");

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"all" | "specific">("all");
  const [selectedChannels, setSelectedChannels] = useState<NotificationChannel[]>(["in_app"]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [statusFilter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleChannelToggle = (channel: NotificationChannel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const handleCreateNotification = async (status: NotificationStatus) => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in title and message");
      return;
    }

    if (selectedChannels.length === 0) {
      toast.error("Please select at least one channel");
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.from("notifications").insert({
        title: title.trim(),
        message: message.trim(),
        target_type: targetType,
        channels: selectedChannels,
        status,
        sent_at: status === "sent" ? new Date().toISOString() : null,
      });

      if (error) throw error;

      toast.success(status === "sent" ? "Notification sent!" : "Draft saved");
      resetForm();
      setIsCreateOpen(false);
      fetchNotifications();
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("Failed to create notification");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Notification deleted");
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setTargetType("all");
    setSelectedChannels(["in_app"]);
  };

  const filteredNotifications = notifications.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h2 className="text-2xl font-bold text-foreground">Notification Management</h2>
          <p className="text-muted-foreground">Send and manage notifications across all channels</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Notification title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Write your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select value={targetType} onValueChange={(v) => setTargetType(v as "all" | "specific")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        All Users
                      </div>
                    </SelectItem>
                    <SelectItem value="specific">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Specific Users
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Channels</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(channelConfig) as [NotificationChannel, typeof channelConfig[NotificationChannel]][]).map(
                    ([channel, { label, icon: Icon }]) => (
                      <div
                        key={channel}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedChannels.includes(channel)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleChannelToggle(channel)}
                      >
                        <Checkbox checked={selectedChannels.includes(channel)} />
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{label}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleCreateNotification("draft")}
                  disabled={isSending}
                >
                  Save as Draft
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={() => handleCreateNotification("sent")}
                  disabled={isSending}
                >
                  <Send className="h-4 w-4" />
                  Send Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as NotificationStatus | "all")}>
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
      </div>

      {/* Notifications List */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground truncate">
                        {notification.title}
                      </span>
                      <Badge variant="outline" className={`text-xs ${statusConfig[notification.status].color}`}>
                        {statusConfig[notification.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {notification.channels.map((channel) => {
                        const ChannelIcon = channelConfig[channel].icon;
                        return (
                          <Badge key={channel} variant="secondary" className="gap-1 text-xs">
                            <ChannelIcon className="h-3 w-3" />
                            {channelConfig[channel].label}
                          </Badge>
                        );
                      })}
                      <span className="text-xs text-muted-foreground">
                        • {formatDate(notification.created_at)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteNotification(notification.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
