"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/context";
import { format, parseISO } from "date-fns";
import { pl, enUS, de } from "date-fns/locale";
import { translations } from "@/lib/translations";
import { badgeColorClassMap } from "@/lib/colors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, User, Calendar, FileText, CheckCircle2, Search, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Reservation, Trailer, Client } from "@/lib/store";
import { PrintableAgreement } from "./PrintableAgreement";
import { PrintableReturnProtocol } from "./PrintableReturnProtocol";
import { Printer, Camera } from "lucide-react";
import { printDocument } from "@/lib/print";
import { toast } from "sonner";

export function Archive() {
  const { trailers, clients, reservations, language, statusColors } = useApp();
  const t = translations[language as keyof typeof translations] || translations.pl;
  const dateLocale = language === 'pl' ? pl : language === 'de' ? de : enUS;

  const [searchTerm, setSearchTerm] = useState("");

  const getFilteredReservations = (status: string) => {
    return reservations
      .filter(r => r.status === status)
      .filter(res => {
        const trailer = trailers.find(t => t.id === res.trailerId);
        const client = clients.find(c => c.id === res.clientId);
        
        const searchString = `${trailer?.plate} ${client?.name} ${res.invoiceNumber} ${res.defectNote}`.toLowerCase();
        return searchString.includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
  };

  const completedReservations = getFilteredReservations("completed");
  const cancelledReservations = getFilteredReservations("cancelled");

  const [printAgreementRes, setPrintAgreementRes] = useState<Reservation | null>(null);
  const [printProtocolRes, setPrintProtocolRes] = useState<Reservation | null>(null);
  const [viewPhotos, setViewPhotos] = useState<{urls: string[], type: string} | null>(null);

  const handlePrintAgreement = (res: Reservation) => {
    setPrintProtocolRes(null);
    setPrintAgreementRes(res);
    setTimeout(() => {
      const success = printDocument('print-area', t.printAgreementTitle || 'Agreement');
      if (!success) toast.error(t.popupBlockedError);
      setTimeout(() => setPrintAgreementRes(null), 1000);
    }, 500); // give time for portals to render DOM elements
  };

  const handlePrintProtocol = (res: Reservation) => {
    setPrintAgreementRes(null);
    setPrintProtocolRes(res);
    setTimeout(() => {
      const success = printDocument('print-area-return', 'Protocol');
      if (!success) toast.error(t.popupBlockedError);
      setTimeout(() => setPrintProtocolRes(null), 1000);
    }, 500);
  };

  const renderReservationCard = (res: Reservation) => {
    const trailer = trailers.find(t => t.id === res.trailerId);
    const client = clients.find(c => c.id === res.clientId);
    const statusColor = statusColors[res.status as keyof typeof statusColors] || "slate";

    return (
      <Card key={res.id} className="overflow-hidden transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row">
          <div className="bg-muted/30 p-6 md:w-1/3 border-b md:border-b-0 md:border-r flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Truck className="w-5 h-5" />
              <h3 className="font-bold text-lg">{trailer?.plate}</h3>
            </div>
            <Badge variant="outline" className="w-fit mb-2">
              {trailer ? t.trailerTypes[trailer.type as keyof typeof t.trailerTypes] : ''}
            </Badge>
          </div>
          
          <div className="p-6 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{client?.name}</p>
                  <p className="text-sm text-muted-foreground">{client?.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p><span className="text-muted-foreground">{t.startDate}:</span> {format(parseISO(res.startDate), "PPP, HH:mm", { locale: dateLocale })}</p>
                  <p><span className="text-muted-foreground">{t.endDate}:</span> {format(parseISO(res.endDate), "PPP, HH:mm", { locale: dateLocale })}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={cn("px-2.5 py-0.5 font-medium", badgeColorClassMap[statusColor])}>
                  {String(t[res.status as keyof typeof t] || res.status)}
                </Badge>
              </div>

              {res.invoiceNumber && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="text-muted-foreground">{t.invoiceNumber}</p>
                    <p className="font-medium">{res.invoiceNumber}</p>
                  </div>
                </div>
              )}

              {res.defectNote && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="text-muted-foreground">{t.defectNote}</p>
                    <p className="font-medium text-destructive">{res.defectNote}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {res.history && res.history.length > 0 && (
          <div className="px-6 pb-6 pt-0">
             <div className="p-3 bg-muted/50 rounded-lg space-y-2 border border-muted-foreground/10">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.history}</h4>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                   {res.history.map((entry, idx) => (
                      <div key={entry.id || idx} className="text-[11px] flex items-center gap-2">
                         <span className="text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-muted-foreground/10 tabular-nums shrink-0">
                            {format(parseISO(entry.timestamp), "dd.MM.yyyy HH:mm")}
                         </span>
                         <div className="flex-1 truncate">
                            <span className="font-bold text-primary">
                               {entry.profileName}
                            </span>
                            <span className="mx-1 text-muted-foreground">{t.by ? "" : ":"}</span>
                            <span className="text-foreground">
                               {typeof t[`action${entry.action}` as keyof typeof t] === 'string' 
                                 ? (t[`action${entry.action}` as keyof typeof t] as string) 
                                 : entry.action}
                            </span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* Document Actions */}
        {(res.agreement || res.protocol || res.pickupPhotos || res.returnPhotos) && (
          <div className="bg-muted/10 border-t p-4 flex gap-3 justify-end items-center flex-wrap">
            <span className="text-sm text-muted-foreground mr-auto pl-2">{t.savedDocuments}:</span>
            {res.pickupPhotos && res.pickupPhotos.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => setViewPhotos({urls: res.pickupPhotos!, type: t.release})} className="gap-2">
                <Camera className="w-4 h-4" />
                {t.photos} ({t.release})
              </Button>
            )}
            {res.returnPhotos && res.returnPhotos.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => setViewPhotos({urls: res.returnPhotos!, type: t.return})} className="gap-2">
                <Camera className="w-4 h-4" />
                {t.photos} ({t.return})
              </Button>
            )}
            {res.agreement && (
              <Button size="sm" variant="outline" onClick={() => handlePrintAgreement(res)} className="gap-2">
                <Printer className="w-4 h-4" />
                {t.printProtocol} ({t.release})
              </Button>
            )}
            {res.protocol && (
              <Button size="sm" variant="outline" onClick={() => handlePrintProtocol(res)} className="gap-2">
                <Printer className="w-4 h-4" />
                {t.printProtocol} ({t.return})
              </Button>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t.archive}</h2>
          <p className="text-muted-foreground">{t.archiveDesc}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t.searchArchive}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="completed" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="completed">{t.completed}</TabsTrigger>
          <TabsTrigger value="cancelled">{t.cancelled}</TabsTrigger>
        </TabsList>
        <TabsContent value="completed">
          <div className="grid gap-4">
            {completedReservations.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground font-medium">{t.noArchiveEntries}</p>
              </div>
            ) : (
              completedReservations.map(renderReservationCard)
            )}
          </div>
        </TabsContent>
        <TabsContent value="cancelled">
          <div className="grid gap-4">
            {cancelledReservations.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                <XCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground font-medium">{t.noArchiveEntries}</p>
              </div>
            ) : (
              cancelledReservations.map(renderReservationCard)
            )}
          </div>
        </TabsContent>
      </Tabs>

      {printAgreementRes && printAgreementRes.agreement && clients.find(c => c.id === printAgreementRes.clientId) && trailers.find(t => t.id === printAgreementRes.trailerId) && (
        <PrintableAgreement 
          reservation={printAgreementRes}
          client={clients.find(c => c.id === printAgreementRes.clientId)!}
          trailer={trailers.find(t => t.id === printAgreementRes.trailerId)!}
          agreement={printAgreementRes.agreement}
        />
      )}
      
      {printProtocolRes && printProtocolRes.protocol && clients.find(c => c.id === printProtocolRes.clientId) && trailers.find(t => t.id === printProtocolRes.trailerId) && (
        <PrintableReturnProtocol 
          reservation={printProtocolRes}
          client={clients.find(c => c.id === printProtocolRes.clientId)!}
          trailer={trailers.find(t => t.id === printProtocolRes.trailerId)!}
        />
      )}

      {/* View Photos Dialog */}
      <Dialog open={!!viewPhotos} onOpenChange={(open) => !open && setViewPhotos(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.visualDocumentationPickup.split(" (")[0]} ({viewPhotos?.type})</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
            {viewPhotos?.urls.map((photo, i) => (
              <a href={photo} target="_blank" rel="noopener noreferrer" key={i} className="block aspect-square overflow-hidden rounded-md border hover:opacity-90 transition-opacity">
                <Image src={photo} alt={`Photo ${i}`} width={400} height={400} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
