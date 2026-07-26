import { useState, useEffect, useCallback } from "react";
import { 
  Settings, Save, RefreshCw, Loader2, AlertCircle, CheckCircle2, 
  HelpCircle, ExternalLink, Info
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
};

export function HisnulMuslimConfig() {
  const [config, setConfig] = useState<AppConfig>({
    latestVersion: "1.0.0",
    minRequiredVersion: "1.0.0",
    updateUrl: "",
    changelog: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModified, setIsModified] = useState(false);

  const { toast } = useToast();
  const apiGatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      // Config is public, but fetch from file-storage-service
      const res = await fetch(`${apiGatewayUrl}/api/v1/hisnul_muslim/config`);
      
      if (res.ok) {
        const data = await res.json();
        setConfig({
          latestVersion: data.latestVersion || "1.0.0",
          minRequiredVersion: data.minRequiredVersion || "1.0.0",
          updateUrl: data.updateUrl || "",
          changelog: data.changelog || ""
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

      if (!config.updateUrl.trim().startsWith("http://") && !config.updateUrl.trim().startsWith("https://")) {
        throw new Error("Update URL must be a valid http or https link");
      }

      const { fetchWithAuth } = await import("@/lib/api");
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/hisnul_muslim/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latestVersion: config.latestVersion.trim(),
          minRequiredVersion: config.minRequiredVersion.trim(),
          updateUrl: config.updateUrl.trim(),
          changelog: config.changelog
        }),
      });

      if (res.ok) {
        toast({
          title: "Configuration Saved",
          description: "Version details have been successfully written to S3 storage.",
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
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm max-w-3xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Hisnul Muslim App Settings & Version Checking
        </CardTitle>
        <CardDescription>
          Manage the active release details served to the Hisnul Muslim application. Changes are cached on S3 and immediately visible to client apps checking for updates.
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
                <AlertTitle className="font-semibold">Release Controls</AlertTitle>
                <AlertDescription className="text-xs text-primary/80">
                  Changing **Minimum Required Version** will trigger a force update prompt on older client apps, blocking usage until upgraded. Changing **Latest Version** will trigger a non-blocking update suggestion dialog.
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
                    placeholder="e.g. 1.1.0"
                    disabled={isSaving}
                    required
                    className="bg-muted/30 border-border/50 focus:border-primary"
                  />
                  <p className="text-[11px] text-muted-foreground">Formats: `1.0.0` or `1.1.0+4`</p>
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
                  <p className="text-[11px] text-muted-foreground">Must be less than or equal to Latest Version</p>
                </div>
              </div>

              {/* Update Url */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  Update Store URL
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" title="The URL clients will open when clicking the update button." />
                </label>
                <div className="relative">
                  <Input
                    value={config.updateUrl}
                    onChange={(e) => handleInputChange("updateUrl", e.target.value)}
                    placeholder="e.g. https://play.google.com/store/apps/details?id=..."
                    disabled={isSaving}
                    required
                    className="pr-10 bg-muted/30 border-border/50 focus:border-primary"
                  />
                  {config.updateUrl && (
                    <a 
                      href={config.updateUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">App Store or Google Play Store listing URL.</p>
              </div>

              {/* Changelog */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Update Changelog (Release Notes)
                </label>
                <Textarea
                  value={config.changelog}
                  onChange={(e) => handleInputChange("changelog", e.target.value)}
                  placeholder="• Added new features&#10;• Fixed translation errors"
                  rows={5}
                  disabled={isSaving}
                  className="bg-muted/30 border-border/50 focus:border-primary font-mono text-sm leading-relaxed"
                />
                <p className="text-[11px] text-muted-foreground">Use list bullet characters (•) to format change points clearly.</p>
              </div>
            </>
          )}
        </CardContent>
        
        {!isLoading && (
          <CardFooter className="flex justify-between border-t border-border/50 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={loadConfig}
              disabled={isLoading || isSaving}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset Form
            </Button>

            <Button
              type="submit"
              disabled={isSaving || !isModified}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Writing Details...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Release Config
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
