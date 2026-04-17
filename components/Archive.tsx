"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { format, parseISO } from "date-fns";
import { pl, enUS, de } from "date-fns/locale";
import { translations } from "@/lib/translations";
import { badgeColorClassMap } from "@/lib/colors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, User, Calendar, FileText, CheckCircle2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function Archive() {
  const { trailers, clients, reservations, language, statusColors } = useApp();
  const t = translations[language as keyof typeof translations] || translations.pl;
  const dateLocale = language === 'pl' ? pl : language === 'de' ? de : enUS;

  const [searchTerm, setSearchTerm] = useState("");

  const completedReservations = reservations.filter(r => r.status === "completed");

  const filteredReservations = completedReservations.filter(res => {
    const trailer = trailers.find(t => t.id === res.trailerId);
    const client = clients.find(c => c.id === res.clientId);
    
    const searchString = `${trailer?.plate} ${client?.name} ${res.invoiceNumber} ${res.defectNote}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  }).sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

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

      <div className="grid gap-4">
        {filteredReservations.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
            <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground font-medium">{t.noArchiveEntries}</p>
          </div>
        ) : (
          filteredReservations.map((res) => {
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
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
