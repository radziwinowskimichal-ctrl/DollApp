"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Settings as SettingsIcon, Moon, Sun, Monitor, Check } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/context";
import { availableColors, solidColorClassMap } from "@/lib/colors";
import { translations as globalTranslations } from "@/lib/translations";

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, statusColors, updateStatusColor } = useApp();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const translations = {
    pl: {
      settings: "Ustawienia",
      settingsDesc: "Zarządzaj preferencjami aplikacji.",
      theme: "Motyw",
      light: "Jasny",
      dark: "Ciemny",
      system: "Systemowy",
      language: "Język",
      polish: "Polski",
      english: "Angielski",
      german: "Niemiecki",
    },
    en: {
      settings: "Settings",
      settingsDesc: "Manage your application preferences.",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System",
      language: "Language",
      polish: "Polish",
      english: "English",
      german: "German",
    },
    de: {
      settings: "Einstellungen",
      settingsDesc: "Verwalten Sie Ihre Anwendungseinstellungen.",
      theme: "Thema",
      light: "Hell",
      dark: "Dunkel",
      system: "System",
      language: "Sprache",
      polish: "Polnisch",
      english: "Englisch",
      german: "Deutsch",
    }
  };

  const t = translations[language as keyof typeof translations] || translations.pl;
  const globalT = globalTranslations[language as keyof typeof globalTranslations] || globalTranslations.pl;

  const statuses = [
    { key: "paid" as const, label: globalT.colorPaid },
    { key: "invoiced" as const, label: globalT.colorInvoiced },
    { key: "defect" as const, label: globalT.colorDefect },
    { key: "completed" as const, label: globalT.colorCompleted },
  ];

  return (
    <Sheet>
      <SheetTrigger 
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "fixed top-4 right-4 z-50 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm")}
      >
        <SettingsIcon className="h-5 w-5" />
        <span className="sr-only">{t.settings}</span>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-sm overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t.settings}</SheetTitle>
          <SheetDescription>
            {t.settingsDesc}
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="grid gap-2">
            <Label htmlFor="theme">{t.theme}</Label>
            <Select value={mounted ? theme : undefined} onValueChange={(v) => v && setTheme(v)}>
              <SelectTrigger id="theme">
                <SelectValue placeholder={t.theme} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>{t.light}</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>{t.dark}</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>{t.system}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="language">{t.language}</Label>
            <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
              <SelectTrigger id="language">
                <SelectValue placeholder={t.language} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pl">{t.polish}</SelectItem>
                <SelectItem value="en">{t.english}</SelectItem>
                <SelectItem value="de">{t.german}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-4">{globalT.statusColors}</h4>
            <div className="space-y-6">
              {statuses.map((status) => (
                <div key={status.key} className="space-y-3">
                  <Label className="text-xs text-muted-foreground">{status.label}</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => {
                      const isSelected = statusColors[status.key] === color;
                      return (
                        <button
                          key={color}
                          onClick={() => updateStatusColor(status.key, color)}
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
                            solidColorClassMap[color],
                            isSelected ? "ring-2 ring-offset-2 ring-primary" : ""
                          )}
                          title={color}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
