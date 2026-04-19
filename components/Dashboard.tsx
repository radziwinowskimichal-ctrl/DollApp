"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/lib/context";
import { isToday, isBefore, addDays, parseISO, compareAsc, format } from "date-fns";
import { AlertTriangle, CalendarCheck, CalendarX, Wrench } from "lucide-react";
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
    const tuvDate = parseISO(t.tuvExpiry);
    return isBefore(tuvDate, addDays(today, 30));
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card 
        className="cursor-pointer transition-colors hover:bg-muted/50" 
        onClick={() => onActionClick?.("daily")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t.pickupsToday}</CardTitle>
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayPickups.length}</div>
          <p className="text-xs text-muted-foreground">
            {t.trailersToPickup}
          </p>
        </CardContent>
      </Card>
      
      <Card 
        className="cursor-pointer transition-colors hover:bg-muted/50"
        onClick={() => onActionClick?.("daily")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t.returnsToday}</CardTitle>
          <CalendarX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayReturns.length}</div>
          <p className="text-xs text-muted-foreground">
            {t.trailersToReturn}
          </p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer transition-colors hover:bg-muted/50"
        onClick={() => onActionClick?.("trailers")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t.inService}</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inService.length}</div>
          <p className="text-xs text-muted-foreground">
            {inService.map(t => t.plate).join(", ") || t.none}
          </p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer transition-colors hover:bg-muted/50"
        onClick={() => setIsTuvDialogOpen(true)}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t.tuvExpiring}</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingTuv.length}</div>
          <p className="text-xs text-muted-foreground">
            {t.next30Days}
          </p>
        </CardContent>
      </Card>

      <Dialog open={isTuvDialogOpen} onOpenChange={setIsTuvDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t.tuvExpiring}</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg bg-card text-card-foreground shadow-sm overflow-x-auto mt-4 max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.plate}</TableHead>
                  <TableHead>{t.type}</TableHead>
                  <TableHead>{t.tuvExpiry}</TableHead>
                  <TableHead>{t.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...trailers].sort((a, b) => compareAsc(parseISO(a.tuvExpiry), parseISO(b.tuvExpiry))).map((trailer) => {
                   const isExpired = isBefore(parseISO(trailer.tuvExpiry), today);
                   const isExpiringSoon = isBefore(parseISO(trailer.tuvExpiry), addDays(today, 30));
                   return (
                     <TableRow key={trailer.id}>
                       <TableCell className="font-medium">{trailer.plate}</TableCell>
                       <TableCell>{t.trailerTypes[trailer.type as keyof typeof t.trailerTypes]}</TableCell>
                       <TableCell className={isExpired ? "text-destructive font-bold" : isExpiringSoon ? "text-amber-500 font-medium" : ""}>
                         {format(parseISO(trailer.tuvExpiry), "dd.MM.yyyy")}
                       </TableCell>
                       <TableCell>
                         <Badge variant={trailer.status === "available" ? "default" : "destructive"}>
                           {trailer.status === "available" ? t.available : t.service}
                         </Badge>
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
