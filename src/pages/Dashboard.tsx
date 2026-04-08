import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, BookOpen, MessageSquare, Trophy,
  Bell, Search, Settings, Menu,
  Calendar, Download, Filter, Mail, Send, Database, Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UserGrowthChart } from "@/components/dashboard/UserGrowthChart";
import { EngagementChart } from "@/components/dashboard/EngagementChart";
import { LanguageDistributionChart } from "@/components/dashboard/LanguageDistributionChart";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { TopContentTable } from "@/components/dashboard/TopContentTable";
import { UserManagement } from "@/components/dashboard/UserManagement";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { EmailManagement } from "@/components/dashboard/EmailManagement";
import { NotificationManagement } from "@/components/dashboard/NotificationManagement";
import { QuranAssetsUpload } from "@/components/dashboard/QuranAssetsUpload";
import { QuranAssetsList } from "@/components/dashboard/QuranAssetsList";
import { GalleryUpload } from "@/components/dashboard/GalleryUpload";
import { GalleryList } from "@/components/dashboard/GalleryList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSEO } from "@/hooks/useSEO";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useSEO({
    title: "Admin Dashboard",
    description: "QurApp admin dashboard for managing users, content, and platform analytics.",
    url: "/dashboard",
    noindex: true,
  });

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { fetchWithAuth, apiGatewayUrl, handleAuthFailure } = await import('@/lib/api');
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        // Attempt to notify server of logout
        await fetchWithAuth(`${apiGatewayUrl}/api/v1/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      }
      handleAuthFailure(); // Clears localStorage and redirects to /auth
    } catch (e) {
      console.error("Logout error", e);
      // Fallback clear if network error
      localStorage.clear();
      navigate('/auth');
    }
  };

  const stats = [
    { title: "Total Users", value: "18,240", change: "+12.5% from last month", changeType: "positive" as const, icon: Users },
    { title: "Active Learners", value: "12,450", change: "+8.2% from last month", changeType: "positive" as const, icon: BookOpen },
    { title: "AI Sessions", value: "45.2K", change: "+24.1% from last month", changeType: "positive" as const, icon: MessageSquare },
    { title: "Achievements", value: "8,920", change: "+15.3% from last month", changeType: "positive" as const, icon: Trophy },
  ];

  const navItems = [
    { label: "Dashboard", icon: Menu, id: "dashboard" },
    { label: "Quran Assets", icon: Database, id: "quran-assets" },
    { label: "Islamic Gallery", icon: Image, id: "gallery" },
    { label: "Users", icon: Users, id: "users" },
    { label: "Emails", icon: Mail, id: "emails" },
    { label: "Notifications", icon: Send, id: "notifications" },
    { label: "Content", icon: BookOpen, id: "content" },
    { label: "Analytics", icon: Trophy, id: "analytics" },
    { label: "Settings", icon: Settings, id: "settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: sidebarOpen ? 240 : 80 }}
        animate={{ width: sidebarOpen ? 240 : 80 }}
        className="bg-card border-r border-border/50 flex flex-col py-6 transition-all duration-300"
      >
        <div className="px-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-lg text-foreground"
              >
                QurApp
              </motion.span>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all ${activeTab === item.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium">
                  {item.label}
                </motion.span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
            {sidebarOpen && <span className="text-sm">Collapse</span>}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card/50 backdrop-blur-sm border-b border-border/50 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 w-64 bg-muted/50 border-border/50 focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Last 30 days
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>

            <div className="h-6 w-px bg-border mx-2" />

            <ThemeToggle />

            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-sm">AD</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">Admin</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500" onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6 bg-background">
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <StatsCard {...stat} />
                  </motion.div>
                ))}
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <UserGrowthChart />
                <EngagementChart />
              </div>

              {/* Charts Row 2 & Notifications */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <RecentActivityTable />
                <div className="space-y-6">
                  <NotificationsPanel />
                </div>
              </div>

              {/* Additional Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <LanguageDistributionChart />
                <TopContentTable />
              </div>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <UserManagement />
            </motion.div>
          )}

          {activeTab === "emails" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <EmailManagement />
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <NotificationManagement />
            </motion.div>
          )}

          {activeTab === "content" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 text-muted-foreground"
            >
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Content Management</h2>
              <p>Content management features coming soon</p>
            </motion.div>
          )}

          {activeTab === "gallery" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
                  <TabsTrigger value="list">Manage Photos</TabsTrigger>
                  <TabsTrigger value="upload">Upload New Photo</TabsTrigger>
                </TabsList>
                <TabsContent value="list" className="mt-0">
                  <GalleryList />
                </TabsContent>
                <TabsContent value="upload" className="mt-0">
                  <GalleryUpload />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {activeTab === "quran-assets" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
                  <TabsTrigger value="list">Manage Assets</TabsTrigger>
                  <TabsTrigger value="upload">Upload New Asset</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-0">
                  <QuranAssetsList />
                </TabsContent>

                <TabsContent value="upload" className="mt-0">
                  <QuranAssetsUpload />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 text-muted-foreground"
            >
              <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Advanced Analytics</h2>
              <p>Advanced analytics features coming soon</p>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 text-muted-foreground"
            >
              <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Settings</h2>
              <p>Settings panel coming soon</p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
