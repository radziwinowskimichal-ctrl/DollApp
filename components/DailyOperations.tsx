"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { isToday, parseISO, format } from "date-fns";
import { translations } from "@/lib/translations";
import { badgeColorClassMap } from "@/lib/colors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, User, Phone, Mail, FileText, CheckCircle2, CalendarCheck, CalendarX, FileSignature } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ReleaseTrailerDialog } from "./ReleaseTrailerDialog";
import { ReturnTrailerDialog } from "./ReturnTrailerDialog";
import { Reservation } from "@/lib/store";

export function DailyOperations() {
  const { trailers, clients, reservations, language, updateReservation, statusColors } = useApp();
  const t = translations[language as keyof typeof translations] || translations.pl;

  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const todayPickups = reservations.filter(r => isToday(parseISO(r.startDate)) && r.status !== "completed" && r.status !== "active" && r.status !== "cancelled");
  const todayReturns = reservations.filter(r => isToday(parseISO(r.endDate)) && r.status !== "completed" && r.status !== "cancelled");

  const handleComplete = (res: Reservation) => {
    setSelectedReservation(res);
    setReturnDialogOpen(true);
  };

  const handleRelease = (res: Reservation) => {
    setSelectedReservation(res);
    setReleaseDialogOpen(true);
  };

  const renderReservationCard = (res: Reservation, isPickup: boolean) => {
    const trailer = trailers.find(t => t.id === res.trailerId);
    const client = clients.find(c => c.id === res.clientId);

    return (
      <Card key={res.id} className="overflow-hidden transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row">
          <div className="bg-muted/30 p-6 md:w-1/3 border-b md:border-b-0 md:border-r flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Truck className="w-5 h-5" />
              <h3 className="font-bold text-lg">{trailer?.plate}</h3>
            </div>
            <Badge variant="outline" className="w-fit mb-4">
              {trailer ? t.trailerTypes[trailer.type as keyof typeof t.trailerTypes] : ''}
            </Badge>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{t.capacity}: {trailer?.capacity}</p>
              <p>{t.dimensions}: {trailer?.dimensions}</p>
            </div>
          </div>
          
          <div className="p-6 md:w-2/3 flex flex-col justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  {t.clientDetails}
                </h4>
                <div className="space-y-2">
                  <p className="font-medium">{client?.name} {client?.type === 'company' ? `(${t.company})` : ''}</p>
                  {client?.phone && (
                    <p className="text-sm flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3 h-3" /> {client.phone}
                    </p>
                  )}
                  {client?.email && (
                    <p className="text-sm flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-3 h-3" /> {client.email}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  {t.reservationDetails}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={cn(badgeColorClassMap[statusColors[res.status as keyof typeof statusColors]])}
                    >
                      {res.status === 'paid' && t.paid}
                      {res.status === 'invoiced' && t.invoiced}
                      {res.status === 'defect' && t.defect}
                      {res.status === 'active' && 'W trakcie'}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">
                    {isPickup ? t.pickupTime : t.returnTime}: {format(parseISO(isPickup ? res.startDate : res.endDate), "HH:mm")}
                  </p>
                  {res.invoiceNumber && (
                    <p className="text-sm text-muted-foreground">{t.invoiceNumber}: {res.invoiceNumber}</p>
                  )}
                  {res.defectNote && (
                    <p className="text-sm text-destructive">{t.defectNote}: {res.defectNote}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-auto pt-4 border-t gap-2">
              {isPickup ? (
                <Button onClick={() => handleRelease(res)} className="gap-2">
                  <FileSignature className="w-4 h-4" />
                  {t.releaseTrailer}
                </Button>
              ) : (
                <Button onClick={() => handleComplete(res)} className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {t.markAsCompleted}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pickups" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="pickups" className="gap-2">
            <CalendarCheck className="w-4 h-4" />
            {t.pickupsList} ({todayPickups.length})
          </TabsTrigger>
          <TabsTrigger value="returns" className="gap-2">
            <CalendarX className="w-4 h-4" />
            {t.returnsList} ({todayReturns.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pickups" className="space-y-4">
          {todayPickups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">
              <CalendarCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>{t.noPickupsToday}</p>
            </div>
          ) : (
            todayPickups.map(res => renderReservationCard(res, true))
          )}
        </TabsContent>
        
        <TabsContent value="returns" className="space-y-4">
          {todayReturns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">
              <CalendarX className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>{t.noReturnsToday}</p>
            </div>
          ) : (
            todayReturns.map(res => renderReservationCard(res, false))
          )}
        </TabsContent>
      </Tabs>

      <ReleaseTrailerDialog 
        reservation={selectedReservation} 
        isOpen={releaseDialogOpen} 
        onClose={() => setReleaseDialogOpen(false)} 
      />
      <ReturnTrailerDialog 
        reservation={selectedReservation} 
        isOpen={returnDialogOpen} 
        onClose={() => setReturnDialogOpen(false)} 
      />
    </div>
  );
}
