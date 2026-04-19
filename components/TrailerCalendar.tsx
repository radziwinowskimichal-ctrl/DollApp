"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/context";
import { colorClassMap, badgeColorClassMap } from "@/lib/colors";
import { format, addDays, startOfToday, parseISO, isWithinInterval, isSameDay } from "date-fns";
import { pl, enUS, de } from "date-fns/locale";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Check, ChevronsUpDown, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { translations } from "@/lib/translations";

export function TrailerCalendar() {
  const { trailers, reservations, clients, addReservation, addClient, language, currentUserId, profiles, updateReservation, deleteReservation, statusColors, checkTrailerAvailability } = useApp();

  const t = translations[language as keyof typeof translations] || translations.pl;
  
  const dateLocale = language === 'pl' ? pl : language === 'de' ? de : enUS;

  const today = startOfToday();
  
  const [startDateOffset, setStartDateOffset] = useState(-1);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [trailerSearch, setTrailerSearch] = useState("");
  
  const viewStartDate = addDays(today, startDateOffset);
  const days = Array.from({ length: 14 }).map((_, i) => addDays(viewStartDate, i));

  const filteredTrailers = trailers.filter(trailer => {
    const matchesFilter = typeFilter === "all" || trailer.type === typeFilter;
    const searchLower = trailerSearch.toLowerCase();
    
    // Get translated type name
    const typeLabel = (t.trailerTypes as any)[trailer.type] || "";
    
    const matchesSearch = 
      (trailer.plate || "").toLowerCase().includes(searchLower) ||
      (trailer.model || "").toLowerCase().includes(searchLower) ||
      typeLabel.toLowerCase().includes(searchLower);
      
    return matchesFilter && matchesSearch;
  });

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditingReservation, setIsEditingReservation] = useState(false);
  const [viewingReservationId, setViewingReservationId] = useState<string | null>(null);
  const [selectedTrailerId, setSelectedTrailerId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Reservation Form state
  const [clientId, setClientId] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [pickupTime, setPickupTime] = useState<string>("08:00");
  const [returnTime, setReturnTime] = useState<string>("17:30");
  const [status, setStatus] = useState<"paid" | "invoiced" | "defect" | "completed" | "active" | "cancelled">("paid");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [defectNote, setDefectNote] = useState<string>("");
  const [clientComboboxOpen, setClientComboboxOpen] = useState(false);

  // New Client Form state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientType, setNewClientType] = useState<"private" | "company">("private");
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientNip, setNewClientNip] = useState("");

  const getReservationsForDay = (trailerId: string, date: Date) => {
    return reservations.filter(r => {
      if (r.trailerId !== trailerId) return false;
      if (r.status === "completed" || r.status === "cancelled") return false;
      const start = parseISO(r.startDate);
      const end = parseISO(r.endDate);
      return isWithinInterval(date, { start, end }) || isSameDay(date, start) || isSameDay(date, end);
    });
  };

  const getStatusColor = (status: string) => {
    const colorKey = statusColors[status as keyof typeof statusColors];
    if (!colorKey) return "bg-blue-500 hover:bg-blue-600 text-white";
    
    return colorClassMap[colorKey] || "bg-blue-500 hover:bg-blue-600 text-white";
  };

  const handleCellClick = (trailerId: string, date: Date) => {
    setSelectedTrailerId(trailerId);
    setSelectedDate(date);
    setEndDate(format(addDays(date, 1), "yyyy-MM-dd"));
    setPickupTime("08:00");
    setReturnTime("17:30");
    setClientId("");
    setStatus("paid");
    setInvoiceNumber("");
    setDefectNote("");
    setIsCreatingClient(false);
    setIsDialogOpen(true);
  };

  const handleReservationClick = (e: React.MouseEvent, resId: string) => {
    e.stopPropagation();
    setViewingReservationId(resId);
    setIsEditingReservation(false);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = () => {
    const res = reservations.find(r => r.id === viewingReservationId);
    if (!res) return;
    
    setSelectedTrailerId(res.trailerId);
    setClientId(res.clientId);
    const start = parseISO(res.startDate);
    const end = parseISO(res.endDate);
    setSelectedDate(start);
    setEndDate(format(end, "yyyy-MM-dd"));
    setPickupTime(format(start, "HH:mm"));
    setReturnTime(format(end, "HH:mm"));
    setStatus(res.status);
    setInvoiceNumber(res.invoiceNumber || "");
    setDefectNote(res.defectNote || "");
    setIsEditingReservation(true);
  };

  const handleUpdateReservation = () => {
    if (!clientId || !endDate || !selectedDate || !selectedTrailerId || !viewingReservationId) {
      toast.error(t.fillAllFields);
      return;
    }

    const startDateTime = new Date(`${format(selectedDate, "yyyy-MM-dd")}T${pickupTime}:00`);
    const endDateTime = new Date(`${endDate}T${returnTime}:00`);
    
    // Check collision
    if (!checkTrailerAvailability(selectedTrailerId, startDateTime, endDateTime, viewingReservationId)) {
      toast.error("Wskazany termin koliduje z inną rezerwacją. Uwzględnij też 60 minut przerwy.");
      return;
    }
    
    const existingRes = reservations.find(r => r.id === viewingReservationId);
    
    // Check if status changed or just general edit
    const isStatusChanged = existingRes?.status !== status;
    const actionType = isStatusChanged ? "status_changed" : "edited";

    updateReservation({
      id: viewingReservationId,
      trailerId: selectedTrailerId,
      clientId,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      status,
      invoiceNumber: invoiceNumber || undefined,
      defectNote: defectNote || undefined,
    }, actionType as any);

    toast.success(t.reservationUpdated);
    setIsEditingReservation(false);
  };

  const handleDeleteReservation = () => {
    if (!viewingReservationId) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteReservation = () => {
    if (!viewingReservationId) return;
    const res = reservations.find(r => r.id === viewingReservationId);
    if (res) {
      updateReservation({
        ...res,
        status: "cancelled",
      }, "cancelled");
      toast.success(t.reservationDeleted);
    }
    setIsDeleteDialogOpen(false);
    setIsViewDialogOpen(false);
  };

  const handleSaveReservation = () => {
    if (!clientId || !endDate || !selectedDate || !selectedTrailerId) {
      toast.error(t.fillAllFields);
      return;
    }

    const startDateTime = new Date(`${format(selectedDate, "yyyy-MM-dd")}T${pickupTime}:00`);
    const endDateTime = new Date(`${endDate}T${returnTime}:00`);

    // Check collision
    if (!checkTrailerAvailability(selectedTrailerId, startDateTime, endDateTime)) {
      toast.error("Wskazany termin koliduje z inną rezerwacją. Uwzględnij też 60 minut przerwy.");
      return;
    }

    addReservation({
      id: Math.random().toString(36).substring(7),
      trailerId: selectedTrailerId,
      clientId,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      status,
      invoiceNumber: invoiceNumber || undefined,
      defectNote: defectNote || undefined,
    });

    toast.success(t.reservationAdded);
    setIsDialogOpen(false);
  };

  const handleSaveNewClient = () => {
    if (!newClientName) {
      toast.error(t.provideClientName);
      return;
    }

    const newClient = {
      id: Math.random().toString(36).substring(7),
      name: newClientName,
      balance: 0,
      notes: "",
      type: newClientType,
      phone: newClientPhone,
      email: newClientEmail,
      nip: newClientType === "company" ? newClientNip : undefined,
    };

    addClient(newClient);
    setClientId(newClient.id);
    setIsCreatingClient(false);
    
    // Reset form
    setNewClientName("");
    setNewClientPhone("");
    setNewClientEmail("");
    setNewClientNip("");
    
    toast.success(t.clientAdded);
  };

  const calendarDaysRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = calendarDaysRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        if (e.deltaY > 0) {
          setStartDateOffset(prev => prev + 1);
        } else if (e.deltaY < 0) {
          setStartDateOffset(prev => prev - 1);
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-3 rounded-xl border">
        <div className="flex items-center gap-2">
          <div className="flex bg-white rounded-lg border shadow-sm p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => setStartDateOffset(prev => prev - 7)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500" onClick={() => setStartDateOffset(-1)}>
              {t.today}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => setStartDateOffset(prev => prev + 7)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v || "all")}>
            <SelectTrigger className="w-[180px] h-10 border-slate-200 bg-white text-[11px] font-bold uppercase tracking-tight">
              <SelectValue placeholder={t.allTypes} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs font-bold uppercase">{t.allTypes}</SelectItem>
              {Object.entries(t.trailerCategories || {}).map(([key, label]) => {
                const categoryTypeMap: Record<string, string[]> = {
                  tarpaulin: ["Planen_Tieflader", "Planen_Hochlader", "Planen_Drehschemel"],
                  box: ["Koffer_Flügeltüre", "Koffer_Rampe", "Koffer_Alu", "Koffer_Deckel", "Koffer_Wielkogabarytowy"],
                  open: ["Offen_Standard", "Offen_Laubgitter"],
                  fridge: ["fridge_unit"],
                  tipper: ["Kipper_Tylny", "Kipper_Trójstronny"],
                  carTransporter: ["Laweta_Uchylna", "Laweta_Platforma", "Maszynowa", "Laweta_Obrotnica"],
                  motorcycle: ["Motocyklowa_Szynowa", "Opuszczana"],
                  horse: ["horse_trailer"],
                  truck: ["LKW_Plane", "LKW_Kipper", "LKW_Tandem"]
                };
                const types = categoryTypeMap[key] || [];
                return (
                  <SelectGroup key={key}>
                    <SelectLabel className="px-2 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">{label}</SelectLabel>
                    {types.map((type) => (
                      <SelectItem key={type} value={type} className="text-xs font-medium">
                        {t.trailerTypes[type as keyof typeof t.trailerTypes]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                );
              })}
              <SelectGroup>
                <SelectLabel className="px-2 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">{t.other || "Inne / Others"}</SelectLabel>
                {["winch", "cableTrailer", "auxWinch", "cablePusher", "compressor"].map((type) => (
                  <SelectItem key={type} value={type} className="text-xs font-medium">
                    {t.trailerTypes[type as keyof typeof t.trailerTypes] || type}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="search"
              placeholder="Fahrzeug suchen..."
              className="pl-9 w-[220px] h-10 border-slate-200 bg-white text-xs font-bold"
              value={trailerSearch}
              onChange={(e) => setTrailerSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {format(days[0], "d MMM yyyy", { locale: dateLocale })} - {format(days[days.length - 1], "d MMM yyyy", { locale: dateLocale })}
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden ring-1 ring-slate-100">
        <ScrollArea className="w-full">
          <div className="flex w-max min-w-full">
            {/* Header Column (Trailers) */}
            <div className="w-56 flex-shrink-0 border-r bg-slate-50/50 sticky left-0 z-20">
              <div className="h-12 border-b flex items-center px-4 font-black text-[10px] uppercase tracking-wider text-slate-500">
                {t.trailer}
              </div>
              {filteredTrailers.map(trailer => (
                <div key={trailer.id} className="h-16 border-b flex flex-col justify-center px-4 bg-white/80 group/trailer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-900 font-mono text-[10px] font-black tracking-tight uppercase">
                      {trailer.plate}
                    </span>
                    {trailer.status === "service" && (
                      <span className="flex h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                    )}
                  </div>
                  <div className="text-[12px] font-black text-slate-800 leading-tight truncate uppercase tracking-tighter">
                    {t.trailerTypes[trailer.type as keyof typeof t.trailerTypes]}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 truncate mt-0.5 uppercase tracking-wide">
                    {trailer.model || trailer.capacity || "-"}
                  </div>
                </div>
              ))}
            </div>

            {/* Days Columns */}
            <div className="flex" ref={calendarDaysRef}>
              {days.map(day => (
              <div key={day.toISOString()} className="w-24 flex-shrink-0 border-r last:border-r-0">
                <div className={cn(
                  "h-12 border-b flex flex-col items-center justify-center transition-colors",
                  isSameDay(day, today) ? "bg-primary/5 border-b-primary/30" : "bg-slate-50/30"
                )}>
                  <div className={cn("text-[9px] font-black uppercase tracking-widest mb-0.5", isSameDay(day, today) ? "text-primary" : "text-slate-400")}>
                    {format(day, "EEE", { locale: dateLocale })}
                  </div>
                  <div className={cn("text-[11px] font-black", isSameDay(day, today) ? "text-primary" : "text-slate-800")}>
                    {format(day, "d MMM", { locale: dateLocale })}
                  </div>
                </div>
                
                {filteredTrailers.map(trailer => {
                  const dayReservations = getReservationsForDay(trailer.id, day);
                  
                  return (
                    <div 
                      key={`${trailer.id}-${day.toISOString()}`} 
                      className="h-16 border-b relative cursor-pointer hover:bg-slate-50/50 transition-colors group"
                      onClick={() => handleCellClick(trailer.id, day)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        <Plus className="h-4 w-4 text-slate-300" />
                      </div>
                      
                      {dayReservations.map(res => {
                        const client = clients.find(c => c.id === res.clientId);
                        const start = parseISO(res.startDate);
                        const end = parseISO(res.endDate);
                        
                        let left = 0;
                        let right = 0;
                        let bufferLeft = 0;
                        let bufferRight = 0;

                        const bufferEnd = new Date(end.getTime() + 60 * 60 * 1000);

                        const getMinutesFrom8AM = (date: Date) => {
                          const hours = date.getHours();
                          const minutes = date.getMinutes();
                          return Math.max(0, Math.min((18 - 8) * 60, (hours - 8) * 60 + minutes));
                        };

                        if (isSameDay(start, day)) {
                          left = (getMinutesFrom8AM(start) / 600) * 100;
                        }
                        if (isSameDay(end, day)) {
                          right = 100 - ((getMinutesFrom8AM(end) / 600) * 100);
                          bufferLeft = (getMinutesFrom8AM(end) / 600) * 100;
                        } else if (end < day && bufferEnd > day) {
                          bufferLeft = 0;
                        } else {
                          bufferLeft = 100;
                        }

                        if (isSameDay(bufferEnd, day)) {
                          bufferRight = 100 - ((getMinutesFrom8AM(bufferEnd) / 600) * 100);
                        } else if (bufferEnd > day) {
                          bufferRight = 0;
                        } else {
                          bufferRight = 100;
                        }

                        const showBuffer = bufferLeft < 100;

                        return (
                          <React.Fragment key={res.id}>
                            {showBuffer && (
                              <div
                                className="absolute rounded bg-slate-100 z-0 opacity-40 border border-slate-200 border-dashed"
                                style={{ left: `calc(${bufferLeft}% + 4px)`, right: `calc(${bufferRight}% + 4px)`, top: '8px', bottom: '8px' }}
                              />
                            )}
                            <div 
                              className={cn(
                                "absolute rounded-md p-1.5 text-[9px] font-black leading-none text-white overflow-hidden z-10 shadow-sm transition-transform active:scale-95 border-b-2 border-black/10",
                                getStatusColor(res.status)
                              )}
                              style={{ left: `calc(${left}% + 4px)`, right: `calc(${right}% + 2px)`, top: '6px', bottom: '6px' }}
                              onClick={(e) => handleReservationClick(e, res.id)}
                            >
                              <div className="truncate uppercase tracking-tighter">{client?.name}</div>
                              <div className="truncate opacity-60 uppercase tracking-widest mt-0.5 text-[7px]">{res.status === 'defect' ? t.service : t.reserved}</div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isCreatingClient ? t.newClient : t.newReservation}</DialogTitle>
            <DialogDescription>
              {!isCreatingClient && selectedTrailerId && trailers.find(t => t.id === selectedTrailerId)?.plate + " - od " + (selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: dateLocale }) : "")}
            </DialogDescription>
          </DialogHeader>
          
          {isCreatingClient ? (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="clientType">{t.clientType}</Label>
                <Select value={newClientType} onValueChange={(v) => v && setNewClientType(v as "private" | "company")}>
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
                <Label htmlFor="clientName">{newClientType === "company" ? t.companyName : t.fullName}</Label>
                <Input 
                  id="clientName" 
                  value={newClientName} 
                  onChange={(e) => setNewClientName(e.target.value)} 
                />
              </div>
              {newClientType === "company" && (
                <div className="grid gap-2">
                  <Label htmlFor="clientNip">{t.nip}</Label>
                  <Input 
                    id="clientNip" 
                    value={newClientNip} 
                    onChange={(e) => setNewClientNip(e.target.value)} 
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="clientPhone">{t.phone}</Label>
                <Input 
                  id="clientPhone" 
                  value={newClientPhone} 
                  onChange={(e) => setNewClientPhone(e.target.value)} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clientEmail">{t.email}</Label>
                <Input 
                  id="clientEmail" 
                  type="email"
                  value={newClientEmail} 
                  onChange={(e) => setNewClientEmail(e.target.value)} 
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2 flex flex-col">
                <Label htmlFor="client">{t.client}</Label>
                <Popover open={clientComboboxOpen} onOpenChange={setClientComboboxOpen}>
                  <PopoverTrigger 
                    className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
                    role="combobox"
                    aria-expanded={clientComboboxOpen}
                  >
                    {clientId
                      ? clients.find((client) => client.id === clientId)?.name
                      : t.selectClient}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="w-[380px] p-0">
                    <Command>
                      <CommandInput placeholder={t.searchClient} />
                      <CommandList>
                        <CommandEmpty>{t.clientNotFound}</CommandEmpty>
                        <CommandGroup>
                          {clients.map((client) => (
                            <CommandItem
                              key={client.id}
                              value={client.name}
                              onSelect={() => {
                                setClientId(client.id);
                                setClientComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  clientId === client.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {client.name}
                              {client.type === "company" && <span className="ml-2 text-xs text-muted-foreground">({t.company})</span>}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                      <div className="p-2 border-t">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-primary" 
                          onClick={() => {
                            setClientComboboxOpen(false);
                            setIsCreatingClient(true);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {t.newClient}
                        </Button>
                      </div>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t.pickupTime}</Label>
                  <Input 
                    type="time" 
                    value={pickupTime} 
                    onChange={(e) => setPickupTime(e.target.value)} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t.returnTime}</Label>
                  <Input 
                    type="time" 
                    value={returnTime} 
                    onChange={(e) => setReturnTime(e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">{t.returnDate}</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  min={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">{t.status}</Label>
                <Select value={status} onValueChange={(v) => v && setStatus(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.status} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">{t.paid}</SelectItem>
                    <SelectItem value="invoiced">{t.invoiced}</SelectItem>
                    <SelectItem value="defect">{t.defect}</SelectItem>
                    <SelectItem value="completed">{t.completed}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            {isCreatingClient ? (
              <>
                <Button variant="outline" onClick={() => setIsCreatingClient(false)}>{t.back}</Button>
                <Button onClick={handleSaveNewClient}>{t.saveClient}</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t.cancel}</Button>
                <Button onClick={handleSaveReservation}>{t.saveReservation}</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Edit Reservation Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditingReservation ? t.edit : t.reservationDetails}</DialogTitle>
          </DialogHeader>
          
          {(() => {
            const res = reservations.find(r => r.id === viewingReservationId);
            if (!res) return null;
            const client = clients.find(c => c.id === res.clientId);
            const trailer = trailers.find(t => t.id === res.trailerId);

            if (isEditingReservation) {
              return (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2 flex flex-col">
                    <Label htmlFor="edit-trailer">{t.trailer}</Label>
                    <Select value={selectedTrailerId} onValueChange={(v) => v && setSelectedTrailerId(v)}>
                      <SelectTrigger id="edit-trailer">
                        <SelectValue placeholder={t.trailer} />
                      </SelectTrigger>
                      <SelectContent>
                        {trailers.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.plate} ({t.type})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2 flex flex-col">
                    <Label htmlFor="edit-client">{t.client}</Label>
                    <Popover open={clientComboboxOpen} onOpenChange={setClientComboboxOpen}>
                      <PopoverTrigger 
                        className={cn(buttonVariants({ variant: "outline" }), "justify-between")}
                        role="combobox"
                        aria-expanded={clientComboboxOpen}
                      >
                        {clientId
                          ? clients.find((c) => c.id === clientId)?.name
                          : t.selectClient}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </PopoverTrigger>
                      <PopoverContent className="w-[380px] p-0">
                        <Command>
                          <CommandInput placeholder={t.searchClient} />
                          <CommandList>
                            <CommandEmpty>{t.clientNotFound}</CommandEmpty>
                            <CommandGroup>
                              {clients.map((c) => (
                                <CommandItem
                                  key={c.id}
                                  value={c.name}
                                  onSelect={() => {
                                    setClientId(c.id);
                                    setClientComboboxOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      clientId === c.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {c.name}
                                  {c.type === "company" && <span className="ml-2 text-xs text-muted-foreground">({t.company})</span>}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-startDate">{t.startDate}</Label>
                      <Input 
                        id="edit-startDate" 
                        type="date" 
                        value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""} 
                        onChange={(e) => setSelectedDate(parseISO(e.target.value))} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-endDate">{t.endDate}</Label>
                      <Input 
                        id="edit-endDate" 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        min={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>{t.pickupTime}</Label>
                      <Input 
                        type="time" 
                        value={pickupTime} 
                        onChange={(e) => setPickupTime(e.target.value)} 
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t.returnTime}</Label>
                      <Input 
                        type="time" 
                        value={returnTime} 
                        onChange={(e) => setReturnTime(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">{t.status}</Label>
                    <Select value={status} onValueChange={(v) => v && setStatus(v as any)}>
                      <SelectTrigger id="edit-status">
                        <SelectValue placeholder={t.status} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">{t.paid}</SelectItem>
                        <SelectItem value="invoiced">{t.invoiced}</SelectItem>
                        <SelectItem value="defect">{t.defect}</SelectItem>
                        <SelectItem value="completed">{t.completed}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-invoice">{t.invoiceNumber}</Label>
                    <Input 
                      id="edit-invoice" 
                      value={invoiceNumber} 
                      onChange={(e) => setInvoiceNumber(e.target.value)} 
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-defect">{t.defectNote}</Label>
                    <Input 
                      id="edit-defect" 
                      value={defectNote} 
                      onChange={(e) => setDefectNote(e.target.value)} 
                    />
                  </div>
                </div>
              );
            }

            return (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold">{t.trailer}:</span>
                  <span className="col-span-2">{trailer?.plate} ({trailer ? t.trailerTypes[trailer.type as keyof typeof t.trailerTypes] : ''})</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold">{t.client}:</span>
                  <span className="col-span-2">{client?.name} {client?.type === 'company' ? `(${t.company})` : ''}</span>
                </div>
                {client?.phone && (
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold">{t.phone}:</span>
                    <span className="col-span-2">{client.phone}</span>
                  </div>
                )}
                {client?.email && (
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold">{t.email}:</span>
                    <span className="col-span-2">{client.email}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold">{t.startDate}:</span>
                  <span className="col-span-2">{format(parseISO(res.startDate), "d MMMM yyyy, HH:mm", { locale: dateLocale })}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold">{t.endDate}:</span>
                  <span className="col-span-2">{format(parseISO(res.endDate), "d MMMM yyyy, HH:mm", { locale: dateLocale })}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold">{t.status}:</span>
                  <span className="col-span-2">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", badgeColorClassMap[statusColors[res.status as keyof typeof statusColors]])}>
                      {res.status === 'paid' && t.paid}
                      {res.status === 'invoiced' && t.invoiced}
                      {res.status === 'defect' && t.defect}
                      {res.status === 'completed' && t.completed}
                    </span>
                  </span>
                </div>
                {res.invoiceNumber && (
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold">{t.invoiceNumber}:</span>
                    <span className="col-span-2">{res.invoiceNumber}</span>
                  </div>
                )}
                {res.defectNote && (
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-semibold">{t.defectNote}:</span>
                    <span className="col-span-2">{res.defectNote}</span>
                  </div>
                )}

                {res.history && res.history.length > 0 && (
                  <div className="mt-6">
                     <div className="p-3 bg-muted/50 rounded-lg space-y-2 border border-muted-foreground/10">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.history}</h4>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
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
              </div>
            );
          })()}
          
          <DialogFooter className="flex sm:justify-between items-center w-full">
            {isEditingReservation ? (
              <>
                <Button variant="destructive" onClick={handleDeleteReservation}>{t.delete}</Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditingReservation(false)}>{t.cancel}</Button>
                  <Button onClick={handleUpdateReservation}>{t.saveChanges}</Button>
                </div>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleEditClick}>{t.edit}</Button>
                <Button onClick={() => setIsViewDialogOpen(false)}>{t.close}</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t.areYouSure}</DialogTitle>
            <DialogDescription>
              {language === 'pl' ? 'Czy na pewno chcesz usunąć tę rezerwację? Zostanie ona przeniesiona do archiwum w zakładce Anulowane.' : language === 'de' ? 'Sind Sie sicher, dass Sie diese Reservierung löschen möchten? Sie wird in das Archiv (Storniert) verschoben.' : 'Are you sure you want to delete this reservation? It will be moved to the archive (Cancelled).'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>{t.cancel}</Button>
            <Button variant="destructive" onClick={confirmDeleteReservation}>{t.delete}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
