"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/context";
import { printDocument } from "@/lib/print";
import { Reservation, Client, ReturnProtocolState } from "@/lib/store";
import { toast } from "sonner";
import { Printer, Archive } from "lucide-react";
import { PrintableReturnProtocol } from "./PrintableReturnProtocol";
import { translations } from "@/lib/translations";
import { format } from "date-fns";

interface ReturnTrailerDialogProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReturnTrailerDialog({ reservation, isOpen, onClose }: ReturnTrailerDialogProps) {
  const { clients, trailers, updateReservation, language, currentUserId, profiles } = useApp();
  const t = translations[language as keyof typeof translations] || translations.pl;
  const [client, setClient] = useState<Client | null>(null);
  const [protocol, setProtocol] = useState<ReturnProtocolState>({
    fahrzeugausstattung: { uebergabe: true, rueckgabe: true },
    planeUndSpriegel: { uebergabe: true, rueckgabe: true },
    kofferaufbau: { uebergabe: true, rueckgabe: true },
    kupplung: { uebergabe: true, rueckgabe: true },
    auflaufbremse: { uebergabe: true, rueckgabe: true },
    elektrik: { uebergabe: true, rueckgabe: true },
    reifen: { uebergabe: true, rueckgabe: true },
    stuetzrad: { uebergabe: true, rueckgabe: true },
    bordwaende: { uebergabe: true, rueckgabe: true },
    leuchten: { uebergabe: true, rueckgabe: true },
    damageDescription: "",
    returnDate: format(new Date(), "dd.MM.yyyy")
  });
  const [returnPhotos, setReturnPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (reservation && isOpen) {
      setTimeout(() => {
        const c = clients.find(c => c.id === reservation.clientId);
        if (c) setClient({ ...c });
        if (reservation.protocol) {
           setProtocol({ ...reservation.protocol, returnDate: format(new Date(), "dd.MM.yyyy") });
        }
        if (reservation.returnPhotos) {
          setReturnPhotos(reservation.returnPhotos);
        } else {
          setReturnPhotos([]);
        }
      }, 0);
    }
  }, [reservation, clients, isOpen]);

  if (!reservation || !client) return null;

  const trailer = trailers.find(t => t.id === reservation.trailerId);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setReturnPhotos(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setReturnPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    updateReservation({
      ...reservation,
      status: "completed",
      protocol,
      returnPhotos,
    }, "completed");

    toast.success(t.trailerReturnedSuccess);
    onClose();
  };

  const handlePrint = () => {
    const success = printDocument('print-area-return', 'Protokol_Rückgabe');
    if (!success) {
      toast.error(t.printDocumentNotFound || t.popupBlockedError);
    }
  };

  const protocolItems = [
    { label: 'Fahrzeugausstattung', key: 'fahrzeugausstattung' as keyof ReturnProtocolState },
    { label: 'Plane und Spriegel', key: 'planeUndSpriegel' as keyof ReturnProtocolState },
    { label: 'Kofferaufbau', key: 'kofferaufbau' as keyof ReturnProtocolState },
    { label: 'Kupplung, Schlingerkupplung', key: 'kupplung' as keyof ReturnProtocolState },
    { label: 'Auflaufbremse, ungebremst', key: 'auflaufbremse' as keyof ReturnProtocolState },
    { label: 'Elektrik, Anschlusskabel, Adapter', key: 'elektrik' as keyof ReturnProtocolState },
    { label: 'Reifen, Felge, Ersatzrad', key: 'reifen' as keyof ReturnProtocolState },
    { label: 'Stützrad, Abstellstützen', key: 'stuetzrad' as keyof ReturnProtocolState },
    { label: 'Bordwände', key: 'bordwaende' as keyof ReturnProtocolState },
    { label: 'Leuchten', key: 'leuchten' as keyof ReturnProtocolState },
  ];

  const updateItem = (key: keyof ReturnProtocolState, type: 'uebergabe' | 'rueckgabe', val: boolean) => {
    setProtocol(p => ({
      ...p,
      [key]: {
        ...(p[key] as any),
        [type]: val
      }
    }));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-[95vw] lg:max-w-[700px] w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.returnTrailerTitle}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-semibold">{client.name}</h4>
              <p className="text-sm">Fahrzeug: {trailer?.plate}</p>
            </div>

            <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted text-left font-medium">
                        <tr>
                            <th className="p-2 border-b border-r w-1/3">Zutreffendes ankreuzen</th>
                            <th className="p-2 border-b border-r text-center w-1/3">Bei Übergabe (gut)</th>
                            <th className="p-2 border-b text-center w-1/3">Bei Rückgabe (gut)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {protocolItems.map((item, idx) => (
                            <tr key={item.key} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                <td className="p-2 border-b border-r">{item.label}</td>
                                <td className="border-b border-r p-2">
                                     <div className="flex justify-center items-center gap-4">
                                        <label className="flex items-center gap-1 cursor-pointer">
                                            <Checkbox 
                                                checked={(protocol[item.key] as any)?.uebergabe === true} 
                                                onCheckedChange={() => updateItem(item.key, 'uebergabe', true)}
                                            /> Gut
                                        </label>
                                        <label className="flex items-center gap-1 cursor-pointer">
                                            <Checkbox 
                                                checked={(protocol[item.key] as any)?.uebergabe === false} 
                                                onCheckedChange={() => updateItem(item.key, 'uebergabe', false)}
                                            /> Mängel
                                        </label>
                                     </div>
                                </td>
                                <td className="border-b p-2">
                                     <div className="flex justify-center items-center gap-4">
                                        <label className="flex items-center gap-1 cursor-pointer">
                                            <Checkbox 
                                                checked={(protocol[item.key] as any)?.rueckgabe === true} 
                                                onCheckedChange={() => updateItem(item.key, 'rueckgabe', true)}
                                            /> Gut
                                        </label>
                                        <label className="flex items-center gap-1 cursor-pointer">
                                            <Checkbox 
                                                checked={(protocol[item.key] as any)?.rueckgabe === false} 
                                                onCheckedChange={() => updateItem(item.key, 'rueckgabe', false)}
                                            /> Mängel
                                        </label>
                                     </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="space-y-2">
                <Label>{t.damageDescriptionLabel}</Label>
                <Textarea 
                    value={protocol.damageDescription || ''} 
                    onChange={e => setProtocol({...protocol, damageDescription: e.target.value})} 
                    placeholder={t.damageDescriptionPlaceholder}
                    className="h-24"
                />
            </div>

            <h4 className="font-medium mt-6 border-b pb-2">{t.visualDocumentationReturn}</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer">
                  {t.addPhoto}
                  <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handlePhotoUpload} />
                </label>
                <span className="text-sm text-muted-foreground">{returnPhotos.length} {t.photosCount}</span>
              </div>
              
              {returnPhotos.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {returnPhotos.map((photo, i) => (
                    <div key={i} className="relative aspect-square rounded overflow-hidden border">
                      <Image src={photo} alt={`Return photo ${i+1}`} width={200} height={200} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button 
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>

          <DialogFooter className="mt-6 flex justify-between sm:justify-between w-full">
            <Button variant="secondary" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              {t.printProtocol}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>{t.cancel}</Button>
              <Button onClick={handleSave} className="gap-2">
                <Archive className="w-4 h-4" />
                {t.completeAndArchive}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {trailer && isOpen && (
        <PrintableReturnProtocol 
          reservation={{...reservation, protocol}}
          client={client}
          trailer={trailer}
        />
      )}
    </>
  );
}
