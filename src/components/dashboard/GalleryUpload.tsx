import { useState, useCallback } from "react";
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle2, Loader2, X, Plus, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  CardFooter,
} from "@/components/ui/card";
import { apiGatewayUrl, fetchWithAuth } from "@/lib/api";
import { Slider } from "@/components/ui/slider";

const CATEGORIES = [
  'Ramadan',
  'Jumma',
  'Hajj',
  'Eid Al-Adha',
  'Reflections',
  'Blank',
];

interface UploadItem {
  id: string;
  file: File;
  title: string;
  preview: string | null;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  isGallery?: boolean;
  uploadedUrl?: string;
}

export function GalleryUpload(): JSX.Element {
  const [category, setCategory] = useState("Ramadan");
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [watermarkPosition, setWatermarkPosition] = useState<string>("bottom-left");
  const [watermarkColor, setWatermarkColor] = useState<string>("#3A2517");
  const [brandingScale, setBrandingScale] = useState<number>(1.0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const formatFileNameToTitle = (filename: string): string => {
    // Remove extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    // Replace - and _ with spaces
    const withSpaces = nameWithoutExt.replace(/[-_]/g, " ");
    // Capitalize each word
    return withSpaces
      .split(" ")
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const processFiles = useCallback((files: FileList | File[]) => {
    const newItems: UploadItem[] = Array.from(files).map((file) => {
      const id = Math.random().toString(36).substring(7);
      const title = formatFileNameToTitle(file.name);

      return {
        id,
        file,
        title,
        preview: null, // Will be filled below
        status: 'pending',
        progress: 0,
        finalizeRetries: 0,
        isGallery: true
      };
    });

    setUploadQueue(prev => [...prev, ...newItems]);

    // Generate previews
    newItems.forEach(item => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadQueue(prev => prev.map(q =>
          q.id === item.id ? { ...q, preview: reader.result as string } : q
        ));
      };
      reader.readAsDataURL(item.file);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input so the same files can be selected again if needed
    e.target.value = '';
  };

  const removeItem = (id: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  };

  const updateItemTitle = (id: string, newTitle: string) => {
    setUploadQueue(prev => prev.map(item =>
      item.id === id ? { ...item, title: newTitle } : item
    ));
  };

  const toggleItemGallery = (id: string) => {
    setUploadQueue(prev => prev.map(item =>
      item.id === id ? { ...item, isGallery: item.isGallery === false ? true : false } : item
    ));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const applyWatermark = async (imageFile: File, position: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Failed to get canvas context"));

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Load Branding Asset (SVG)
        const branding = new Image();
        branding.src = "/qurapp-watermark-branding.svg";
        branding.onload = () => {
          // Dynamic Scaling based on image width
          const scaleFactor = canvas.width / 1500; // Reference width

          // Branding Dimensions (4:1 Aspect Ratio) with Adjustable Scale
          const brandingHeight = Math.round(Math.max(20, (45 * scaleFactor) * brandingScale));
          const brandingWidth = Math.round(brandingHeight * 4);
          const padding = Math.round(Math.max(25, 50 * scaleFactor));

          const totalBrandingWidth = brandingWidth;
          const totalBrandingHeight = brandingHeight;

          let x = padding;
          let y = padding;

          if (position === "bottom-left") {
            x = padding;
            y = canvas.height - totalBrandingHeight - padding;
          } else if (position === "bottom-right") {
            x = canvas.width - totalBrandingWidth - padding;
            y = canvas.height - totalBrandingHeight - padding;
          } else if (position === "top-left") {
            x = padding;
            y = padding;
          } else if (position === "top-right") {
            x = canvas.width - totalBrandingWidth - padding;
            y = padding;
          }

          x = Math.round(x);
          y = Math.round(y);

          // HIGH-FIDELITY RECOLORING with SAFEGUARDED OVERSAMPLING
          // We use 8x to provide extreme sharpness but cap it at 8192px to prevent browser crashes
          const baseUpscale = 8;
          const maxSafeDimension = 8192;
          const upscaleFactor = Math.min(baseUpscale, maxSafeDimension / Math.max(brandingWidth, brandingHeight));

          const colorCanvas = document.createElement("canvas");
          const colorCtx = colorCanvas.getContext("2d");
          if (!colorCtx) return reject(new Error("Failed to get color canvas context"));

          colorCanvas.width = brandingWidth * upscaleFactor;
          colorCanvas.height = brandingHeight * upscaleFactor;

          // Enable high quality smoothing for both canvases
          colorCtx.imageSmoothingEnabled = true;
          colorCtx.imageSmoothingQuality = 'high';
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // 2. Draw original branding at upscaled resolution
          colorCtx.drawImage(branding, 0, 0, colorCanvas.width, colorCanvas.height);

          // 3. Apply color using source-in at upscaled resolution
          colorCtx.globalCompositeOperation = "source-in";
          colorCtx.fillStyle = watermarkColor;
          colorCtx.fillRect(0, 0, colorCanvas.width, colorCanvas.height);

          // 4. Draw colored branding back to main canvas, scaling it down
          // This provides a much sharper result than rendering at low resolution directly
          ctx.drawImage(colorCanvas, x, y, brandingWidth, brandingHeight);

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Canvas to blob failed"));
          }, imageFile.type, 0.95);
        };
        branding.onerror = () => reject(new Error("Failed to load branding asset"));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(imageFile);
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    const pendingItems = uploadQueue.filter(item => item.status === 'pending');

    if (pendingItems.length === 0) {
      toast({
        title: "No photos to upload",
        description: "Please select images that haven't been uploaded yet.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    for (const item of pendingItems) {
      try {
        setUploadQueue(prev => prev.map(q =>
          q.id === item.id ? { ...q, status: 'uploading', progress: 0 } : q
        ));

        // 0. Apply Watermark (only if it is set to appear in the gallery)
        const isGallery = item.isGallery !== false;
        const brandedBlob = isGallery
          ? await applyWatermark(item.file, watermarkPosition)
          : item.file;
        const brandedFile = new File([brandedBlob], item.file.name, { type: item.file.type });

        // 1. Get presigned URL from backend
        const response = await fetchWithAuth(`${apiGatewayUrl}/api/v1/gallery/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: brandedFile.name,
            mimeType: brandedFile.type,
            size: brandedFile.size,
            category,
            title: item.title.trim() || formatFileNameToTitle(item.file.name),
            isGallery,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get upload URL");
        }

        const { uploadUrl, file: fileRecord } = await response.json();

        // 2. Upload file directly to storage
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", item.file.type);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              setUploadQueue(prev => prev.map(q =>
                q.id === item.id ? { ...q, progress: percentComplete } : q
              ));
            }
          };

          xhr.onload = async () => {
            if (xhr.status === 200 || xhr.status === 204) {
              // 3. Finalize upload
              try {
                const finalizeRes = await fetchWithAuth(`${apiGatewayUrl}/api/v1/upload/finalize`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    fileId: fileRecord.id,
                    storageKey: fileRecord.storage_key,
                  }),
                });

                if (finalizeRes.ok) {
                  const finalizeData = await finalizeRes.json();
                  const cdnUrl = finalizeData.links?.cdnUrl || `${apiGatewayUrl}/v/${fileRecord.id}/img`;
                  setUploadQueue(prev => prev.map(q =>
                    q.id === item.id ? { ...q, status: 'completed', progress: 100, uploadedUrl: cdnUrl } : q
                  ));
                  resolve();
                } else {
                  throw new Error("Failed to finalize upload");
                }
              } catch (err) {
                reject(err);
              }
            } else {
              reject(new Error("Failed to upload to storage"));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.send(brandedFile);
        });

      } catch (error: any) {
        console.error(`Upload failed for ${item.file.name}:`, error);
        setUploadQueue(prev => prev.map(q =>
          q.id === item.id ? { ...q, status: 'error', error: error.message } : q
        ));
      }
    }

    setIsUploading(false);

    const completedCount = uploadQueue.filter(q => q.status === 'completed' || (q.status === 'uploading' && pendingItems.find(p => p.id === q.id))).length + pendingItems.filter(p => !uploadQueue.find(q => q.id === p.id && q.status === 'error')).length; // logic bit hairy due to async, but essentially check successes

    // Check overall status
    const resultItems = uploadQueue.map(q => {
      const pending = pendingItems.find(p => p.id === q.id);
      return pending ? { ...q, status: q.status === 'uploading' ? 'completed' : q.status } : q;
    });

    const errors = resultItems.filter(q => q.status === 'error').length;

    if (errors === 0) {
      toast({
        title: "Bulk Upload Successful",
        description: `All ${pendingItems.length} photos have been uploaded.`,
      });
    } else {
      toast({
        title: "Bulk Upload Completed with Errors",
        description: `${pendingItems.length - errors} uploaded, ${errors} failed.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-border/50">
      <form onSubmit={handleUpload}>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <Label htmlFor="category">Global Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="bg-muted/50 border-border/50">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                * Selected category will apply to all images in this batch.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Image Assets</Label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('photo')?.click()}
              className={`border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${isDragging ? 'border-primary bg-primary/10' :
                uploadQueue.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'
                }`}
            >
              <Input
                id="photo"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP (max. 10MB each)</p>
              </div>
            </div>

            {uploadQueue.length > 0 && (
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>Upload Queue ({uploadQueue.length})</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setUploadQueue([])}
                  >
                    Clear All
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {uploadQueue.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-4 p-3 rounded-lg border bg-muted/30 group relative transition-colors ${item.status === 'error' ? 'border-destructive/30 bg-destructive/5' :
                        item.status === 'completed' ? 'border-green-500/30 bg-green-500/5' : 'border-border/50'
                        }`}
                    >
                      <div className="relative h-16 w-16 flex-shrink-0 bg-black/10 rounded-md overflow-hidden flex items-center justify-center italic text-[8px]">
                        {item.preview ? (
                          <img src={item.preview} alt="Queue item" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}

                        {/* Branding Preview Overlay on Thumbnail (only if isGallery is true) */}
                        {item.isGallery !== false && (
                          <div className={`absolute scale-[0.3] origin-center ${watermarkPosition === "bottom-left" ? "bottom-1 left-1" :
                            watermarkPosition === "bottom-right" ? "bottom-1 right-1" :
                              watermarkPosition === "top-left" ? "top-1 left-1" :
                                "top-1 right-1"
                            }`}>
                            <div
                              style={{
                                backgroundColor: watermarkColor,
                                maskImage: 'url("/qurapp-watermark-branding.svg")',
                                WebkitMaskImage: 'url("/qurapp-watermark-branding.svg")',
                                maskSize: 'contain',
                                WebkitMaskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                height: `${22 * brandingScale}px`,
                                width: `${22 * brandingScale * 4}px` // 4:1 aspect ratio
                              }}
                            />
                          </div>
                        )}

                        {item.status === 'completed' && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <Input
                            value={item.title}
                            onChange={(e) => updateItemTitle(item.id, e.target.value)}
                            className="h-7 text-xs bg-muted/50 border-none px-1.5 focus-visible:ring-1 focus-visible:ring-primary w-full"
                            placeholder="Image title..."
                            disabled={item.status === 'uploading' || item.status === 'completed'}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                            {item.file.name} ({(item.file.size / 1024 / 1024).toFixed(1)}MB)
                          </span>
                          <label className="flex items-center gap-1 cursor-pointer text-[10px] select-none text-muted-foreground">
                            <input
                              type="checkbox"
                              checked={item.isGallery !== false}
                              onChange={() => toggleItemGallery(item.id)}
                              disabled={item.status === 'uploading' || item.status === 'completed'}
                              className="h-3 w-3 rounded border-border bg-muted text-primary focus:ring-primary"
                            />
                            <span>In Gallery</span>
                          </label>
                          {item.status === 'uploading' && (
                            <span className="text-[10px] font-bold text-primary">{item.progress}%</span>
                          )}
                          {item.status === 'error' && (
                            <span className="text-[10px] font-bold text-destructive">Error</span>
                          )}
                        </div>

                        {(item.status === 'uploading' || item.status === 'completed') && (
                          <Progress value={item.progress} className={`h-1 ${item.status === 'completed' ? 'bg-green-500' : ''}`} />
                        )}

                        {item.uploadedUrl && (
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              value={item.uploadedUrl}
                              readOnly
                              className="h-6 text-[9px] bg-muted/70 border-border/40 font-mono select-all px-1.5 focus-visible:ring-0 flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(item.uploadedUrl!, item.id)}
                            >
                              {copiedId === item.id ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        )}

                        {item.error && (
                          <p className="text-[10px] text-destructive leading-tight italic truncate">
                            {item.error}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm transition-opacity"
                        disabled={item.status === 'uploading'}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <Label>Branding Position</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "top-left", label: "Top Left" },
                  { id: "top-right", label: "Top Right" },
                  { id: "bottom-left", label: "Bottom Left" },
                  { id: "bottom-right", label: "Bottom Right" },
                ].map((pos) => (
                  <Button
                    key={pos.id}
                    type="button"
                    variant={watermarkPosition === pos.id ? "default" : "outline"}
                    className="h-10 text-xs"
                    onClick={() => setWatermarkPosition(pos.id)}
                  >
                    {pos.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Branding Color</Label>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-20 rounded-lg border border-border/50 shadow-sm relative overflow-hidden transition-all hover:bg-muted/50"
                  style={{ backgroundColor: watermarkColor }}
                >
                  <Input
                    type="color"
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                    className="h-10 bg-muted/50 border-border/50 font-mono text-center"
                    placeholder="#HEXCOLOR"
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                * use the browser picker for best visibility on these photos.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Branding Size ({brandingScale.toFixed(1)}x)</Label>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                  {brandingScale < 0.9 ? "Small" : brandingScale > 1.2 ? "Large" : "Standard"}
                </span>
              </div>
              <div className="pt-2 px-1">
                <Slider
                  value={[brandingScale]}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  onValueChange={(vals) => setBrandingScale(vals[0])}
                />
              </div>
              <p className="text-[11px] text-muted-foreground italic leading-tight">
                * branding settings apply to every image in this batch.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Bulk Upload:</strong> You can drop multiple files at once. Titles are auto-generated from filenames but can be edited before uploading.
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 p-6 flex justify-end gap-3">
          {uploadQueue.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                document.getElementById('photo')?.click();
              }}
              disabled={isUploading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add More
            </Button>
          )}
          <Button
            type="submit"
            disabled={isUploading || uploadQueue.length === 0 || uploadQueue.every(q => q.status === 'completed')}
            className="min-w-[140px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading Batch...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {uploadQueue.length > 1 ? `Upload ${uploadQueue.length} Files` : 'Upload Photo'}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
