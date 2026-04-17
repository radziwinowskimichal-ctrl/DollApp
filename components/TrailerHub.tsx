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
  const { trailers, addTrailer, updateTrailer, deleteTrailer, language } = useApp();
  const t = translations[language as keyof typeof translations] || translations.pl;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrailer, setEditingTrailer] = useState<Trailer | null>(null);
  const [selectedTrailerId, setSelectedTrailerId] = useState<string | null>(null);

  // Form state
  const [plate, setPlate] = useState("");
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
      setPlate(trailer.plate);
      setType(trailer.type);
      setCapacity(trailer.capacity);
      setDimensions(trailer.dimensions);
      setTuvExpiry(format(parseISO(trailer.tuvExpiry), "yyyy-MM-dd"));
      setStatus(trailer.status);
    } else {
      setEditingTrailer(null);
      setPlate("");
      setType("Laweta");
      setCapacity("");
      setDimensions("");
      setTuvExpiry(format(new Date(), "yyyy-MM-dd"));
      setStatus("available");
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!plate || !capacity || !dimensions || !tuvExpiry) {
      toast.error(t.fillAllFields);
      return;
    }

    const trailerData: Trailer = {
      id: editingTrailer ? editingTrailer.id : Math.random().toString(36).substring(7),
      plate,
      type,
      capacity,
      dimensions,
      tuvExpiry: new Date(tuvExpiry).toISOString(),
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
      <div className="flex justify-end">
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
                <TableCell className="font-medium">{trailer.plate}</TableCell>
                <TableCell>{t.trailerTypes[trailer.type as keyof typeof t.trailerTypes]}</TableCell>
                <TableCell>{trailer.capacity}</TableCell>
                <TableCell>{trailer.dimensions}</TableCell>
                <TableCell>{format(parseISO(trailer.tuvExpiry), "dd.MM.yyyy")}</TableCell>
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
            <div className="grid gap-2">
              <Label htmlFor="plate">{t.plate}</Label>
              <Input id="plate" value={plate} onChange={(e) => setPlate(e.target.value)} />
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
                </SelectContent>
              </Select>
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
