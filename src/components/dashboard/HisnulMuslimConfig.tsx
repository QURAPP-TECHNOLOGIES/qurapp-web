import { useState, useEffect, useCallback } from "react";
import { 
  Settings, Save, RefreshCw, Loader2, AlertCircle, CheckCircle2, 
  HelpCircle, ExternalLink, Info, Apple, Smartphone, Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type AppConfig = {
  latestVersion: string;
  minRequiredVersion: string;
  updateUrl: string;
  changelog: string;
  iosUrl: string;
  androidUrl: string;
  macUrl: string;
  windowsUrl: string;
  linuxUrl: string;
};

export function HisnulMuslimConfig() {
  const [config, setConfig] = useState<AppConfig>({
    latestVersion: "1.0.0",
    minRequiredVersion: "1.0.0",
    updateUrl: "",
    changelog: "",
    iosUrl: "",
    androidUrl: "",
    macUrl: "",
    windowsUrl: "",
    linuxUrl: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModified, setIsModified] = useState(false);

  const { toast } = useToast();
  const apiGatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiGatewayUrl}/api/v1/hisnul_muslim/config`);
      
      if (res.ok) {
        const data = await res.json();
        const d = data.downloads || {};
        setConfig({
          latestVersion: data.latestVersion || "1.0.0",
          minRequiredVersion: data.minRequiredVersion || "1.0.0",
          updateUrl: data.updateUrl || d.android || "",
          changelog: data.changelog || "",
          iosUrl: data.iosUrl || d.ios || "",
          androidUrl: data.androidUrl || data.updateUrl || d.android || "",
          macUrl: data.macUrl || d.mac || "",
          windowsUrl: data.windowsUrl || d.windows || "",
          linuxUrl: data.linuxUrl || d.linux || ""
        });
        setIsModified(false);
      } else {
        throw new Error("Failed to load config file from server");
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Load Config Failed",
        description: error?.message || String(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiGatewayUrl, toast]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleInputChange = (field: keyof AppConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setIsModified(true);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Validate semver strings
      const semverRegex = /^\d+\.\d+\.\d+(\+.*)?$/;
      if (!semverRegex.test(config.latestVersion.trim()) || !semverRegex.test(config.minRequiredVersion.trim())) {
        throw new Error("Version strings must follow semantic versioning format (e.g. 1.0.0)");
      }

      const { fetchWithAuth } = await import("@/lib/api");
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/hisnul_muslim/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latestVersion: config.latestVersion.trim(),
          minRequiredVersion: config.minRequiredVersion.trim(),
          updateUrl: config.androidUrl.trim() || config.updateUrl.trim(),
          changelog: config.changelog,
          iosUrl: config.iosUrl.trim(),
          androidUrl: config.androidUrl.trim(),
          macUrl: config.macUrl.trim(),
          windowsUrl: config.windowsUrl.trim(),
          linuxUrl: config.linuxUrl.trim(),
          downloads: {
            ios: config.iosUrl.trim(),
            android: config.androidUrl.trim(),
            mac: config.macUrl.trim(),
            windows: config.windowsUrl.trim(),
            linux: config.linuxUrl.trim(),
          }
        }),
      });

      if (res.ok) {
        toast({
          title: "Configuration Saved",
          description: "Multi-platform download links and version details updated.",
        });
        setIsModified(false);
      } else {
        const errorData = await res.json();
        throw new Error(errorData?.message || "Failed to update configuration");
      }
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error?.message || String(error),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm max-w-4xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Hisnul Muslim Settings & Release Links
        </CardTitle>
        <CardDescription>
          Manage active release links (iOS, Android, macOS, Windows, Linux) and version checks served via API Gateway.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSaveConfig}>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground text-sm">Fetching config settings...</p>
            </div>
          ) : (
            <>
              {/* Alert Info */}
              <Alert className="bg-primary/5 border-primary/20 text-primary">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle className="font-semibold font-display">Release & Multi-Platform Downloads</AlertTitle>
                <AlertDescription className="text-xs text-primary/80">
                  Update links entered here are served live to the main website and client apps checking for updates.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Latest Version */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    Latest Version
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" title="The most recent release version of the app." />
                  </label>
                  <Input
                    value={config.latestVersion}
                    onChange={(e) => handleInputChange("latestVersion", e.target.value)}
                    placeholder="e.g. 1.0.0"
                    disabled={isSaving}
                    required
                    className="bg-muted/30 border-border/50 focus:border-primary"
                  />
                </div>

                {/* Min Required Version */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    Minimum Required Version
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" title="Apps running on versions older than this will be forced to update." />
                  </label>
                  <Input
                    value={config.minRequiredVersion}
                    onChange={(e) => handleInputChange("minRequiredVersion", e.target.value)}
                    placeholder="e.g. 1.0.0"
                    disabled={isSaving}
                    required
                    className="bg-muted/30 border-border/50 focus:border-primary"
                  />
                </div>
              </div>

              {/* Platform Download Links Section */}
              <div className="space-y-4 pt-2 border-t border-border/40">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-primary" /> Multi-Platform Download Links
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* iOS App Store */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Apple className="w-3.5 h-3.5 text-foreground" /> iOS App Store URL
                    </label>
                    <Input
                      value={config.iosUrl}
                      onChange={(e) => handleInputChange("iosUrl", e.target.value)}
                      placeholder="https://apps.apple.com/app/hisnul-muslim/id..."
                      disabled={isSaving}
                      className="bg-muted/30 text-xs border-border/50"
                    />
                  </div>

                  {/* Android Google Play */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-500" /> Android Google Play URL
                    </label>
                    <Input
                      value={config.androidUrl}
                      onChange={(e) => handleInputChange("androidUrl", e.target.value)}
                      placeholder="https://play.google.com/store/apps/details?id=..."
                      disabled={isSaving}
                      className="bg-muted/30 text-xs border-border/50"
                    />
                  </div>

                  {/* macOS Download */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Apple className="w-3.5 h-3.5 text-blue-500" /> macOS (.dmg / App) URL
                    </label>
                    <Input
                      value={config.macUrl}
                      onChange={(e) => handleInputChange("macUrl", e.target.value)}
                      placeholder="https://github.com/QURAPP-TECHNOLOGIES/qurapp/releases/download/.../HisnulMuslim-macOS.dmg"
                      disabled={isSaving}
                      className="bg-muted/30 text-xs border-border/50"
                    />
                  </div>

                  {/* Windows Download */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Monitor className="w-3.5 h-3.5 text-cyan-500" /> Windows (.exe) URL
                    </label>
                    <Input
                      value={config.windowsUrl}
                      onChange={(e) => handleInputChange("windowsUrl", e.target.value)}
                      placeholder="https://github.com/QURAPP-TECHNOLOGIES/qurapp/releases/download/.../HisnulMuslim-Setup.exe"
                      disabled={isSaving}
                      className="bg-muted/30 text-xs border-border/50"
                    />
                  </div>
                </div>
              </div>

              {/* Changelog */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  Release Notes / Changelog
                </label>
                <Textarea
                  value={config.changelog}
                  onChange={(e) => handleInputChange("changelog", e.target.value)}
                  placeholder="Describe changes in the latest update..."
                  rows={3}
                  disabled={isSaving}
                  className="bg-muted/30 border-border/50 focus:border-primary text-xs"
                />
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t border-border/50 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadConfig}
            disabled={isLoading || isSaving}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={isLoading || isSaving || !isModified}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Configuration
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
