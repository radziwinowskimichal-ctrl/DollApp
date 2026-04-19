"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { translations } from "@/lib/translations";
import { DynamicText } from "@/components/DynamicText";
import { Plus, Edit, Search, Building2, User as UserIcon, AlertCircle, Eye } from "lucide-react";
import { Client } from "@/lib/store";
import { toast } from "sonner";

export function ClientList() {
  const { clients, reservations, addClient, updateClient, language } = useApp();
  const t = translations[language as keyof typeof translations] || translations.pl;

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<"private" | "company">("private");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [nip, setNip] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.phone && c.phone.includes(searchTerm)) ||
    (c.nip && c.nip.includes(searchTerm))
  );

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setName(client.name);
      setType(client.type);
      setPhone(client.phone || "");
      setEmail(client.email || "");
      setNip(client.nip || "");
      setAddress(client.address || "");
      setNotes(client.notes || "");
    } else {
      setEditingClient(null);
      setName("");
      setType("private");
      setPhone("");
      setEmail("");
      setNip("");
      setAddress("");
      setNotes("");
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!name) {
      toast.error(t.provideClientName);
      return;
    }

    const clientData: Client = {
      id: editingClient ? editingClient.id : Math.random().toString(36).substring(7),
      name,
      type,
      phone: phone || undefined,
      email: email || undefined,
      nip: nip || undefined,
      address: address || undefined,
      notes,
      balance: editingClient ? editingClient.balance : 0,
    };

    if (editingClient) {
      updateClient(clientData);
      toast.success(t.clientUpdated);
    } else {
      addClient(clientData);
      toast.success(t.clientAdded);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 bg-slate-50 p-2 rounded-xl border">
        <div className="relative flex-1 max-w-sm ml-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder={t.searchClients}
            className="pl-10 h-10 border-none bg-transparent focus-visible:ring-0 shadow-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => handleOpenDialog()} className="rounded-lg h-10 font-black uppercase tracking-tighter px-6 shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          {t.newClient || "Neuer Kunde"}
        </Button>
      </div>

      <div className="overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="text-[10px] font-black uppercase tracking-wider h-12 text-slate-500">{t.client}</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider h-12 text-slate-500">{t.phone} / {t.email}</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider h-12 text-slate-500">{t.balanceHeader || "Saldo"}</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider h-12 text-slate-500">{t.notes}</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider h-12 text-slate-500">{t.lastInvoices}</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider h-12 text-slate-500 text-center">{t.clientType}</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider h-12 text-slate-500 text-center">{t.status}</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider h-12 text-slate-500 text-right">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => {
              const clientReservations = reservations.filter(r => r.clientId === client.id);
              const isActive = clientReservations.some(r => r.status !== "completed" && r.status !== "cancelled");
              
              return (
                <TableRow key={client.id} className="group hover:bg-slate-50/50 transition-colors border-b">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                        {client.type === "company" ? (
                          <Building2 className="w-5 h-5 text-slate-600" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-black text-sm text-slate-900 leading-none">
                          {client.name}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1 truncate">
                          {client.type === "company" ? t.company : t.privatePerson} {client.nip && `• ${client.nip}`}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-[11px] font-bold leading-tight">
                      <span className="text-slate-800">{client.phone || "-"}</span>
                      {client.email && <span className="text-slate-400 font-medium">{client.email}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <span className={cn(
                         "text-sm font-black",
                         client.balance < 0 ? "text-rose-600" : "text-emerald-600"
                       )}>
                         {client.balance} €
                       </span>
                       {client.balance < 0 && <AlertCircle className="w-4 h-4 text-rose-500 fill-rose-50" />}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    <div className="text-[11px] font-medium text-slate-600 leading-relaxed line-clamp-2">
                      {client.notes ? <DynamicText text={client.notes} /> : <span className="italic text-slate-300 font-bold uppercase tracking-tighter">{t.noNotes}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {clientReservations.slice(-2).map(res => (
                        <div key={res.id} className="text-[9px] font-black bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          {res.invoiceNumber || "PROMA"}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                        {client.type === "company" ? (
                          <>
                            <Building2 className="w-3.5 h-3.5 opacity-40" />
                            <span>{t.company}</span>
                          </>
                        ) : (
                          <>
                            <UserIcon className="w-3.5 h-3.5 opacity-40" />
                            <span>{t.privatePerson}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={cn(
                      "rounded-full px-3 py-0 h-5 text-[9px] font-black uppercase tracking-tighter border-none shadow-none",
                      isActive 
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" 
                        : "bg-slate-100 text-slate-500 hover:bg-slate-100"
                    )}>
                      {isActive ? t.activeStatus : t.inactiveStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleOpenDialog(client)}>
                        <Edit className="h-4 w-4 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <Eye className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredClients.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">
                  {t.clientNotFound}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingClient ? t.editClient : t.newClient}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t.clientType}</Label>
                <Select value={type} onValueChange={(v) => v && setType(v as "private" | "company")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">{t.privatePerson}</SelectItem>
                    <SelectItem value="company">{t.company}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clientName">{type === "company" ? t.companyName : t.fullName}</Label>
                <Input 
                  id="clientName" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder={type === "company" ? t.companyNamePlaceholder : t.personNamePlaceholder}
                />
              </div>
            </div>

            {type === "company" && (
              <div className="grid gap-2">
                <Label htmlFor="nip">{t.nip}</Label>
                <Input id="nip" value={nip} onChange={(e) => setNip(e.target.value)} placeholder="000-000-00-00" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">{t.phone}</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+49 ..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">{t.streetAndNumber}, {t.postalCodeAndCity}</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">{t.notes}</Label>
              <Textarea 
                id="notes" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                className="resize-none h-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t.cancel}</Button>
            <Button onClick={handleSave}>{editingClient ? t.saveChanges : t.saveClient}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
