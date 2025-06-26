import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Lightbulb, Clock, Thermometer, Plus, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { OutfitSuggestion, ClothingItem } from "@shared/schema";

interface OutfitSuggestionsProps {
  onRefresh?: () => void;
  eventFilter?: string; // Filter suggestions by event ID
}

export function OutfitSuggestions({ onRefresh, eventFilter }: OutfitSuggestionsProps) {
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: allSuggestions = [], isLoading } = useQuery({
    queryKey: ["/api/outfit-suggestions"],
    queryFn: () => api.getOutfitSuggestions(),
  });

  // Filter suggestions by event if eventFilter is provided
  const suggestions = eventFilter 
    ? allSuggestions.filter(suggestion => suggestion.eventId === eventFilter)
    : allSuggestions.filter(suggestion => !suggestion.eventId); // Show only general suggestions when no filter

  const { data: allItems = [] } = useQuery({
    queryKey: ["/api/clothing-items"],
    queryFn: () => api.getClothingItems(),
  });

  const generateMutation = useMutation({
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

  const acceptMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => 
      api.acceptOutfitSuggestion(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/outfit-suggestions"] });
      toast({
        title: "Outfit saved!",
        description: "Your outfit has been added to your collection.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save outfit",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setAcceptingId(null);
    },
  });

  const getItemById = (id: number): ClothingItem | undefined => {
    return allItems.find(item => item.id === id);
  };

  const handleAcceptSuggestion = async (suggestion: OutfitSuggestion) => {
    setAcceptingId(suggestion.id);
    const outfitName = `AI Suggested Outfit`;
    acceptMutation.mutate({ id: suggestion.id, name: outfitName });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-accent text-accent-foreground";
    if (confidence >= 60) return "bg-amber text-white";
    return "bg-gray-500 text-white";
  };

  const recentSuggestions = suggestions
    .filter(s => !s.isAccepted)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="flex space-x-2 mb-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="w-12 h-12 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-dark">Today's Outfit Suggestions</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="text-primary border-primary hover:bg-primary hover:text-white"
          >
            {generateMutation.isPending ? "Generating..." : "Refresh"}
          </Button>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {recentSuggestions.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-lg font-medium text-text-dark mb-2">No outfit suggestions yet</h3>
          <p className="text-text-gray mb-4">
            Generate AI-powered outfit suggestions based on your wardrobe and today's weather.
          </p>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="bg-primary text-white hover:bg-primary-dark"
          >
            {generateMutation.isPending ? "Generating..." : "Generate Suggestions"}
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentSuggestions.map((suggestion, index) => {
            const items = suggestion.itemIds
              .map(id => getItemById(id))
              .filter(Boolean) as ClothingItem[];

            const weatherData = suggestion.weatherData as any;

            return (
              <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className={`rounded-full p-1 ${
                      index === 0 ? "bg-accent text-white" : 
                      index === 1 ? "bg-amber text-white" : 
                      "bg-primary text-white"
                    }`}>
                      {index === 0 ? <Star className="h-3 w-3" /> :
                       index === 1 ? <Lightbulb className="h-3 w-3" /> :
                       <Clock className="h-3 w-3" />}
                    </div>
                    <span className="text-sm font-medium text-text-dark">
                      {index === 0 ? "Perfect for Today" :
                       index === 1 ? "Smart Casual" :
                       "Alternative Choice"}
                    </span>
                    {weatherData && (
                      <div className="flex items-center text-xs text-text-gray ml-auto">
                        <Thermometer className="h-3 w-3 mr-1" />
                        {weatherData.temperature}°F
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 mb-3">
                    {items.slice(0, 3).map((item) => (
                      <img
                        key={item.id}
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ))}
                    {items.length > 3 && (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-medium">
                        +{items.length - 3}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-text-gray mb-3 line-clamp-2">
                    {suggestion.reasoning || "AI-curated outfit perfect for today's weather and occasions"}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`text-xs ${getConfidenceColor(suggestion.confidence || 75)}`}>
                      {suggestion.confidence || 75}% Match
                    </Badge>
                    {suggestion.occasion && (
                      <Badge variant="outline" className="text-xs">
                        {suggestion.occasion}
                      </Badge>
                    )}
                  </div>
                  
                  <Button
                    className="w-full bg-primary text-white hover:bg-primary-dark transition-colors text-sm font-medium"
                    onClick={() => handleAcceptSuggestion(suggestion)}
                    disabled={acceptingId === suggestion.id}
                  >
                    {acceptingId === suggestion.id ? "Saving..." : "Select This Outfit"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          {/* Add New Outfit Card */}
          <Card className="hover:shadow-md transition-shadow border-2 border-dashed border-gray-300">
            <CardContent className="p-4">
              <div className="text-center py-6">
                <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-5 w-5 text-text-gray" />
                </div>
                <p className="text-sm font-medium text-text-dark mb-2">Create Custom Outfit</p>
                <p className="text-xs text-text-gray mb-4">Mix and match your wardrobe items</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-100 text-text-dark hover:bg-gray-200 transition-colors"
                >
                  Start Creating
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
