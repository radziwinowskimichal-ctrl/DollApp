"use client";

import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Truck, Calendar, Wrench, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";

export default function TrailerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { trailers, language } = useApp();
  const t = translations[language as keyof typeof translations] || translations.pl;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const trailerId = params.id as string;
  const trailer = trailers.find((t) => t.id === trailerId);

  if (!trailer) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Nie znaleziono przyczepy</h2>
        <Button onClick={() => router.push('/?tab=trailers')}>{t.back}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/?tab=trailers')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Truck className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold">{t.trailerDetails} - {trailer.plate}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                {t.trailerDetails}
              </CardTitle>
              <CardDescription>Podstawowe informacje o sprzęcie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t.plate}</p>
                  <p className="font-medium text-lg">{trailer.plate || <span className="italic text-muted-foreground">{t.noPlate}</span>}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t.vin}</p>
                  <p className="font-medium">{trailer.vin || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t.model}</p>
                  <p className="font-medium">{trailer.model || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t.type}</p>
                  <p className="font-medium">{t.trailerTypes[trailer.type as keyof typeof t.trailerTypes] || trailer.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t.capacity}</p>
                  <p className="font-medium">{trailer.capacity}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t.dimensions}</p>
                  <p className="font-medium">{trailer.dimensions}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t.specs}</p>
                  <p className="font-medium">{trailer.specs || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t.tuvExpiry}</p>
                  <p className="font-medium">
                    {trailer.tuvExpiry ? format(parseISO(trailer.tuvExpiry), "dd.MM.yyyy") : "-"}
                  </p>
                </div>
                {trailer.notes && (
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-sm text-muted-foreground">{t.trailerNotes}</p>
                    <p className="font-medium bg-muted/50 p-3 rounded-md border border-amber-200 text-amber-900 italic">
                      {trailer.notes}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t.status}</p>
                  <Badge variant={trailer.status === "available" ? "default" : "destructive"} className="mt-1">
                    {trailer.status === "available" ? t.available : t.service}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Cards for future features */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-4 h-4 text-primary" />
                  Rezerwacje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Moduł historii rezerwacji w przygotowaniu.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="w-4 h-4 text-primary" />
                  Historia Serwisowa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Moduł historii napraw w przygotowaniu.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
