"use client";

import { useApp } from "@/lib/context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { translations } from "@/lib/translations";
import { DynamicText } from "@/components/DynamicText";

export function ClientList() {
  const { clients, reservations, language } = useApp();
  const t = translations[language as keyof typeof translations] || translations.pl;

  return (
    <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.client}</TableHead>
            <TableHead>{t.balance}</TableHead>
            <TableHead>{t.notes}</TableHead>
            <TableHead>{t.recentInvoices}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const clientReservations = reservations.filter(r => r.clientId === client.id);
            
            return (
              <TableRow key={client.id}>
                <TableCell className="font-medium">
                  {client.name}
                  {client.type === "company" && <span className="ml-2 text-xs text-muted-foreground">({t.company})</span>}
                </TableCell>
                <TableCell>
                  <Badge variant={client.balance > 0 ? "destructive" : "secondary"}>
                    {client.balance} €
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                  {client.notes ? <DynamicText text={client.notes} /> : <span className="italic">{t.noNotes}</span>}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {clientReservations.map(res => (
                      <Badge key={res.id} variant="outline" className="text-xs">
                        {res.invoiceNumber || t.none}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
