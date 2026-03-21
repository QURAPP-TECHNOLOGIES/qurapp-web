import { useState } from "react";
import { Upload, BookOpen, Music, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const RIWAYAHS = [
    { id: 'qalun-naafia', name: 'Qalun (Nafi\')' },
    { id: 'warsh-naafia', name: 'Warsh (Nafi\')' },
    { id: 'bazzi-ibn-kathir', name: 'Al-Bazzi (Ibn Kathir)' },
    { id: 'qunbul-ibn-kathir', name: 'Qunbul (Ibn Kathir)' },
    { id: 'duri-abu-amr', name: 'Al-Duri / Al-Susi (Abu Amr)' },
    { id: 'hisham-ibn-amir', name: 'Hisham (Ibn Amir)' },
    { id: 'ibn-dhakwan-ibn-amir', name: 'Ibn Dhakwan (Ibn Amir)' },
    { id: 'hafs-aasim', name: 'Hafs (Aasim)' },
    { id: 'shuabah-aasim', name: 'Shu\'bah (Aasim)' },
    { id: 'khalaf-hamzah', name: 'Khalaf (Hamzah)' },
    { id: 'khallad-hamzah', name: 'Khallad (Hamzah)' },
    { id: 'duri-kisai', name: 'Al-Duri (Al-Kisa\'i)' },
    { id: 'layth-kisai', name: 'Al-Layth (Al-Kisa\'i)' },
    { id: 'ibn-wardan-abu-jaafar', name: 'Ibn Wardan (Abu Ja\'far)' },
    { id: 'ibn-jummaz-abu-jaafar', name: 'Ibn Jummaz (Abu Ja\'far)' },
    { id: 'ruwais-yaakub', name: 'Ruways (Ya\'qub)' },
    { id: 'rawh-ruwais', name: 'Rawh (Ya\'qub)' },
    { id: 'ishaq-khalaf', name: 'Ishaq (Khalaf)' },
    { id: 'idris-khalaf', name: 'Idris (Khalaf)' }
];

export function QuranAssetsUpload() {
    const [assetType, setAssetType] = useState<"mushaf" | "audio" | "other_audio">("mushaf");
    const [riwayah, setRiwayah] = useState("warsh-naafia");
    const [scholar, setScholar] = useState("");
    const [isShared, setIsShared] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { toast } = useToast();

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast({
                title: "No file selected",
                description: "Please select a `.zip` file to upload.",
                variant: "destructive",
            });
            return;
        }

        if ((assetType === "audio" || assetType === "other_audio") && !scholar.trim()) {
            toast({
                title: assetType === "audio" ? "Scholar name required" : "Folder name required",
                description: assetType === "audio" ? "Please provide a scholar name for audio assets." : "Please provide a folder name for other audio assets.",
                variant: "destructive",
            });
            return;
        }

        if (assetType !== "other_audio" && !riwayah.trim()) {
            toast({
                title: "Riwayah required",
                description: "Please select a riwayah.",
                variant: "destructive",
            });
            return;
        }

        const formattedScholar = scholar.trim().replace(/\s+/g, '_').toLowerCase();

        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("assetType", assetType);
        formData.append("riwayah", riwayah);
        if (formattedScholar) formData.append("scholar", formattedScholar);
        formData.append("isShared", isShared.toString());

        const apiGatewayUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
        const token = localStorage.getItem("token") || "";

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${apiGatewayUrl}/api/v1/files/quran-assets/upload`);

        if (token) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(percentComplete);
            }
        };

        xhr.onload = async () => {
            if (xhr.status === 401) {
                // Token might be expired, try to refresh
                const { refreshAuthToken } = await import('@/lib/api');
                const refreshed = await refreshAuthToken();
                if (refreshed) {
                    // Retry upload with new token
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
                    description: `Successfully uploaded ${data.uploadedCount} assets.`,
                });
                setFile(null);
                setUploadProgress(0);
            } else {
                let msg = "Upload failed";
                try {
                    const body = JSON.parse(completedXhr.responseText);
                    msg = body.message || body.error || msg;
                } catch (e) { }
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quran Assets</h2>
                    <p className="text-muted-foreground">Upload Mushaf pages, databases, and audio recitations.</p>
                </div>
            </div>

            <Card>
                <form onSubmit={handleUpload}>
                    <CardHeader>
                        <CardTitle>Upload Assets Zip File</CardTitle>
                        <CardDescription>
                            Provide a `.zip` file containing either `.png`/`.db` files for the Mushaf or `.mp3` files for audio.
                            Subdirectories inside the zip are processed appropriately based on asset type.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-4 flex-wrap">
                            <Button
                                type="button"
                                variant={assetType === "mushaf" ? "default" : "outline"}
                                className="flex-1 gap-2 min-w-[150px]"
                                onClick={() => setAssetType("mushaf")}
                            >
                                <BookOpen className="w-4 h-4" /> Mushaf (Pages & DB)
                            </Button>
                            <Button
                                type="button"
                                variant={assetType === "audio" ? "default" : "outline"}
                                className="flex-1 gap-2 min-w-[150px]"
                                onClick={() => setAssetType("audio")}
                            >
                                <Music className="w-4 h-4" /> Quran Audio
                            </Button>
                            <Button
                                type="button"
                                variant={assetType === "other_audio" ? "default" : "outline"}
                                className="flex-1 gap-2 min-w-[150px]"
                                onClick={() => {
                                    setAssetType("other_audio");
                                    setRiwayah("");
                                }}
                            >
                                <Music className="w-4 h-4" /> Other Audio (Tasbih, etc)
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {assetType !== "other_audio" && (
                                <div className="space-y-2">
                                    <Label htmlFor="riwayah">Riwayah</Label>
                                    <Select value={riwayah} onValueChange={setRiwayah}>
                                        <SelectTrigger className="max-w-md">
                                            <SelectValue placeholder="Select a Riwayah" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {RIWAYAHS.map((r) => (
                                                <SelectItem key={r.id} value={r.id}>
                                                    {r.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {(assetType === "audio" || assetType === "other_audio") && (
                                <div className="space-y-2">
                                    <Label htmlFor="scholar">{assetType === "audio" ? "Scholar / Reciter" : "Folder / Collection Name"}</Label>
                                    <Input
                                        id="scholar"
                                        placeholder={assetType === "audio" ? "e.g. Mahmoud Khalil Al Husary" : "e.g. morning_tasbih"}
                                        value={scholar}
                                        onChange={(e) => setScholar(e.target.value)}
                                        className="max-w-md"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Spaces will be automatically formatted to '_' before uploading.
                                    </p>
                                </div>
                            )}

                            {assetType === "mushaf" && (
                                <div className="flex flex-row items-center justify-between rounded-lg border p-4 max-w-md">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Contains Shared Databases</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Enable if 'quran.XX.db' should be uploaded to shared/databases instead.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={isShared}
                                        onCheckedChange={setIsShared}
                                    />
                                </div>
                            )}

                            <div className="space-y-2 pt-4">
                                <Label htmlFor="file">Zip File</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".zip,application/zip"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="max-w-md cursor-pointer"
                                />
                            </div>
                        </div>

                        {file && (
                            <div className="flex flex-col gap-2 mt-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md w-fit">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span>Selected: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                </div>
                                {isUploading && (
                                    <div className="max-w-md space-y-1">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Uploading...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <Progress value={uploadProgress} className="h-2" />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 p-4 rounded-md mt-4 border border-yellow-500/20">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>
                                <strong>Important:</strong> Large files (over 20MB) may take some time to upload and extract depending on your connection. Please do not close the window until the success message appears.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/30 p-6 flex justify-end">
                        <Button type="submit" disabled={isUploading || !file} className="min-w-[150px]">
                            {isUploading ? (
                                <>
                                    <Upload className="mr-2 h-4 w-4 animate-bounce" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Assets
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

