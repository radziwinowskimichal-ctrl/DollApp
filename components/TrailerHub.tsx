"use client";

import { useState } from "react";
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
import { Plus, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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
  SelectItem,
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
  const [type, setType] = useState<TrailerType>("Laweta");
  const [capacity, setCapacity] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [tuvExpiry, setTuvExpiry] = useState("");
  const [status, setStatus] = useState<"available" | "service">("available");
  
  // Sort state
  const [statusSort, setStatusSort] = useState<"none" | "asc" | "desc">("none");

  const sortedTrailers = [...trailers].sort((a, b) => {
    if (statusSort === "none") return 0;
    if (statusSort === "asc") {
      return a.status.localeCompare(b.status);
    } else {
      return b.status.localeCompare(a.status);
    }
  });

  const toggleStatusSort = () => {
    if (statusSort === "none") setStatusSort("asc");
    else if (statusSort === "asc") setStatusSort("desc");
    else setStatusSort("none");
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
      setType("Laweta");
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => resetTrailers()}>
          <ArrowUpDown className="mr-2 h-4 w-4" />
          {t.syncData}
        </Button>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          {t.addTrailer}
        </Button>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.plate}</TableHead>
              <TableHead>{t.type}</TableHead>
              <TableHead>{t.modelSpecs}</TableHead>
              <TableHead>{t.capacity}</TableHead>
              <TableHead>{t.dimensions}</TableHead>
              <TableHead>{t.tuvExpiry}</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                onClick={toggleStatusSort}
              >
                <div className="flex items-center gap-1">
                  {t.status}
                  {statusSort === "asc" ? (
                    <ArrowDown className="h-4 w-4" />
                  ) : statusSort === "desc" ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTrailers.map((trailer) => (
              <TableRow 
                key={trailer.id}
                data-state={selectedTrailerId === trailer.id ? "selected" : undefined}
                onClick={() => setSelectedTrailerId(trailer.id)}
                onDoubleClick={() => router.push(`/trailers/${trailer.id}`)}
                className="cursor-pointer"
              >
                <TableCell>
                  <div className="flex flex-col">
                    {trailer.plate ? (
                      <span className="font-medium">{trailer.plate}</span>
                    ) : (
                      <span className="italic text-muted-foreground">{t.noPlate}</span>
                    )}
                    {trailer.vin && (
                      <span className="text-xs text-muted-foreground font-mono">{trailer.vin}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{t.trailerTypes[trailer.type as keyof typeof t.trailerTypes] || trailer.type}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{trailer.model || "-"}</span>
                    {trailer.specs && (
                      <span className="text-xs text-muted-foreground">{trailer.specs}</span>
                    )}
                    {trailer.notes && (
                      <span className="text-xs text-amber-600 italic font-medium mt-1">{trailer.notes}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{trailer.capacity}</TableCell>
                <TableCell>{trailer.dimensions}</TableCell>
                <TableCell>
                  {trailer.tuvExpiry ? (
                    format(parseISO(trailer.tuvExpiry), "dd.MM.yyyy")
                  ) : (
                    <span className="text-muted-foreground italic">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={trailer.status === "available" ? "default" : "destructive"}>
                    {trailer.status === "available" ? t.available : t.service}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(trailer)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(trailer.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
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
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laweta">{t.trailerTypes.Laweta}</SelectItem>
                    <SelectItem value="Chłodnia">{t.trailerTypes.Chłodnia}</SelectItem>
                    <SelectItem value="Konie">{t.trailerTypes.Konie}</SelectItem>
                    <SelectItem value="Wciągarka">{t.trailerTypes.Wciągarka}</SelectItem>
                    <SelectItem value="Przyczepa kablowa">{t.trailerTypes["Przyczepa kablowa"]}</SelectItem>
                    <SelectItem value="Wciągarka pomocnicza">{t.trailerTypes["Wciągarka pomocnicza"]}</SelectItem>
                    <SelectItem value="Wpycharka do kabli">{t.trailerTypes["Wpycharka do kabli"]}</SelectItem>
                    <SelectItem value="Kompresor">{t.trailerTypes.Kompresor}</SelectItem>
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
