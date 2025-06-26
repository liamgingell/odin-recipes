import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, Users, Sparkles, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { CalendarEvent } from "@shared/schema";

interface CalendarEventsProps {
  onEventSelect?: (event: CalendarEvent) => void;
}

export function CalendarEvents({ onEventSelect }: CalendarEventsProps) {
  const [generatingForEvent, setGeneratingForEvent] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get upcoming events (next 7 days)
  const startDate = new Date().toISOString();
  const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/calendar-events", startDate, endDate],
    queryFn: () => api.getCalendarEvents(startDate, endDate),
  });

  const syncEventsMutation = useMutation({
    mutationFn: () => api.syncCalendarEvents(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar-events"] });
      toast({
        title: "Calendar synced!",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateOutfitMutation = useMutation({
    mutationFn: (eventId: string) => api.generateEventOutfitSuggestions(eventId),
    onSuccess: (suggestions, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/outfit-suggestions"] });
      setGeneratingForEvent(null);
      toast({
        title: "Outfit suggestions generated!",
        description: `Created ${suggestions.length} outfit suggestions for your event.`,
      });
    },
    onError: (error, eventId) => {
      setGeneratingForEvent(null);
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateOutfit = (event: CalendarEvent) => {
    setGeneratingForEvent(event.eventId);
    generateOutfitMutation.mutate(event.eventId);
  };

  const formatEventTime = (startTime: string, endTime: string, isAllDay: boolean) => {
    if (isAllDay) return "All day";
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    return `${start.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })} - ${end.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`;
  };

  const formatEventDate = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (eventDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getEventTypeColor = (eventType: string | null) => {
    switch (eventType) {
      case 'work': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'formal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'exercise': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'social': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'outdoor': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-purple-main" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">Upcoming Events</h2>
            <p className="text-sm text-muted-foreground">
              {events.length} events in the next 7 days
            </p>
          </div>
        </div>
        <Button
          onClick={() => syncEventsMutation.mutate()}
          disabled={syncEventsMutation.isPending}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${syncEventsMutation.isPending ? 'animate-spin' : ''}`} />
          <span>Sync Calendar</span>
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No upcoming events</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Sync your calendar to see upcoming events and get personalized outfit suggestions.
            </p>
            <Button
              onClick={() => syncEventsMutation.mutate()}
              disabled={syncEventsMutation.isPending}
              className="bg-purple-main hover:bg-primary-dark"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncEventsMutation.isPending ? 'animate-spin' : ''}`} />
              Sync Calendar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card 
              key={event.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onEventSelect?.(event)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-medium">{event.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatEventDate(event.startTime)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatEventTime(event.startTime, event.endTime, event.isAllDay)}</span>
                      </span>
                    </CardDescription>
                  </div>
                  {event.eventType && (
                    <Badge 
                      variant="secondary" 
                      className={`${getEventTypeColor(event.eventType)} text-xs`}
                    >
                      {event.eventType}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {event.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </span>
                      )}
                      {event.attendees && Array.isArray(event.attendees) && event.attendees.length > 0 && (
                        <span className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{event.attendees.length} attendees</span>
                        </span>
                      )}
                    </div>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateOutfit(event);
                      }}
                      disabled={generatingForEvent === event.eventId}
                      size="sm"
                      className="bg-purple-main hover:bg-primary-dark text-xs"
                    >
                      {generatingForEvent === event.eventId ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3 mr-1" />
                      )}
                      Get Outfit Ideas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}