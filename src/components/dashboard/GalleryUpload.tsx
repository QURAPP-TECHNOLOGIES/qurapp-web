import { useState } from "react";
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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

export function GalleryUpload(): JSX.Element {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Ramadan");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [watermarkPosition, setWatermarkPosition] = useState<string>("bottom-left");
  const [brandingScale, setBrandingScale] = useState<number>(1.0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
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
          const brandingHeight = Math.max(20, (45 * scaleFactor) * brandingScale);
          const brandingWidth = brandingHeight * 4;
          const padding = Math.max(25, 50 * scaleFactor);

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

          // Draw Branding
          ctx.drawImage(branding, x, y, brandingWidth, brandingHeight);

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Canvas to blob failed"));
          }, imageFile.type, 0.85); // Optimized quality for performance
        };
        branding.onerror = () => reject(new Error("Failed to load branding asset"));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(imageFile);
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "No photo selected",
        description: "Please select an image file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for the photo.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 0. Apply Watermark
      const brandedBlob = await applyWatermark(file, watermarkPosition);
      const brandedFile = new File([brandedBlob], file.name, { type: file.type });

      // 1. Get presigned URL from backend
      const response = await fetchWithAuth(`${apiGatewayUrl}/api/v1/gallery/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: brandedFile.name,
          mimeType: brandedFile.type,
          size: brandedFile.size,
          category,
          title: title.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, file: fileRecord } = await response.json();

      // 2. Upload file directly to storage using the presigned URL
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        if (xhr.status === 200 || xhr.status === 204) {
          // 3. Finalize upload in backend to mark it as 'ready'
          fetchWithAuth(`${apiGatewayUrl}/api/v1/upload/finalize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileId: fileRecord.id,
              storageKey: fileRecord.storage_key,
            }),
          }).then(finalizeRes => {
            if (finalizeRes.ok) {
              toast({
                title: "Upload Successful",
                description: `Photo "${title}" has been uploaded and finalized in the gallery.`,
              });
              setFile(null);
              setTitle("");
              setUploadProgress(0);
            } else {
              toast({
                title: "Finalization Error",
                description: "File uploaded but failed to finalize in the gallery.",
                variant: "destructive",
              });
            }
          }).catch(err => {
            console.error("Finalization error", err);
            toast({
              title: "Finalization Error",
              description: "A network error occurred while finalizing the upload.",
              variant: "destructive",
            });
          });
        } else {
          toast({
            title: "Upload Error",
            description: "Failed to upload file to storage.",
            variant: "destructive",
          });
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        toast({
          title: "Upload Error",
          description: "Network error during file upload.",
          variant: "destructive",
        });
      };

      xhr.send(brandedFile);
    } catch (error: any) {
      setIsUploading(false);
      toast({
        title: "Upload Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-border/50">
      <form onSubmit={handleUpload}>
        <CardHeader>
          <CardTitle>Upload Gallery Photo</CardTitle>
          <CardDescription>
            Add a new high-quality photo to the Islamic Gallery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Photo Title</Label>
              <Input
                id="title"
                placeholder="e.g. Serene Mosque Sunset"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-muted/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
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
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="photo">Image File</Label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${file ? 'border-primary/50 bg-primary/5' : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'
                }`}
              onClick={() => document.getElementById('photo')?.click()}
            >
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative group">
                    <img
                      src={imagePreview || ""}
                      alt="Preview"
                      className="max-h-40 rounded-lg shadow-sm"
                    />
                    {/* Visual Branding Indicator */}
                    <div className={`absolute ${watermarkPosition === "bottom-left" ? "bottom-2 left-2" :
                      watermarkPosition === "bottom-right" ? "bottom-2 right-2" :
                        watermarkPosition === "top-left" ? "top-2 left-2" :
                          "top-2 right-2"
                      }`}>
                      <img 
                        src="/qurapp-watermark-branding.svg" 
                        alt="Branding" 
                        style={{ height: `${22 * brandingScale}px` }} 
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium">{file.name}</span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setImagePreview(null);
                      }}
                    >
                      Change Photo
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP (max. 10MB)</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {file && (
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
                  * adjust the branding size for best visibility on this photo.
                </p>
              </div>
            </div>
          )}

          {isUploading && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Uploading to secure storage...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <div className="flex items-start gap-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Quality Note:</strong> Please ensure photos are high resolution (min 1920x1080) and follow Islamic aesthetic guidelines. Avoid photos with prominent faces or human figures.
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 p-6 flex justify-end">
          <Button
            type="submit"
            disabled={isUploading || !file || !title.trim()}
            className="min-w-[140px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
