"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { TrailerCalendar } from "@/components/TrailerCalendar";
import { ClientList } from "@/components/ClientList";
import { TrailerHub } from "@/components/TrailerHub";
import { DailyOperations } from "@/components/DailyOperations";
import { Archive as ArchiveComponent } from "@/components/Archive";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, CalendarDays, Users, Clock, Archive } from "lucide-react";
import { useApp } from "@/lib/context";
import { translations } from "@/lib/translations";

function HomeContent() {
  const searchParams = useSearchParams();
  const { language } = useApp();
  const t = translations[language as keyof typeof translations] || translations.pl;
  const [activeTab, setActiveTab] = useState("calendar");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center gap-2">
          <Truck className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold">{t.appTitle}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-6 tracking-tight">{t.dashboard}</h2>
            <Dashboard onActionClick={(action) => setActiveTab(action)} />
          </section>

          <section>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 h-14 mb-8 bg-muted/50 p-1.5 rounded-xl">
                <TabsTrigger value="daily" className="text-base rounded-lg transition-all data-active:shadow-sm">
                  <Clock className="w-5 h-5 mr-2" />
                  {t.dailyOperations}
                </TabsTrigger>
                <TabsTrigger value="trailers" className="text-base rounded-lg transition-all data-active:shadow-sm">
                  <Truck className="w-5 h-5 mr-2" />
                  {t.trailersHub}
                </TabsTrigger>
                <TabsTrigger value="calendar" className="text-base rounded-lg transition-all data-active:shadow-sm">
                  <CalendarDays className="w-5 h-5 mr-2" />
                  {t.calendar}
                </TabsTrigger>
                <TabsTrigger value="clients" className="text-base rounded-lg transition-all data-active:shadow-sm">
                  <Users className="w-5 h-5 mr-2" />
                  {t.clientsCrm}
                </TabsTrigger>
                <TabsTrigger value="archive" className="text-base rounded-lg transition-all data-active:shadow-sm">
                  <Archive className="w-5 h-5 mr-2" />
                  {t.archive}
                </TabsTrigger>
              </TabsList>
              
              <div className="bg-card border rounded-xl p-6 shadow-sm min-h-[500px]">
                <TabsContent value="daily" className="mt-0">
                  <DailyOperations />
                </TabsContent>
                <TabsContent value="trailers" className="mt-0">
                  <TrailerHub />
                </TabsContent>
                <TabsContent value="calendar" className="mt-0">
                  <TrailerCalendar />
                </TabsContent>
                <TabsContent value="clients" className="mt-0">
                  <ClientList />
                </TabsContent>
                <TabsContent value="archive" className="mt-0">
                  <ArchiveComponent />
                </TabsContent>
              </div>
            </Tabs>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Ładowanie...</div>}>
      <HomeContent />
    </Suspense>
  );
}
