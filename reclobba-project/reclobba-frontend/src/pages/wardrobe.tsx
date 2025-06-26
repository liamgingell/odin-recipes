import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { WeatherBanner } from "@/components/weather-banner";
import { WardrobeGrid } from "@/components/wardrobe-grid";
import { OutfitSuggestions } from "@/components/outfit-suggestions";
import { FabMenu } from "@/components/fab-menu";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Mobile Bottom Navigation
function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 pb-safe">
      <div className="flex justify-around items-center py-2">
        <button className="flex flex-col items-center p-2 text-primary">
          <i className="fas fa-tshirt text-xl mb-1"></i>
          <span className="text-xs font-medium">Wardrobe</span>
        </button>
        <button className="flex flex-col items-center p-2 text-text-gray">
          <i className="fas fa-magic text-xl mb-1"></i>
          <span className="text-xs">Outfits</span>
        </button>
        <button className="flex flex-col items-center p-2 text-text-gray">
          <i className="fas fa-lightbulb text-xl mb-1"></i>
          <span className="text-xs">Suggestions</span>
        </button>
        <button className="flex flex-col items-center p-2 text-text-gray">
          <i className="fas fa-calendar text-xl mb-1"></i>
          <span className="text-xs">Calendar</span>
        </button>
      </div>
    </nav>
  );
}

export default function Wardrobe() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const generateSuggestionsMutation = useMutation({
    mutationFn: () => api.generateOutfitSuggestions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outfit-suggestions"] });
      toast({
        title: "New outfit suggestions generated!",
        description: "Check out your personalized outfit ideas below.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate suggestions",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateOutfit = () => {
    generateSuggestionsMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <WeatherBanner onGenerateOutfit={handleGenerateOutfit} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
        <WardrobeGrid />
        
        <div className="mt-8">
          <OutfitSuggestions />
        </div>

        {/* Load More Section */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="bg-card text-text-gray border-border hover:bg-muted transition-colors"
          >
            Load More Items
          </Button>
        </div>
      </main>

      <FabMenu />
      <MobileBottomNav />
    </div>
  );
}
