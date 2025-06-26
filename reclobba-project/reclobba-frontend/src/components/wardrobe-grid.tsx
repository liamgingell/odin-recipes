import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Grid3X3, List, Filter } from "lucide-react";
import { ClothingItemCard } from "./clothing-item-card";
import { api } from "@/lib/api";
import type { ClothingItem } from "@shared/schema";

const categories = [
  "all",
  "shirts", 
  "pants", 
  "dresses", 
  "shoes", 
  "jackets",
  "accessories"
];

export function WardrobeGrid() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["/api/clothing-items", selectedCategory === "all" ? undefined : selectedCategory],
    queryFn: () => api.getClothingItems(selectedCategory === "all" ? undefined : selectedCategory),
  });

  const favoriteMutation = useMutation({
    mutationFn: ({ id, favorite }: { id: number; favorite: boolean }) =>
      api.updateClothingItem(id, { isFavorite: favorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clothing-items"] });
    },
  });

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFavoriteToggle = (id: number, favorite: boolean) => {
    favoriteMutation.mutate({ id, favorite });
  };

  const handleItemClick = (item: ClothingItem) => {
    // TODO: Open item detail modal
    console.log("Opening item:", item);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Filter skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        {/* Category filters skeleton */}
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-9 w-20" />
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with title and controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-text-dark">My Wardrobe</h1>
          <Badge variant="secondary" className="bg-gray-100 text-text-gray">
            {filteredItems.length} items
          </Badge>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search wardrobe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-gray h-4 w-4" />
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-white shadow-sm text-primary" : "text-text-gray"}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-white shadow-sm text-primary" : "text-text-gray"}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={
              selectedCategory === category
                ? "bg-primary text-white"
                : "bg-white text-text-gray hover:bg-gray-50 border-gray-200"
            }
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
        <Button variant="outline" size="sm" className="bg-white text-text-gray hover:bg-gray-50 border-gray-200">
          <Filter className="h-4 w-4 mr-1" />
          More Filters
        </Button>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👕</div>
          <p className="text-xl font-medium text-text-dark mb-2">No items found</p>
          <p className="text-text-gray">
            {searchQuery 
              ? "Try adjusting your search terms" 
              : "Add some clothing items to your wardrobe to get started"
            }
          </p>
        </div>
      ) : (
        <div className={
          viewMode === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
            : "space-y-4"
        }>
          {filteredItems.map((item) => (
            <ClothingItemCard
              key={item.id}
              item={item}
              onFavoriteToggle={handleFavoriteToggle}
              onClick={handleItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
