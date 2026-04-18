"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (reservation) {
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
    }
  }, [reservation, clients, isOpen]);

  if (!reservation || !client) return null;

  const trailer = trailers.find(t => t.id === reservation.trailerId);

  const handleSave = () => {
    // Update client with new details
    updateClient(client);
    
    // Add to history
    const currentUser = profiles.find(p => p.id === currentUserId);
    const historyEntry = {
      id: Math.random().toString(36).substring(7),
      action: "released" as const,
      timestamp: new Date().toISOString(),
      profileId: currentUser?.id,
      profileName: currentUser?.name || "System"
    };

    // Update reservation with agreement and set status to active
    updateReservation({
      ...reservation,
      status: "active",
      agreement,
      history: [...(reservation.history || []), historyEntry]
    });

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
    const printContent = document.getElementById('print-area');
    if (!printContent) {
      toast.error(t.printDocumentNotFound);
      return;
    }

    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
          .map(el => el.outerHTML)
          .join('\n');
          
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${t.printAgreementTitle}</title>
              ${styles}
              <style>
                body { background: white; margin: 0; padding: 20px; }
                #print-area { display: block !important; position: static !important; visibility: visible !important; }
                @media print {
                  @page { margin: 1cm; }
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
              </style>
            </head>
            <body>
              ${printContent.outerHTML}
              <script>
                window.onload = () => {
                  setTimeout(() => {
                    window.print();
                    window.close();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        window.print();
        toast.info(t.printPopupBlocked);
      }
    } catch (e) {
      window.print();
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
                <Input value={client.address || ''} onChange={e => setClient({...client, address: e.target.value})} placeholder="np. Raudtener Str. 8" />
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
                <Input value={client.driverLicenseClass || ''} onChange={e => setClient({...client, driverLicenseClass: e.target.value})} placeholder="np. B, BE" />
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
              <p className="text-sm text-muted-foreground">{trailer?.type} | {trailer?.capacity} | {trailer?.dimensions}</p>
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
