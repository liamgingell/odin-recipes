import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { OutfitSuggestions } from "@/components/outfit-suggestions";
import { CalendarEvents } from "@/components/calendar-events";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CalendarEvent } from "@shared/schema";

export default function Suggestions() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Smart Suggestions</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered outfit recommendations based on weather, events, and your wardrobe
          </p>
        </div>
        
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General Suggestions</TabsTrigger>
            <TabsTrigger value="events">Event-Based</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <OutfitSuggestions />
          </TabsContent>
          
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <CalendarEvents onEventSelect={setSelectedEvent} />
              </div>
              <div>
                {selectedEvent ? (
                  <div className="space-y-4">
                    <div className="bg-card rounded-lg p-4 border">
                      <h3 className="font-medium text-foreground mb-2">Selected Event</h3>
                      <h4 className="text-lg font-semibold text-foreground">{selectedEvent.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedEvent.startTime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                      {selectedEvent.description && (
                        <p className="text-sm text-muted-foreground mt-2">{selectedEvent.description}</p>
                      )}
                    </div>
                    <OutfitSuggestions eventFilter={selectedEvent.eventId} />
                  </div>
                ) : (
                  <div className="bg-card rounded-lg p-8 border text-center">
                    <h3 className="text-lg font-medium text-foreground mb-2">Select an Event</h3>
                    <p className="text-muted-foreground">
                      Choose an event from your calendar to see personalized outfit suggestions
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
