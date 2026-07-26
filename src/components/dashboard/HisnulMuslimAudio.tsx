import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Music, Upload, Play, Pause, Search, CheckCircle2, 
  AlertCircle, Loader2, Volume2, RefreshCw, ChevronDown, ChevronUp, FileAudio 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Dua = {
  id: number;
  counter_num: number;
  counter: Record<string, string>;
  arabic: string;
  audio?: string;
  translations: Record<string, string>;
  hint: Record<string, string>;
  transliteration?: string;
};

type Category = {
  id: number;
  title: Record<string, string>;
  duas: Dua[];
};

export function HisnulMuslimAudio() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "uploaded" | "missing">("all");
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  
  // Audio playing state
  const [playingDuaId, setPlayingDuaId] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { toast } = useToast();

  const apiGatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Load Local Dataset JSON dynamically from src/data
      const datasetModule = await import("@/data/hisnul_muslim.json");
      const dataset: Category[] = datasetModule.default as Category[];
      setCategories(dataset);

      // 2. Fetch Uploaded Files List from backend
      const { fetchWithAuth } = await import("@/lib/api");
      const filesRes = await fetchWithAuth(
        `${apiGatewayUrl}/api/v1/files/assets/other_audio/hisnul_muslim`
      );
      
      if (filesRes.ok) {
        const filesData = await filesRes.json();
        // Backend returns: { files: [{ name: "1.mp3", ... }, ...] }
        const filenames = (filesData.files || []).map((f: { name: string }) => f.name).filter(Boolean);
        setUploadedFiles(filenames);
      } else {
        console.warn("Failed to retrieve uploaded files list from server");
      }
    } catch (error: unknown) {
      console.error(error);
      toast({
        title: "Load Error",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiGatewayUrl, toast]);

  useEffect(() => {
    loadData();
    // Cleanup audio player on unmount
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, [loadData]);

  // Helper to extract filename from URL or get standard filename based on id
  const getAudioFileName = (dua: Dua): string => {
    if (dua.audio) {
      // Extract basename (e.g. 75.mp3)
      return dua.audio.split("/").pop() || `${dua.id}.mp3`;
    }
    return `${dua.id}.mp3`;
  };

  const isAudioUploaded = (dua: Dua): boolean => {
    const filename = getAudioFileName(dua);
    return uploadedFiles.includes(filename);
  };

  // Get totals
  const totalDuas = categories.reduce((sum, cat) => sum + cat.duas.length, 0);
  const uploadedCount = categories.reduce((sum, cat) => {
    return sum + cat.duas.filter(isAudioUploaded).length;
  }, 0);
  const completionRate = totalDuas > 0 ? Math.round((uploadedCount / totalDuas) * 100) : 0;

  const toggleCategory = (catId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const playAudio = async (dua: Dua) => {
    const filename = getAudioFileName(dua);
    const url = `${apiGatewayUrl}/api/v1/files/assets/other_audio/hisnul_muslim/stream/${filename}`;

    if (playingDuaId === dua.id) {
      // Pause
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingDuaId(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    // Revoke previous blob URL if exists
    if (audioUrl && audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    setPlayingDuaId(dua.id);

    let currentBlobUrl = "";
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      currentBlobUrl = URL.createObjectURL(blob);
      setAudioUrl(currentBlobUrl);

      const player = new Audio(currentBlobUrl);
      audioPlayerRef.current = player;
      
      player.onended = () => {
        setPlayingDuaId(null);
        URL.revokeObjectURL(currentBlobUrl);
        setAudioUrl(null);
      };

      await player.play();
    } catch (err: unknown) {
      console.error("Playback error:", err);
      toast({
        title: "Playback Error",
        description: "Failed to play audio stream. Check your authentication or connection.",
        variant: "destructive",
      });
      setPlayingDuaId(null);
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        setAudioUrl(null);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a `.zip` file of MP3s to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("assetType", "other_audio");
    formData.append("scholar", "hisnul_muslim");

    const token = localStorage.getItem("token") || "";

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${apiGatewayUrl}/api/v1/files/quran-assets/upload`);

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = async () => {
      if (xhr.status === 401) {
        const { refreshAuthToken } = await import("@/lib/api");
        const refreshed = await refreshAuthToken();
        if (refreshed) {
          const newToken = localStorage.getItem("token") || "";
          const retryXhr = new XMLHttpRequest();
          retryXhr.open("POST", `${apiGatewayUrl}/api/v1/files/quran-assets/upload`);
          retryXhr.setRequestHeader("Authorization", `Bearer ${newToken}`);
          retryXhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              setUploadProgress(Math.round((event.loaded / event.total) * 100));
            }
          };
          retryXhr.onload = () => handleXhrResponse(retryXhr);
          retryXhr.onerror = handleXhrError;
          retryXhr.send(formData);
          return;
        }
      }
      handleXhrResponse(xhr);
    };

    const handleXhrResponse = (completedXhr: XMLHttpRequest) => {
      setIsUploading(false);
      if (completedXhr.status >= 200 && completedXhr.status < 300) {
        const data = JSON.parse(completedXhr.responseText);
        toast({
          title: "Upload Successful",
          description: `Successfully uploaded ${data.uploadedCount} audio files to Hisnul Muslim.`,
        });
        setFile(null);
        setUploadProgress(0);
        loadData(); // Refresh counts
      } else {
        let msg = "Upload failed";
        try {
          const body = JSON.parse(completedXhr.responseText);
          msg = body.message || body.error || msg;
        } catch (e) {
          console.error(e);
        }
        toast({
          title: "Upload Error",
          description: msg,
          variant: "destructive",
        });
        setUploadProgress(0);
      }
    };

    const handleXhrError = () => {
      setIsUploading(false);
      toast({
        title: "Upload Error",
        description: "Network error occurred during upload.",
        variant: "destructive",
      });
      setUploadProgress(0);
    };

    xhr.onerror = handleXhrError;
    xhr.send(formData);
  };

  // Search and filter logic
  const filteredCategories = categories.map(cat => {
    // Check if category matches search
    const matchesSearch = 
      cat.title.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.title.ar.includes(searchQuery);

    const filteredDuas = cat.duas.filter(dua => {
      const isUploaded = isAudioUploaded(dua);
      
      // Filter type check
      if (filterType === "uploaded" && !isUploaded) return false;
      if (filterType === "missing" && isUploaded) return false;

      // Search match inside category (if category matches, include all, otherwise check dua text)
      if (matchesSearch) return true;
      return (
        dua.translations.en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dua.arabic?.includes(searchQuery)
      );
    });

    return {
      ...cat,
      duas: filteredDuas,
      matchesSearch
    };
  }).filter(cat => cat.duas.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hisnul Muslim Audio</h2>
          <p className="text-muted-foreground">Manage and play audio files for Hisnul Muslim supplications.</p>
        </div>
        <Button variant="outline" size="icon" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Uploaded Audios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{uploadedCount}</span>
              <span className="text-sm text-muted-foreground">/ {totalDuas} supplications</span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Coverage</span>
                <span>{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Missing Audios</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-[84px]">
            <span className="text-3xl font-bold text-red-500">{totalDuas - uploadedCount}</span>
            <p className="text-xs text-muted-foreground">Supplications without pretty-URL host audio files.</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Collection Base Pretty-URL</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-[84px]">
            <span className="font-mono text-xs text-primary truncate" title={`${apiGatewayUrl}/api/v1/assets/other_audio/hisnul_muslim/stream/`}>
              .../assets/other_audio/hisnul_muslim/stream/{"{id}"}.mp3
            </span>
            <p className="text-xs text-muted-foreground">Stream destination used by frontend apps.</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Box */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" /> Upload Audio Package (.zip)
          </CardTitle>
          <CardDescription>
            Upload a `.zip` file containing audio recordings named after the supplication ID (e.g. <code>1.mp3</code>, <code>2.mp3</code>... up to <code>295.mp3</code>).
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpload}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                id="zip-file"
                type="file"
                accept=".zip,application/zip"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="max-w-md cursor-pointer"
                disabled={isUploading}
              />
            </div>

            {file && (
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2.5 rounded-md w-fit">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Selected: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                {isUploading && (
                  <div className="max-w-md space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Uploading audio bundle...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 p-3.5 rounded-md border border-yellow-500/20 max-w-2xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-xs">
                Files must be placed directly in the zip root (not inside a nested folder) and follow numerical names matching the supplication IDs.
              </p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 px-6 py-4 flex justify-end border-t">
            <Button type="submit" disabled={isUploading || !file} className="min-w-[150px]">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Upload Bundle
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Categories & Duas Browser */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Supplications Browser</CardTitle>
              <CardDescription>Browse through Categories and play uploaded audio files.</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search supplications..."
                  className="pl-9 w-60 bg-muted/30 focus:bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {/* Filter */}
              <div className="flex bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filterType === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("uploaded")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filterType === "uploaded" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  Uploaded
                </button>
                <button
                  onClick={() => setFilterType("missing")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filterType === "missing" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  Missing
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p>Loading database...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
              <Music className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No categories or supplications match the filter/query.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategories.map((cat) => {
                const isExpanded = expandedCategories[cat.id] || searchQuery.length > 0;
                
                // Count uploaded inside this category
                const catUploaded = cat.duas.filter(isAudioUploaded).length;
                const catTotal = cat.duas.length;

                return (
                  <div key={cat.id} className="border rounded-lg overflow-hidden bg-card transition-all">
                    {/* Header */}
                    <div 
                      onClick={() => toggleCategory(cat.id)}
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors select-none"
                    >
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-5 h-5 text-primary opacity-60" />
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base">{cat.title.en}</h3>
                          <p className="text-xs text-muted-foreground font-mono">{cat.title.ar}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={catUploaded === catTotal ? "default" : "secondary"} className="text-xs">
                          {catUploaded} / {catTotal} audios
                        </Badge>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>

                    {/* Duas List */}
                    {isExpanded && (
                      <div className="border-t bg-muted/10 divide-y">
                        {cat.duas.map((dua) => {
                          const isUploaded = isAudioUploaded(dua);
                          const isPlaying = playingDuaId === dua.id;
                          const filename = getAudioFileName(dua);

                          return (
                            <div key={dua.id} className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-muted/30 transition-colors">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs font-mono">ID: {dua.id}</Badge>
                                  <Badge 
                                    variant={isUploaded ? "outline" : "destructive"} 
                                    className={`text-xs ${isUploaded ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400" : ""}`}
                                  >
                                    {isUploaded ? "Audio Available" : "Audio Missing"}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground font-mono">File: {filename}</span>
                                </div>
                                
                                <p className="text-right text-base font-arabic leading-loose text-foreground" dir="rtl">
                                  {dua.arabic}
                                </p>
                                {dua.transliteration && (
                                  <p className="text-xs text-primary font-medium italic leading-relaxed">
                                    {dua.transliteration}
                                  </p>
                                )}
                                <p className="text-sm text-muted-foreground italic leading-relaxed">
                                  "{dua.translations.en}"
                                </p>
                              </div>

                              <div className="flex items-center self-end sm:self-start">
                                {isUploaded ? (
                                  <Button 
                                    variant={isPlaying ? "default" : "outline"} 
                                    size="sm" 
                                    className="gap-2"
                                    onClick={() => playAudio(dua)}
                                  >
                                    {isPlaying ? (
                                      <>
                                        <Pause className="w-4 h-4 animate-pulse" /> Stop
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-4 h-4" /> Listen
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium px-3 py-1.5 bg-red-500/10 rounded-md border border-red-500/20">
                                    <FileAudio className="w-3.5 h-3.5" />
                                    <span>Unavailable</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
