import { apiRequest } from "./queryClient";
import type { ClothingItem, Outfit, OutfitSuggestion, User, CalendarEvent } from "@shared/schema";

export interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

export interface ClothingAnalysis {
  category: string;
  subcategory: string;
  colors: string[];
  brand?: string;
  name: string;
  description: string;
  season: string[];
  formality: string;
  tags: string[];
  confidence: number;
}

export const api = {
  // User
  async getUser(): Promise<User> {
    const res = await apiRequest("GET", "/api/user");
    return res.json();
  },

  // Weather
  async getWeather(location?: string): Promise<WeatherData> {
    const url = location ? `/api/weather?location=${encodeURIComponent(location)}` : "/api/weather";
    const res = await apiRequest("GET", url);
    return res.json();
  },

  // Clothing Items
  async getClothingItems(category?: string): Promise<ClothingItem[]> {
    const url = category ? `/api/clothing-items?category=${encodeURIComponent(category)}` : "/api/clothing-items";
    const res = await apiRequest("GET", url);
    return res.json();
  },

  async getClothingItem(id: number): Promise<ClothingItem> {
    const res = await apiRequest("GET", `/api/clothing-items/${id}`);
    return res.json();
  },

  async analyzeClothingImage(file: File): Promise<{ analysis: ClothingAnalysis; imageUrl: string; originalFilename: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/clothing-items/analyze', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || "Failed to analyze image");
    }

    return res.json();
  },

  async createClothingItem(data: Omit<ClothingItem, 'id' | 'userId' | 'wearCount' | 'isFavorite' | 'createdAt'>): Promise<ClothingItem> {
    const res = await apiRequest("POST", "/api/clothing-items", data);
    return res.json();
  },

  async updateClothingItem(id: number, data: Partial<ClothingItem>): Promise<ClothingItem> {
    const res = await apiRequest("PATCH", `/api/clothing-items/${id}`, data);
    return res.json();
  },

  async deleteClothingItem(id: number): Promise<void> {
    await apiRequest("DELETE", `/api/clothing-items/${id}`);
  },

  // Outfits
  async getOutfits(): Promise<Outfit[]> {
    const res = await apiRequest("GET", "/api/outfits");
    return res.json();
  },

  async createOutfit(data: Omit<Outfit, 'id' | 'userId' | 'wearCount' | 'lastWorn' | 'createdAt'>): Promise<Outfit> {
    const res = await apiRequest("POST", "/api/outfits", data);
    return res.json();
  },

  // Outfit Suggestions
  async generateOutfitSuggestions(occasion?: string, location?: string): Promise<OutfitSuggestion[]> {
    const res = await apiRequest("POST", "/api/outfit-suggestions/generate", { occasion, location });
    return res.json();
  },

  async getOutfitSuggestions(): Promise<OutfitSuggestion[]> {
    const res = await apiRequest("GET", "/api/outfit-suggestions");
    return res.json();
  },

  async acceptOutfitSuggestion(id: number, name: string): Promise<Outfit> {
    const res = await apiRequest("POST", `/api/outfit-suggestions/${id}/accept`, { name });
    return res.json();
  },

  // Calendar Events API
  async getCalendarEvents(startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    
    const res = await apiRequest("GET", `/api/calendar-events?${params}`);
    return res.json();
  },

  async syncCalendarEvents(): Promise<{ message: string; events: CalendarEvent[] }> {
    const res = await apiRequest("POST", "/api/calendar-events/sync");
    return res.json();
  },

  async generateEventOutfitSuggestions(eventId: string): Promise<OutfitSuggestion[]> {
    const res = await apiRequest("POST", `/api/calendar-events/${eventId}/outfit-suggestions`);
    return res.json();
  },
};
