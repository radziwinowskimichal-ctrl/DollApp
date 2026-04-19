"use client";

import React, { useEffect, useState } from 'react';

export function LicenseBarrier() {
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const checkExpiry = () => {
      const now = new Date();
      // May 1st, 2026
      // Note: Month is 0-indexed in JS Date, so 4 = May
      const expiryDate = new Date(2026, 4, 1); 
      if (now >= expiryDate) {
        setIsExpired(true);
      }
    };

    checkExpiry();
    // Re-check periodically in case the user leaves the tab open across the midnight boundary
    const interval = setInterval(checkExpiry, 1000 * 60 * 10); 
    return () => clearInterval(interval);
  }, []);

  if (!isExpired) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950 flex flex-col items-center justify-center text-white p-8 text-center select-none backdrop-blur-md">
      <div className="max-w-xl space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative mx-auto w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center border-2 border-rose-500/50">
          <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full animate-pulse" />
          <span className="text-5xl font-black text-rose-500">!</span>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-black uppercase tracking-tight text-white leading-none">
            Kostenlose Lizenz abgelaufen
          </h1>
          <div className="h-1.5 w-32 bg-rose-600 mx-auto rounded-full" />
        </div>

        <p className="text-xl font-medium text-slate-300 leading-relaxed max-w-lg mx-auto">
          Die kostenlose Testphase für das Smart Trailer Manager System ist am 01.05.2026 abgelaufen. 
          Für die weitere Nutzung ist eine gültige Lizenz erforderlich.
        </p>

        <div className="pt-8 flex flex-col items-center gap-4">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Bitte kontaktieren Sie den Administrator
          </p>
          <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-mono text-sm text-slate-400">
            Lizenzstatus: ABGELAUFEN (EXPIRED_010526)
          </div>
        </div>
      </div>
    </div>
  );
}
