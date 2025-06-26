import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { useCamera } from "@/hooks/use-camera";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ClothingAnalysis } from "@/lib/api";

interface CameraModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CameraModal({ open, onOpenChange }: CameraModalProps) {
  const [analysis, setAnalysis] = useState<ClothingAnalysis | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [manualData, setManualData] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    colors: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { videoRef, isStreaming, error, startCamera, stopCamera, capturePhoto } = useCamera({
    facingMode: "environment",
  });

  const createItemMutation = useMutation({
    mutationFn: (data: any) => api.createClothingItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clothing-items"] });
      toast({
        title: "Item added successfully!",
        description: "Your clothing item has been added to your wardrobe.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    stopCamera();
    setAnalysis(null);
    setImageUrl(null);
    setIsAnalyzing(false);
    setManualData({
      name: "",
      brand: "",
      category: "",
      description: "",
      colors: "",
    });
    onOpenChange(false);
  };

  const handleStartCamera = async () => {
    await startCamera();
  };

  const handleCapturePhoto = async () => {
    try {
      setIsAnalyzing(true);
      const photoBlob = await capturePhoto();
      await analyzeImage(photoBlob);
      stopCamera();
    } catch (error) {
      console.error("Error capturing photo:", error);
      toast({
        title: "Capture failed",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsAnalyzing(true);
      await analyzeImage(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeImage = async (file: File | Blob) => {
    try {
      const imageFile = file instanceof Blob ? new File([file], "capture.jpg", { type: "image/jpeg" }) : file;
      const result = await api.analyzeClothingImage(imageFile);
      
      setAnalysis(result.analysis);
      setImageUrl(result.imageUrl);
      
      // Pre-fill manual form with AI analysis
      setManualData({
        name: result.analysis.name,
        brand: result.analysis.brand || "",
        category: result.analysis.category,
        description: result.analysis.description,
        colors: result.analysis.colors.join(", "),
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze image. You can still add the item manually.",
        variant: "destructive",
      });
    }
  };

  const handleSaveFromAnalysis = () => {
    if (!analysis || !imageUrl) return;

    createItemMutation.mutate({
      name: analysis.name,
      brand: analysis.brand || null,
      category: analysis.category,
      subcategory: analysis.subcategory,
      colors: analysis.colors,
      imageUrl,
      description: analysis.description,
      season: analysis.season.join(","),
      formality: analysis.formality,
      tags: analysis.tags,
      aiAnalysis: analysis,
      lastWorn: null,
    });
  };

  const handleSaveManual = () => {
    if (!manualData.name || !manualData.category) {
      toast({
        title: "Missing information",
        description: "Please fill in at least the name and category.",
        variant: "destructive",
      });
      return;
    }

    createItemMutation.mutate({
      name: manualData.name,
      brand: manualData.brand || null,
      category: manualData.category,
      subcategory: "",
      colors: manualData.colors.split(",").map(c => c.trim()).filter(Boolean),
      imageUrl: imageUrl || "",
      description: manualData.description,
      season: "all",
      formality: "casual",
      tags: [],
      aiAnalysis: null,
      lastWorn: null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add New Item
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="camera" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="camera">Camera</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="space-y-4">
            {isAnalyzing ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-sm text-text-gray">Analyzing your clothing item...</p>
              </div>
            ) : analysis && imageUrl ? (
              <div className="space-y-4">
                <img
                  src={imageUrl}
                  alt="Captured item"
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div className="space-y-2">
                  <h3 className="font-medium">{analysis.name}</h3>
                  <p className="text-sm text-text-gray">{analysis.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Colors:</span>
                    {analysis.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-text-gray">
                    Confidence: {analysis.confidence}% • Category: {analysis.category}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveFromAnalysis}
                    disabled={createItemMutation.isPending}
                    className="flex-1"
                  >
                    {createItemMutation.isPending ? "Saving..." : "Save Item"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAnalysis(null);
                      setImageUrl(null);
                    }}
                  >
                    Retake
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}
                
                <div className="bg-gray-900 aspect-square rounded-xl overflow-hidden">
                  {isStreaming ? (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm opacity-75">Camera Preview</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  {!isStreaming ? (
                    <Button onClick={handleStartCamera} className="flex-1">
                      <Camera className="h-4 w-4 mr-2" />
                      Start Camera
                    </Button>
                  ) : (
                    <Button onClick={handleCapturePhoto} className="flex-1">
                      <Camera className="h-4 w-4 mr-2" />
                      Capture
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Gallery
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {isAnalyzing ? (
                <div>
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-sm text-text-gray">Analyzing your clothing item...</p>
                </div>
              ) : imageUrl && analysis ? (
                <div className="space-y-4">
                  <img
                    src={imageUrl}
                    alt="Uploaded item"
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                  <div className="space-y-2">
                    <h3 className="font-medium">{analysis.name}</h3>
                    <p className="text-sm text-text-gray">{analysis.description}</p>
                  </div>
                  <Button
                    onClick={handleSaveFromAnalysis}
                    disabled={createItemMutation.isPending}
                    className="w-full"
                  >
                    {createItemMutation.isPending ? "Saving..." : "Save Item"}
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Upload Photos</p>
                  <p className="text-sm text-text-gray">
                    Click to select images or drag and drop
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={manualData.name}
                  onChange={(e) => setManualData({ ...manualData, name: e.target.value })}
                  placeholder="e.g., Blue Oxford Shirt"
                />
              </div>

              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={manualData.brand}
                  onChange={(e) => setManualData({ ...manualData, brand: e.target.value })}
                  placeholder="e.g., J.Crew"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={manualData.category}
                  onChange={(e) => setManualData({ ...manualData, category: e.target.value })}
                  placeholder="e.g., shirt, pants, dress"
                />
              </div>

              <div>
                <Label htmlFor="colors">Colors</Label>
                <Input
                  id="colors"
                  value={manualData.colors}
                  onChange={(e) => setManualData({ ...manualData, colors: e.target.value })}
                  placeholder="e.g., blue, white (comma-separated)"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={manualData.description}
                  onChange={(e) => setManualData({ ...manualData, description: e.target.value })}
                  placeholder="Describe the item..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSaveManual}
                disabled={createItemMutation.isPending}
                className="w-full"
              >
                {createItemMutation.isPending ? "Saving..." : "Add Item"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
}
