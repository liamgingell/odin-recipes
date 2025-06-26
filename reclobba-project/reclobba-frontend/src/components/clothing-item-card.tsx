import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MoreHorizontal } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { ClothingItem } from "@shared/schema";

interface ClothingItemCardProps {
  item: ClothingItem;
  onFavoriteToggle?: (id: number, favorite: boolean) => void;
  onClick?: (item: ClothingItem) => void;
}

export function ClothingItemCard({ item, onFavoriteToggle, onClick }: ClothingItemCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(item.id, !item.isFavorite);
  };

  const getLastWornText = () => {
    if (!item.lastWorn) return "Never worn";
    
    const daysAgo = Math.floor((Date.now() - new Date(item.lastWorn).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysAgo === 0) return "Worn today";
    if (daysAgo === 1) return "Worn yesterday";
    if (daysAgo < 7) return `Worn ${daysAgo} days ago`;
    if (daysAgo < 30) return `Worn ${Math.floor(daysAgo / 7)} week${Math.floor(daysAgo / 7) > 1 ? 's' : ''} ago`;
    return `Worn ${Math.floor(daysAgo / 30)} month${Math.floor(daysAgo / 30) > 1 ? 's' : ''} ago`;
  };

  return (
    <Card 
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer"
      onClick={() => onClick?.(item)}
    >
      <div className="aspect-square relative">
        {!imageError ? (
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-2xl mb-2">👕</div>
              <p className="text-xs">Image not available</p>
            </div>
          </div>
        )}
        
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/90 rounded-full p-2 shadow-lg hover:bg-white"
            onClick={handleFavoriteClick}
          >
            <Heart 
              className={`h-4 w-4 ${
                item.isFavorite ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-red-500"
              }`} 
            />
          </Button>
        </div>
        
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="bg-black/75 text-white text-xs">
            {item.category}
          </Badge>
        </div>
      </div>
      
      <div className="p-3">
        <p className="font-medium text-text-dark text-sm truncate">{item.name}</p>
        {item.brand && (
          <p className="text-xs text-text-gray truncate">{item.brand}</p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex space-x-1">
            {item.colors.slice(0, 3).map((color, index) => (
              <div
                key={index}
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
            {item.colors.length > 3 && (
              <div className="w-3 h-3 rounded-full border border-gray-300 bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-600">+</span>
              </div>
            )}
          </div>
          <span className="text-xs text-text-gray">{getLastWornText()}</span>
        </div>
      </div>
    </Card>
  );
}
