import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Camera, Upload, Edit, X } from "lucide-react";
import { CameraModal } from "./camera-modal";

export function FabMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleCameraClick = () => {
    setIsOpen(false);
    setCameraModalOpen(true);
  };

  const handleUploadClick = () => {
    setIsOpen(false);
    // Create file input and trigger click
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        // Handle file upload
        console.log('Selected files:', Array.from(files));
        setCameraModalOpen(true);
      }
    };
    input.click();
  };

  const handleManualClick = () => {
    setIsOpen(false);
    setCameraModalOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          {/* Main FAB */}
          <Button
            onClick={toggleMenu}
            size="lg"
            className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-purple-main hover:bg-primary-dark text-white"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </Button>
          
          {/* FAB Menu */}
          <div className={`absolute bottom-16 right-0 space-y-3 transition-all duration-300 ${
            isOpen 
              ? "opacity-100 scale-100 pointer-events-auto" 
              : "opacity-0 scale-95 pointer-events-none"
          }`}>
            <div className="flex items-center">
              <span className="bg-card text-foreground px-3 py-1 rounded-lg text-sm mr-3 whitespace-nowrap border border-border">
                Take Photo
              </span>
              <Button
                onClick={handleCameraClick}
                size="lg"
                variant="outline"
                className="w-12 h-12 rounded-full shadow-lg bg-card hover:bg-muted border-border"
              >
                <Camera className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center">
              <span className="bg-card text-foreground px-3 py-1 rounded-lg text-sm mr-3 whitespace-nowrap border border-border">
                Upload Photos
              </span>
              <Button
                onClick={handleUploadClick}
                size="lg"
                variant="outline"
                className="w-12 h-12 rounded-full shadow-lg bg-card hover:bg-muted border-border"
              >
                <Upload className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center">
              <span className="bg-card text-foreground px-3 py-1 rounded-lg text-sm mr-3 whitespace-nowrap border border-border">
                Manual Entry
              </span>
              <Button
                onClick={handleManualClick}
                size="lg"
                variant="outline"
                className="w-12 h-12 rounded-full shadow-lg bg-card hover:bg-muted border-border"
              >
                <Edit className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CameraModal
        open={cameraModalOpen}
        onOpenChange={setCameraModalOpen}
      />
    </>
  );
}
