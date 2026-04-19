"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
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
import { Plus, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { translations } from "@/lib/translations";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Trailer, TrailerType } from "@/lib/store";

export function TrailerHub() {
  const router = useRouter();
  const { trailers, addTrailer, updateTrailer, deleteTrailer, resetTrailers, language } = useApp();
  const t = translations[language as keyof typeof translations] || translations.pl;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrailer, setEditingTrailer] = useState<Trailer | null>(null);
  const [selectedTrailerId, setSelectedTrailerId] = useState<string | null>(null);

  // Form state
  const [plate, setPlate] = useState("");
  const [vin, setVin] = useState("");
  const [model, setModel] = useState("");
  const [specs, setSpecs] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<TrailerType>("Planen_Tieflader");
  const [capacity, setCapacity] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [tuvExpiry, setTuvExpiry] = useState("");
  const [status, setStatus] = useState<"available" | "service">("available");
  
  // Sort state
  const [sortConfig, setSortConfig] = useState<{ key: keyof Trailer | 'type_label'; direction: 'asc' | 'desc' | 'none' }>({
    key: 'status',
    direction: 'none'
  });

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [trailerSearch, setTrailerSearch] = useState("");

  const filteredTrailers = trailers.filter(trailer => {
    const matchesFilter = typeFilter === "all" || trailer.type === typeFilter;
    const searchLower = trailerSearch.toLowerCase();
    
    // Get translated type name
    const typeLabel = (t.trailerTypes as any)[trailer.type] || "";
    
    const matchesSearch = 
      (trailer.plate || "").toLowerCase().includes(searchLower) ||
      (trailer.model || "").toLowerCase().includes(searchLower) ||
      (trailer.vin || "").toLowerCase().includes(searchLower) ||
      typeLabel.toLowerCase().includes(searchLower);
      
    return matchesFilter && matchesSearch;
  });

  const sortedTrailers = [...filteredTrailers].sort((a, b) => {
    if (sortConfig.direction === 'none') return 0;
    
    let aValue: any;
    let bValue: any;

    if (sortConfig.key === 'type_label') {
      aValue = t.trailerTypes[a.type as keyof typeof t.trailerTypes] || a.type;
      bValue = t.trailerTypes[b.type as keyof typeof t.trailerTypes] || b.type;
    } else {
      aValue = a[sortConfig.key as keyof Trailer] || "";
      bValue = b[sortConfig.key as keyof Trailer] || "";
    }

    if (typeof aValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const handleSort = (key: keyof Trailer | 'type_label') => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'none') return { key, direction: 'asc' };
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return { key, direction: 'none' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key: keyof Trailer | 'type_label') => {
    if (sortConfig.key !== key || sortConfig.direction === 'none') {
      return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    }
    return sortConfig.direction === 'asc' ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />;
  };

  const handleOpenDialog = (trailer?: Trailer) => {
    if (trailer) {
      setEditingTrailer(trailer);
      setPlate(trailer.plate || "");
      setVin(trailer.vin || "");
      setModel(trailer.model || "");
      setSpecs(trailer.specs || "");
      setNotes(trailer.notes || "");
      setType(trailer.type);
      setCapacity(trailer.capacity);
      setDimensions(trailer.dimensions);
      setTuvExpiry(trailer.tuvExpiry ? format(parseISO(trailer.tuvExpiry), "yyyy-MM-dd") : "");
      setStatus(trailer.status);
    } else {
      setEditingTrailer(null);
      setPlate("");
      setVin("");
      setModel("");
      setSpecs("");
      setNotes("");
      setType("Planen_Tieflader");
      setCapacity("");
      setDimensions("");
      setTuvExpiry("");
      setStatus("available");
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!capacity || !dimensions) {
      toast.error(t.fillAllFields);
      return;
    }

    const trailerData: Trailer = {
      id: editingTrailer ? editingTrailer.id : Math.random().toString(36).substring(7),
      plate: plate || undefined,
      vin: vin || undefined,
      model: model || undefined,
      specs: specs || undefined,
      notes: notes || undefined,
      type,
      capacity,
      dimensions,
      tuvExpiry: tuvExpiry ? new Date(tuvExpiry).toISOString() : undefined,
      status,
    };

    if (editingTrailer) {
      updateTrailer(trailerData);
      toast.success(t.trailerUpdated);
    } else {
      addTrailer(trailerData);
      toast.success(t.trailerAdded);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteTrailer(id);
    toast.success(t.trailerDeleted);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-50 p-2 rounded-xl border">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={() => resetTrailers()} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary h-10">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            {t.syncData}
          </Button>

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
              placeholder={language === 'pl' ? "Szukaj przyczepy..." : language === 'de' ? "Fahrzeug suchen..." : "Search trailer..."}
              className="pl-9 w-[220px] h-10 border-slate-200 bg-white text-xs font-bold"
              value={trailerSearch}
              onChange={(e) => setTrailerSearch(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={() => handleOpenDialog()} className="rounded-lg font-black uppercase tracking-tighter px-6 shadow-lg shadow-primary/20 h-10">
          <Plus className="mr-2 h-4 w-4" />
          {t.addTrailer}
        </Button>
      </div>

      <div className="overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead 
                className="cursor-pointer hover:bg-slate-100/50 transition-colors select-none text-[10px] font-black uppercase tracking-wider h-12"
                onClick={() => handleSort('plate')}
              >
                <div className="flex items-center gap-1.5">
                  {t.plate}
                  {getSortIcon('plate')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-100/50 transition-colors select-none text-[10px] font-black uppercase tracking-wider h-12"
                onClick={() => handleSort('type_label')}
              >
                <div className="flex items-center gap-1.5">
                  {t.type}
                  {getSortIcon('type_label')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-100/50 transition-colors select-none text-[10px] font-black uppercase tracking-wider h-12"
                onClick={() => handleSort('model')}
              >
                <div className="flex items-center gap-1.5">
                  {t.modelSpecs}
                  {getSortIcon('model')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-100/50 transition-colors select-none text-[10px] font-black uppercase tracking-wider h-12"
                onClick={() => handleSort('capacity')}
              >
                <div className="flex items-center gap-1.5">
                  {t.capacity}
                  {getSortIcon('capacity')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-100/50 transition-colors select-none text-[10px] font-black uppercase tracking-wider h-12"
                onClick={() => handleSort('dimensions')}
              >
                <div className="flex items-center gap-1.5">
                  {t.dimensions}
                  {getSortIcon('dimensions')}
                </div>
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider h-12">{t.tuvExpiry}</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-slate-100/50 transition-colors select-none text-[10px] font-black uppercase tracking-wider h-12"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1.5">
                  {t.status}
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-wider h-12 text-right">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTrailers.map((trailer) => (
              <TableRow 
                key={trailer.id}
                data-state={selectedTrailerId === trailer.id ? "selected" : undefined}
                onClick={() => setSelectedTrailerId(trailer.id)}
                onDoubleClick={() => router.push(`/trailers/${trailer.id}`)}
                className="group cursor-pointer hover:bg-slate-50/50 transition-colors border-b"
              >
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    {trailer.plate ? (
                      <span className="font-black text-sm text-slate-900 leading-none">{trailer.plate}</span>
                    ) : (
                      <span className="italic text-slate-400 font-bold uppercase tracking-tighter text-[10px]">{t.noPlate}</span>
                    )}
                    {trailer.vin && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1.5 font-mono">{trailer.vin}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border">
                    {t.trailerTypes[trailer.type as keyof typeof t.trailerTypes] || trailer.type}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col min-w-[120px]">
                    <span className="font-bold text-slate-800 text-[13px]">{trailer.model || "-"}</span>
                    {trailer.specs && (
                      <span className="text-[11px] text-slate-500 font-medium mt-0.5">{trailer.specs}</span>
                    )}
                    {trailer.notes && (
                      <span className="text-[10px] text-amber-600 font-black uppercase tracking-tighter mt-1">{trailer.notes}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                   <span className="text-sm font-black text-slate-700">{trailer.capacity}</span>
                </TableCell>
                <TableCell>
                   <span className="text-sm font-bold text-slate-600 font-mono tracking-tight">{trailer.dimensions}</span>
                </TableCell>
                <TableCell>
                  {trailer.tuvExpiry ? (
                    <span className="text-sm font-bold text-slate-600">{format(parseISO(trailer.tuvExpiry), "dd.MM.yyyy")}</span>
                  ) : (
                    <span className="text-slate-300 font-black uppercase tracking-tighter text-[10px]">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={cn(
                    "rounded-full px-3 py-0 h-5 text-[9px] font-black uppercase tracking-tighter border-none shadow-none",
                    trailer.status === "available" 
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" 
                      : "bg-rose-100 text-rose-700 hover:bg-rose-100"
                  )}>
                    {trailer.status === "available" ? t.available : t.service}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={(e) => { e.stopPropagation(); handleOpenDialog(trailer); }}>
                      <Edit className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={(e) => { e.stopPropagation(); handleDelete(trailer.id); }}>
                      <Trash2 className="h-4 w-4 text-rose-400" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTrailer ? t.editTrailer : t.addTrailer}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="plate">{t.plate}</Label>
                <Input id="plate" value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="ABC-123" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vin">{t.vin}</Label>
                <Input id="vin" value={vin} onChange={(e) => setVin(e.target.value)} placeholder="WBA..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="model">{t.model}</Label>
                <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">{t.type}</Label>
                <Select value={type} onValueChange={(v) => v && setType(v as TrailerType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
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
                        <div key={key}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                            {label}
                          </div>
                          {types.map((tKey) => (
                            <SelectItem key={tKey} value={tKey}>
                              {t.trailerTypes[tKey as keyof typeof t.trailerTypes]}
                            </SelectItem>
                          ))}
                        </div>
                      );
                    })}
                    <div>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                        {t.other}
                      </div>
                      {["winch", "cableTrailer", "auxWinch", "cablePusher", "compressor"].map((tKey) => (
                        <SelectItem key={tKey} value={tKey}>
                          {t.trailerTypes[tKey as keyof typeof t.trailerTypes] || tKey}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="specs">{t.specs}</Label>
              <Input id="specs" value={specs} onChange={(e) => setSpecs(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">{t.trailerNotes}</Label>
              <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">{t.capacity}</Label>
              <Input id="capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dimensions">{t.dimensions}</Label>
              <Input id="dimensions" value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tuvExpiry">{t.tuvExpiry}</Label>
              <Input id="tuvExpiry" type="date" value={tuvExpiry} onChange={(e) => setTuvExpiry(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">{t.status}</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">{t.available}</SelectItem>
                  <SelectItem value="service">{t.service}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t.cancel}</Button>
            <Button onClick={handleSave}>{t.saveTrailer}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
