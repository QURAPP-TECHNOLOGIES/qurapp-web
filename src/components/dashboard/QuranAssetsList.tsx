import { useState, useEffect } from "react";
import { Trash2, File, Database, Music, Loader2, RefreshCw } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type AssetGroup = {
    type: 'mushaf_pages' | 'mushaf_database' | 'audio' | 'shared_database' | 'other_audio';
    riwayah?: string;
    scholar?: string;
    prefix: string;
    resolutions?: string[];
    files?: string[];
    fileCount?: number;
    file_count?: number;
};

export function QuranAssetsList() {
    const [assets, setAssets] = useState<AssetGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchAssets = async () => {
        setIsLoading(true);
        try {
            const { fetchWithAuth, apiGatewayUrl } = await import('@/lib/api');

            const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/files/quran-assets`);

            if (!res.ok) throw new Error("Failed to fetch assets");

            const data = await res.json();
            setAssets(data.assets || []);
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error fetching assets",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const handleDelete = async (prefix: string) => {
        setIsDeleting(prefix);
        try {
            const { fetchWithAuth, apiGatewayUrl } = await import('@/lib/api');

            const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/files/quran-assets`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prefix }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || data.error || "Failed to delete");
            }

            toast({ title: "Asset Deleted", description: "The asset group has been removed." });
            fetchAssets(); // Refresh list
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Delete Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsDeleting(null);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'mushaf_pages': return <File className="w-5 h-5 text-blue-500" />;
            case 'mushaf_database':
            case 'shared_database': return <Database className="w-5 h-5 text-amber-500" />;
            case 'audio': return <Music className="w-5 h-5 text-green-500" />;
            case 'other_audio': return <Music className="w-5 h-5 text-indigo-500" />;
            default: return <File className="w-5 h-5 text-gray-500" />;
        }
    };

    const getLabel = (asset: AssetGroup) => {
        if (asset.type === 'shared_database') return 'Shared Database';
        if (asset.type === 'mushaf_database') return 'Riwayah Database';
        if (asset.type === 'mushaf_pages') return 'Mushaf Pages';
        if (asset.type === 'audio') return 'Audio Recitation';
        if (asset.type === 'other_audio') return 'Other Audio';
        return asset.type;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Manage Assets</h2>
                    <p className="text-muted-foreground">View and delete uploaded Quran assets from the server.</p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchAssets} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Uploaded Packages</CardTitle>
                    <CardDescription>
                        A list of all directories currently available on the storage server.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                            <p>Discovering assets...</p>
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                            <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No uploaded assets found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {assets.map((asset, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-full bg-background border shadow-sm">
                                            {getIcon(asset.type)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold">{getLabel(asset)}</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    {asset.riwayah || (asset.type === 'other_audio' ? 'Other' : 'Shared')}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:gap-4 sm:items-center">
                                                <span className="font-mono text-xs truncate max-w-[200px] sm:max-w-xs" title={asset.prefix}>
                                                    {asset.prefix}
                                                </span>
                                                {asset.scholar && (
                                                    <span className="flex items-center gap-1">
                                                        • {asset.type === 'other_audio' ? 'Collection' : 'Scholar'}: <strong className="text-foreground">{asset.scholar}</strong>
                                                    </span>
                                                )}
                                                {asset.resolutions && (
                                                    <span className="flex items-center gap-1">
                                                        • Res: {asset.resolutions.join(', ')}
                                                    </span>
                                                )}
                                                {asset.files ? (
                                                    <span className="flex items-center gap-1">
                                                        • {asset.files.length} file(s)
                                                    </span>
                                                ) : (asset.file_count ?? asset.fileCount) !== undefined && (
                                                    <span className="flex items-center gap-1">
                                                        • {asset.file_count ?? asset.fileCount} file(s)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8 shrink-0"
                                                disabled={isDeleting === asset.prefix}
                                            >
                                                {isDeleting === asset.prefix ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete the asset group at <strong>{asset.prefix}</strong> and remove all its files from the storage server. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(asset.prefix)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
