"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/lib/context";
import { isToday, isBefore, addDays, parseISO, compareAsc, format } from "date-fns";
import { AlertTriangle, CalendarCheck, CalendarX, Wrench, ArrowDownLeft, ArrowUpRight, Ban, Truck } from "lucide-react";
import { translations } from "@/lib/translations";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DashboardProps {
  onActionClick?: (action: string) => void;
}

export function Dashboard({ onActionClick }: DashboardProps) {
  const { trailers, reservations, language } = useApp();
  const t = translations[language as keyof typeof translations] || translations.pl;
  
  const [isTuvDialogOpen, setIsTuvDialogOpen] = useState(false);

  const today = new Date();
  
  const todayPickups = reservations.filter(r => isToday(parseISO(r.startDate)) && r.status !== "completed" && r.status !== "cancelled");
  const todayReturns = reservations.filter(r => isToday(parseISO(r.endDate)) && r.status !== "completed" && r.status !== "cancelled");
  const inService = trailers.filter(t => t.status === "service");
  
  const upcomingTuv = trailers.filter(t => {
    if (!t.tuvExpiry) return false;
    const tuvDate = parseISO(t.tuvExpiry);
    return isBefore(tuvDate, addDays(today, 30));
  });

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 px-4 overflow-visible">
      {/* Pickups Card */}
      <Card 
        className="group relative cursor-pointer transition-all hover:scale-[1.02] border-none bg-white shadow-xl shadow-blue-900/5 h-36" 
        onClick={() => onActionClick?.("daily")}
      >
        <div className="absolute inset-0 bg-blue-50/50 rounded-xl" />
        <CardContent className="relative h-full p-6 flex items-center justify-between overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-900">{t.pickups}</span>
            <div className="text-4xl font-black text-blue-950">{todayPickups.length}</div>
            <p className="text-[8px] font-bold uppercase tracking-tighter text-blue-800/60">
              {t.pickupsToday}
            </p>
          </div>
          <div className="relative">
             <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full" />
             <div className="relative flex items-end gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
                <Truck className="w-12 h-12 text-blue-600" />
                <ArrowDownLeft className="w-8 h-8 text-blue-600 -ml-4 mb-2" />
             </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Returns Card */}
      <Card 
        className="group relative cursor-pointer transition-all hover:scale-[1.02] border-none bg-white shadow-xl shadow-emerald-900/5 h-36"
        onClick={() => onActionClick?.("daily")}
      >
        <div className="absolute inset-0 bg-emerald-50/50 rounded-xl" />
        <CardContent className="relative h-full p-6 flex items-center justify-between overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900">{t.returns}</span>
            <div className="text-4xl font-black text-emerald-950">{todayReturns.length}</div>
            <p className="text-[8px] font-bold uppercase tracking-tighter text-emerald-800/60">
              {t.returnsToday}
            </p>
          </div>
          <div className="relative flex items-end gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
            <Truck className="w-12 h-12 text-emerald-600" />
            <ArrowUpRight className="w-8 h-8 text-emerald-600 -ml-4 mb-2" />
          </div>
        </CardContent>
      </Card>

      {/* In Service Card */}
      <Card 
        className="group relative cursor-pointer transition-all hover:scale-[1.02] border-none bg-white shadow-xl shadow-sky-900/5 h-36"
        onClick={() => onActionClick?.("trailers")}
      >
        <div className="absolute inset-0 bg-sky-50/50 rounded-xl" />
        <CardContent className="relative h-full p-6 flex items-center justify-between overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-900">{t.service}</span>
            <div className="text-4xl font-black text-sky-950">{inService.length}</div>
            <p className="text-[8px] font-bold tracking-tighter text-sky-800/60 uppercase">
              {inService.map(t => t.plate || t.model || t.type).join(", ").slice(0, 20) || t.none}
            </p>
          </div>
          <div className="flex items-center gap-1 opacity-30 group-hover:opacity-50 transition-opacity rotate-[-10deg]">
            <Wrench className="w-10 h-10 text-sky-600" />
            <Truck className="w-12 h-12 text-sky-600 -ml-2" />
          </div>
        </CardContent>
      </Card>

      {/* TÜV Card */}
      <Card 
        className="group relative cursor-pointer transition-all hover:scale-[1.05] border-none bg-white shadow-[0_15px_60px_-15px_rgba(239,68,68,0.4)] h-36 border-2 border-rose-500/20"
        onClick={() => setIsTuvDialogOpen(true)}
      >
        <div className="absolute inset-0 bg-rose-50 rounded-xl" />
        <CardContent className="relative h-full p-6 flex items-center justify-between overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-900">{t.tuvWarning}</span>
            <div className="text-4xl font-black text-rose-600 drop-shadow-sm">{upcomingTuv.length}</div>
            <p className="text-[8px] font-bold uppercase tracking-tighter text-rose-800/60">
              {t.within30Days}
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full animate-pulse" />
            <div className="relative">
              <AlertTriangle className="w-12 h-12 text-rose-600" />
              <Ban className="w-6 h-6 text-rose-700 absolute -bottom-1 -right-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isTuvDialogOpen} onOpenChange={setIsTuvDialogOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{t.tuvExpiring}</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg bg-card text-card-foreground shadow-sm overflow-x-auto mt-4 max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.plate}</TableHead>
                  <TableHead>{t.model}</TableHead>
                  <TableHead>{t.type}</TableHead>
                  <TableHead>{t.vin}</TableHead>
                  <TableHead>{t.tuvExpiry}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.notes}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...trailers]
                  .filter(t => t.tuvExpiry)
                  .sort((a, b) => compareAsc(parseISO(a.tuvExpiry!), parseISO(b.tuvExpiry!)))
                  .map((trailer) => {
                   const isExpired = isBefore(parseISO(trailer.tuvExpiry!), today);
                   const isExpiringSoon = isBefore(parseISO(trailer.tuvExpiry!), addDays(today, 30));
                   return (
                     <TableRow key={trailer.id}>
                       <TableCell className="font-medium whitespace-nowrap">
                         {trailer.plate || <span className="italic text-muted-foreground">{t.noPlate}</span>}
                       </TableCell>
                       <TableCell className="max-w-[150px] truncate" title={trailer.model}>{trailer.model || "-"}</TableCell>
                       <TableCell className="max-w-[200px] truncate" title={t.trailerTypes[trailer.type as keyof typeof t.trailerTypes] || trailer.type}>
                        {t.trailerTypes[trailer.type as keyof typeof t.trailerTypes] || trailer.type}
                       </TableCell>
                       <TableCell className="font-mono text-xs">{trailer.vin || "-"}</TableCell>
                       <TableCell className={`whitespace-nowrap ${isExpired ? "text-destructive font-bold" : isExpiringSoon ? "text-amber-500 font-medium" : ""}`}>
                         {format(parseISO(trailer.tuvExpiry!), "dd.MM.yyyy")}
                       </TableCell>
                       <TableCell>
                         <Badge variant={trailer.status === "available" ? "default" : "destructive"}>
                           {trailer.status === "available" ? t.available : t.service}
                         </Badge>
                       </TableCell>
                       <TableCell className="max-w-[200px] text-xs text-muted-foreground">
                        {trailer.notes || "-"}
                       </TableCell>
                     </TableRow>
                   );
                })}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
