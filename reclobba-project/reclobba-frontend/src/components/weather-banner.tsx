import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sun, Cloud, CloudRain, CloudSnow, CloudDrizzle, Wind } from "lucide-react";
import { api } from "@/lib/api";

const weatherIcons = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Snow: CloudSnow,
  Drizzle: CloudDrizzle,
  Thunderstorm: CloudRain,
  Mist: Wind,
  Fog: Wind,
  Haze: Wind,
};

interface WeatherBannerProps {
  onGenerateOutfit?: () => void;
}

export function WeatherBanner({ onGenerateOutfit }: WeatherBannerProps) {
  const { data: weather, isLoading } = useQuery({
    queryKey: ["/api/weather"],
    queryFn: () => api.getWeather(),
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-purple-main/20 to-purple-light/20 border-b border-light-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-card rounded-lg p-3 shadow-sm animate-pulse">
                <div className="w-6 h-6 bg-muted rounded"></div>
              </div>
              <div>
                <div className="w-24 h-4 bg-muted rounded mb-1"></div>
                <div className="w-32 h-5 bg-muted rounded"></div>
              </div>
            </div>
            <div className="w-32 h-10 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  const WeatherIcon = weatherIcons[weather.condition as keyof typeof weatherIcons] || Sun;

  return (
    <div className="bg-gradient-to-r from-purple-main/20 to-purple-light/20 border-b border-light-grey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-card rounded-lg p-3 shadow-sm">
              <WeatherIcon className="text-purple-light w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-text-gray">Today's Weather</p>
              <p className="font-semibold text-foreground">
                {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}, {weather.temperature}°F
              </p>
            </div>
          </div>
          <Button 
            onClick={onGenerateOutfit}
            className="text-white hover:bg-primary-dark transition-colors text-sm font-medium bg-purple-main"
          >
            <span className="mr-2">✨</span>
            Get Outfit Ideas
          </Button>
        </div>
      </div>
    </div>
  );
}
