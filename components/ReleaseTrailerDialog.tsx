"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/context";
import { Reservation, Client, RentalAgreement } from "@/lib/store";
import { toast } from "sonner";
import { format } from "date-fns";
import { Printer } from "lucide-react";
import { PrintableAgreement } from "./PrintableAgreement";
import { printDocument } from "@/lib/print";

import { translations } from "@/lib/translations";

interface ReleaseTrailerDialogProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReleaseTrailerDialog({ reservation, isOpen, onClose }: ReleaseTrailerDialogProps) {
  const { clients, trailers, updateClient, updateReservation, language, currentUserId, profiles } = useApp();
  const t = translations[language as keyof typeof translations] || translations.pl;
  const [client, setClient] = useState<Client | null>(null);
  const [agreement, setAgreement] = useState<RentalAgreement>({
    pickupTime: format(new Date(), "HH:mm"),
    returnTime: "12:00",
    prices: { daily: 0, weekend: 0, weekly: 0, total: 0 },
    deposits: { lock: false, straps: false, adapter: false, registration: false, general: 0, total: 0 },
    paymentMethod: "BAR"
  });
  const [pickupPhotos, setPickupPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (reservation && isOpen) {
      setTimeout(() => {
        const c = clients.find(c => c.id === reservation.clientId);
        if (c) setClient({ ...c });
        if (reservation.agreement) {
          setAgreement({ ...reservation.agreement });
        } else {
          setAgreement({
            pickupTime: format(new Date(), "HH:mm"),
            returnTime: "12:00",
            prices: { daily: 0, weekend: 0, weekly: 0, total: 0 },
            deposits: { lock: false, straps: false, adapter: false, registration: false, general: 0, total: 0 },
            paymentMethod: "BAR"
          });
        }
        if (reservation.pickupPhotos) {
          setPickupPhotos(reservation.pickupPhotos);
        } else {
          setPickupPhotos([]);
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
            setPickupPhotos(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPickupPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Update client with new details
    updateClient(client);
    
    // Update reservation with agreement and set status to active
    // History is now handled by the context if we pass the action
    updateReservation({
      ...reservation,
      status: "active",
      agreement,
      pickupPhotos,
    }, "released");

    toast.success(t.trailerReleased);
    onClose();
  };

  const calculateTotalDeposit = () => {
    let total = Number(agreement.deposits?.general || 0);
    if (agreement.deposits?.lock) total += 35;
    if (agreement.deposits?.straps) total += 60;
    if (agreement.deposits?.adapter) total += 17;
    if (agreement.deposits?.registration) total += 200;
    return total;
  };

  const handlePrint = () => {
    const success = printDocument('print-area', t.printAgreementTitle || 'Umowa_Wydanie');
    if (!success) {
      toast.error(t.printDocumentNotFound || t.popupBlockedError);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-[95vw] lg:max-w-[50vw] w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.releaseTrailerTitle}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Client Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">{t.tenantDetails}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>{t.fullName} / {t.companyName}</Label>
                <Input value={client.name} onChange={e => setClient({...client, name: e.target.value})} />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label>{t.streetAndNumber}</Label>
                <Input value={client.address || ''} onChange={e => setClient({...client, address: e.target.value})} placeholder={t.exampleAddress} />
              </div>

              <div className="space-y-2">
                <Label>{t.phone}</Label>
                <Input value={client.phone || ''} onChange={e => setClient({...client, phone: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label>{t.email}</Label>
                <Input value={client.email || ''} onChange={e => setClient({...client, email: e.target.value})} />
              </div>
            </div>

            <h4 className="font-medium mt-4">{t.drivingLicense}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.category}</Label>
                <Input value={client.driverLicenseClass || ''} onChange={e => setClient({...client, driverLicenseClass: e.target.value})} placeholder={t.exampleLicense} />
              </div>
              <div className="space-y-2">
                <Label>{t.issueDate}</Label>
                <Input type="date" value={client.driverLicenseIssueDate || ''} onChange={e => setClient({...client, driverLicenseIssueDate: e.target.value})} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>{t.issuePlace}</Label>
                <Input value={client.driverLicenseIssuePlace || ''} onChange={e => setClient({...client, driverLicenseIssuePlace: e.target.value})} />
              </div>
            </div>

            <h4 className="font-medium mt-4">{t.idCard}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.documentNumber}</Label>
                <Input value={client.idCardNumber || ''} onChange={e => setClient({...client, idCardNumber: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{t.validUntil}</Label>
                <Input type="date" value={client.idCardExpiry || ''} onChange={e => setClient({...client, idCardExpiry: e.target.value})} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>{t.issuePlace}</Label>
                <Input value={client.idCardIssuePlace || ''} onChange={e => setClient({...client, idCardIssuePlace: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Rental Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">{t.reservationDetails}</h3>
            
            <div className="bg-muted p-3 rounded-md mb-4">
              <p className="font-medium">{t.trailer}: {trailer?.plate}</p>
              <p className="text-sm text-muted-foreground">
                {(t.trailerTypes as any)[trailer?.type || ""] || trailer?.type} | {trailer?.capacity} | {trailer?.dimensions}
              </p>
              {trailer && (() => {
                const typeStr = trailer.type.toString();
                const isLaweta = typeStr.includes("Laweta") || typeStr.includes("carTransporter");
                const capStr = trailer.capacity?.toLowerCase() || "0";
                const num = parseFloat(capStr.replace(/[^0-9.]/g, "") || "0");
                const isTon = capStr.includes("t");
                const weightInKg = isTon ? num * 1000 : num;
                const requiresBE = isLaweta || weightInKg > 750;

                if (!requiresBE) return null;

                const clientHasBE = client.driverLicenseClass?.toLowerCase().includes("be") || client.driverLicenseClass?.toLowerCase().includes("b+e") || client.driverLicenseClass?.toLowerCase().includes("ce");

                return (
                  <div className={`mt-2 p-2 rounded-sm border text-sm font-semibold ${clientHasBE ? 'text-green-700 bg-green-50 border-green-200' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>
                    {clientHasBE 
                      ? t.licenseHasBE
                      : t.licenseRequiresBE}
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.pickupDateTime}</Label>
                <div className="flex gap-2">
                  <Input type="date" value={reservation.startDate.split('T')[0]} disabled />
                  <Input type="time" value={agreement.pickupTime} onChange={e => setAgreement({...agreement, pickupTime: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.returnDateTime}</Label>
                <div className="flex gap-2">
                  <Input type="date" value={reservation.endDate.split('T')[0]} disabled />
                  <Input type="time" value={agreement.returnTime} onChange={e => setAgreement({...agreement, returnTime: e.target.value})} />
                </div>
              </div>
            </div>

            <h4 className="font-medium mt-4">{t.fees}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.pricePerDay}</Label>
                <Input type="number" value={agreement.prices?.daily || ''} onChange={e => setAgreement({...agreement, prices: {...agreement.prices, daily: Number(e.target.value)}})} />
              </div>
              <div className="space-y-2">
                <Label>{t.pricePerWeekend}</Label>
                <Input type="number" value={agreement.prices?.weekend || ''} onChange={e => setAgreement({...agreement, prices: {...agreement.prices, weekend: Number(e.target.value)}})} />
              </div>
              <div className="space-y-2">
                <Label>{t.pricePerWeek}</Label>
                <Input type="number" value={agreement.prices?.weekly || ''} onChange={e => setAgreement({...agreement, prices: {...agreement.prices, weekly: Number(e.target.value)}})} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-primary">{t.totalGrossPrice}</Label>
                <Input type="number" className="font-bold" value={agreement.prices?.total || ''} onChange={e => setAgreement({...agreement, prices: {...agreement.prices, total: Number(e.target.value)}})} />
              </div>
            </div>

            <h4 className="font-medium mt-4">{t.depositAndAddons}</h4>
            <div className="space-y-3 bg-muted/50 p-4 rounded-md">
              <div className="flex items-center space-x-2">
                <Checkbox id="lock" checked={agreement.deposits?.lock} onCheckedChange={(c) => setAgreement({...agreement, deposits: {...agreement.deposits, lock: !!c}})} />
                <Label htmlFor="lock" className="flex-1 cursor-pointer">{t.antiTheftLock}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="straps" checked={agreement.deposits?.straps} onCheckedChange={(c) => setAgreement({...agreement, deposits: {...agreement.deposits, straps: !!c}})} />
                <Label htmlFor="straps" className="flex-1 cursor-pointer">{t.transportStraps}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="adapter" checked={agreement.deposits?.adapter} onCheckedChange={(c) => setAgreement({...agreement, deposits: {...agreement.deposits, adapter: !!c}})} />
                <Label htmlFor="adapter" className="flex-1 cursor-pointer">{t.adapter}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="registration" checked={agreement.deposits?.registration} onCheckedChange={(c) => setAgreement({...agreement, deposits: {...agreement.deposits, registration: !!c}})} />
                <Label htmlFor="registration" className="flex-1 cursor-pointer">{t.registrationDocument}</Label>
              </div>
              <div className="flex items-center space-x-2 pt-2 border-t">
                <Label className="w-1/2">{t.otherDeposit}</Label>
                <Input type="number" value={agreement.deposits?.general || 0} onChange={e => setAgreement({...agreement, deposits: {...agreement.deposits, general: Number(e.target.value)}})} className="w-1/2" />
              </div>
              <div className="flex justify-between font-bold pt-2">
                <span>{t.totalDeposit}</span>
                <span>{calculateTotalDeposit()} €</span>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>{t.paymentMethod}</Label>
              <Select value={agreement.paymentMethod} onValueChange={(v: any) => setAgreement({...agreement, paymentMethod: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAR">{t.cash}</SelectItem>
                  <SelectItem value="EC-Karte">{t.debitCard}</SelectItem>
                  <SelectItem value="Kreditkarte">{t.creditCard}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <h4 className="font-medium mt-6 border-b pb-2">{t.visualDocumentationPickup}</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer">
                  {t.addPhoto}
                  <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handlePhotoUpload} />
                </label>
                <span className="text-sm text-muted-foreground">{pickupPhotos.length} {t.photosCount}</span>
              </div>
              
              {pickupPhotos.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {pickupPhotos.map((photo, i) => (
                    <div key={i} className="relative aspect-square rounded overflow-hidden border">
                      <Image src={photo} alt={`Pickup photo ${i+1}`} width={200} height={200} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
        </div>

        <DialogFooter className="mt-6 flex justify-between sm:justify-between w-full">
          <Button variant="secondary" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            {t.printAgreement}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>{t.cancel}</Button>
            <Button onClick={handleSave}>{t.saveAndRelease}</Button>
          </div>
        </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {trailer && isOpen && (
        <PrintableAgreement 
          reservation={reservation}
          client={client}
          trailer={trailer}
          agreement={agreement}
        />
      )}
    </>
  );
}
