import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, UserPlus, Award, AlertTriangle, MessageSquare, 
  BookOpen, X, Check, Settings, Volume2, VolumeX 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

interface Notification {
  id: string;
  type: "user" | "achievement" | "alert" | "message" | "content";
  title: string;
  description: string;
  time: string;
  read: boolean;
  urgent?: boolean;
}

const initialNotifications: Notification[] = [
  { id: "1", type: "user", title: "New user registered", description: "Maryam Ahmed joined QurApp", time: "Just now", read: false },
  { id: "2", type: "achievement", title: "Milestone reached", description: "10,000 lessons completed today!", time: "5 min ago", read: false, urgent: true },
  { id: "3", type: "alert", title: "Server load high", description: "CPU usage at 85%", time: "15 min ago", read: false, urgent: true },
  { id: "4", type: "message", title: "New feedback received", description: "User submitted app review", time: "30 min ago", read: true },
  { id: "5", type: "content", title: "Content updated", description: "Surah Al-Baqarah audio refreshed", time: "1 hour ago", read: true },
  { id: "6", type: "user", title: "User upgraded", description: "Hassan Malik upgraded to premium", time: "2 hours ago", read: true },
];

const liveEvents = [
  { type: "user", title: "New user registered", description: "Yusuf Khan joined QurApp" },
  { type: "achievement", title: "Achievement unlocked", description: "Sara completed 100 lessons" },
  { type: "message", title: "New message", description: "Support ticket #4521 received" },
  { type: "user", title: "User active", description: "Ahmed resumed learning session" },
];

const typeConfig = {
  user: { icon: UserPlus, color: "text-blue-500", bg: "bg-blue-500/10" },
  achievement: { icon: Award, color: "text-amber-500", bg: "bg-amber-500/10" },
  alert: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  message: { icon: MessageSquare, color: "text-green-500", bg: "bg-green-500/10" },
  content: { icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
};

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isExpanded, setIsExpanded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Simulate live notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomEvent = liveEvents[Math.floor(Math.random() * liveEvents.length)];
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: randomEvent.type as Notification["type"],
          title: randomEvent.title,
          description: randomEvent.description,
          time: "Just now",
          read: false,
        };
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border/50 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {unreadCount}
                </motion.span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <p className="text-xs text-muted-foreground">Real-time updates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sound alerts</span>
                  <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-2" /> Mark all as read
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[320px]">
        <div className="p-2">
          <AnimatePresence>
            {notifications.map((notification, index) => {
              const config = typeConfig[notification.type];
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className={`group relative p-3 rounded-xl mb-2 cursor-pointer transition-all ${
                    notification.read 
                      ? "hover:bg-muted/30" 
                      : "bg-muted/50 hover:bg-muted/70"
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${notification.read ? "text-muted-foreground" : "text-foreground"}`}>
                          {notification.title}
                        </p>
                        {notification.urgent && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {notification.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {notification.time}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {!notification.read && (
                    <motion.div
                      layoutId={`unread-${notification.id}`}
                      className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full"
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border/50">
        <Button 
          variant="ghost" 
          className="w-full text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          View all notifications
        </Button>
      </div>
    </motion.div>
  );
}
