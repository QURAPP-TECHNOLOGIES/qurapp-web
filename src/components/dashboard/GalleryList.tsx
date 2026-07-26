import { useState, useEffect } from "react";
import { Trash2, Image as ImageIcon, Loader2, RefreshCw, Filter, ExternalLink, Copy, Check } from "lucide-react";
import {
  Card,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { apiGatewayUrl, fetchWithAuth } from "@/lib/api";

type GalleryImage = {
  id: string;
  filename: string;
  category: string;
  title: string;
  url: string;
  thumbnailUrl: string;
};

const CATEGORIES = [
  'All',
  'Ramadan',
  'Jumma',
  'Hajj',
  'Eid Al-Adha',
  'Reflections',
  'Blank',
];

export function GalleryList({ isGallery = true }: { isGallery?: boolean }) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const pageSize = 12;
  const { toast } = useToast();

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "URL Copied",
      description: "Asset URL copied to clipboard.",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const url = new URL(`${apiGatewayUrl}/api/v1/gallery`);
      url.searchParams.append("limit", pageSize.toString());
      url.searchParams.append("offset", offset.toString());
      url.searchParams.append("isGallery", isGallery.toString());
      
      if (category !== "All") {
        url.searchParams.append("category", category);
      }

      const res = await fetchWithAuth(url.toString());
      if (!res.ok) throw new Error("Failed to fetch gallery images");

      const data = await res.json();
      const results = Array.isArray(data) ? data : (data.images || []);
      const count = typeof data.total === 'number' ? data.total : results.length;

      // Map API response to our local model
      const mappedImages = results.map((item: any) => ({
        id: item.id,
        filename: item.filename,
        category: item.meta?.gallery_category || 'General',
        title: item.meta?.title || item.filename,
        url: item.links?.cdnUrl || `${apiGatewayUrl}/v/${item.id}/img`,
        thumbnailUrl: item.links?.cdnUrl || `${apiGatewayUrl}/v/${item.id}/img`,
      }));

      setImages(mappedImages);
      setTotal(count);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error fetching photos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // Reset to first page when category changes
  }, [category]);

  useEffect(() => {
    fetchImages();
  }, [category, page, isGallery]);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const res = await fetchWithAuth(`${apiGatewayUrl}/api/v1/gallery/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete photo");
      }

      toast({ title: "Photo Deleted", description: "The image has been removed from the gallery." });
      // If we delete the last item on a page (other than the first), go back a page
      if (images.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      } else {
        fetchImages(); // Refresh current page to fill empty slot
      }
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

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isGallery ? "Manage Photos" : "Manage Asset Images"}
          </h2>
          <p className="text-muted-foreground">
            {isGallery 
              ? "View, filter, and manage Islamic Gallery photos."
              : "View, copy, and manage internal system assets."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px] bg-card/50 border-border/50">
              <Filter className="w-4 h-4 mr-2 opacity-50" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => fetchImages()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary opacity-50" />
          <p className="text-sm font-medium">Loading gallery images...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/50">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-10" />
          <p className="font-medium">No photos found in this category.</p>
          <p className="text-xs mt-1">Upload some photos to get started.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden group border-border/50 bg-card hover:border-primary/30 transition-all flex flex-col">
                <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                  <img
                    src={image.thumbnailUrl || image.url}
                    alt={image.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <Button variant="secondary" size="sm" className="h-8 w-28 gap-1.5" asChild>
                      <a href={image.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" /> View Full
                      </a>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-28 gap-1.5"
                      onClick={() => copyToClipboard(image.url, image.id)}
                    >
                      {copiedId === image.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-500 animate-pulse" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy URL
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          disabled={isDeleting === image.id}
                        >
                          {isDeleting === image.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this photo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove "{image.title}" from the Islamic Gallery. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(image.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Photo
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-black/60 text-white border-none backdrop-blur-sm text-[10px] py-0 px-2 h-5">
                      {image.category}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-4 space-y-1">
                  <CardTitle className="text-sm font-bold truncate" title={image.title}>
                    {image.title}
                  </CardTitle>
                  <CardDescription className="text-[10px] truncate opacity-60">
                    {image.filename}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 py-4 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1 mx-4">
                <span className="text-sm font-medium">Page {page} of {totalPages}</span>
                <span className="text-xs text-muted-foreground ml-2">({total} total photos)</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
