import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Calendar, Users } from "lucide-react";
import { api } from "@/lib/api";
import type { Outfit, ClothingItem } from "@shared/schema";

export default function Outfits() {
  const { data: outfits = [], isLoading } = useQuery({
    queryKey: ["/api/outfits"],
    queryFn: () => api.getOutfits(),
  });

  const { data: allItems = [] } = useQuery({
    queryKey: ["/api/clothing-items"],
    queryFn: () => api.getClothingItems(),
  });

  const getItemById = (id: number): ClothingItem | undefined => {
    return allItems.find(item => item.id === id);
  };

  const getOutfitItems = (outfit: Outfit): ClothingItem[] => {
    return outfit.itemIds
      .map(id => getItemById(id))
      .filter(Boolean) as ClothingItem[];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-40 w-full rounded-lg mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-dark mb-2">My Outfits</h1>
          <Badge variant="secondary" className="bg-gray-100 text-text-gray">
            {outfits.length} saved outfits
          </Badge>
        </div>

        {outfits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👗</div>
            <p className="text-xl font-medium text-text-dark mb-2">No outfits saved yet</p>
            <p className="text-text-gray">
              Create your first outfit from AI suggestions or manually combine your wardrobe items
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outfits.map((outfit) => {
              const items = getOutfitItems(outfit);
              
              return (
                <Card key={outfit.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {/* Outfit Items Preview */}
                    <div className="grid grid-cols-3 gap-2 mb-4 aspect-video">
                      {items.slice(0, 3).map((item, index) => (
                        <div
                          key={item.id}
                          className={`relative rounded-lg overflow-hidden ${
                            index === 0 ? "col-span-2 row-span-2" : ""
                          }`}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = '<div class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No image</div>';
                            }}
                          />
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div className="bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                          +{items.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Outfit Info */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-text-dark line-clamp-2">{outfit.name}</h3>
                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                          <Heart className={`h-4 w-4 ${outfit.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                        </button>
                      </div>

                      {outfit.description && (
                        <p className="text-sm text-text-gray line-clamp-2">{outfit.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {outfit.occasion && (
                          <Badge variant="outline" className="text-xs">
                            {outfit.occasion}
                          </Badge>
                        )}
                        {outfit.season && (
                          <Badge variant="outline" className="text-xs">
                            {outfit.season}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-text-gray pt-2">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {outfit.lastWorn 
                              ? new Date(outfit.lastWorn).toLocaleDateString()
                              : "Never worn"
                            }
                          </span>
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {outfit.wearCount || 0} times
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
