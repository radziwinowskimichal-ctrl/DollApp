"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Trailer, Client, Reservation, ReservationHistoryEntry, UserProfile, initialTrailers, initialClients, initialReservations, initialProfiles } from "./store";
import { ColorOption } from "./colors";
import { toast } from "sonner";

import { translations } from "./translations";

export type StatusColors = Record<Reservation["status"], ColorOption>;

const defaultStatusColors: StatusColors = {
  paid: "green",
  invoiced: "amber",
  defect: "red",
  completed: "slate",
  active: "blue",
  cancelled: "red"
};

interface AppState {
  trailers: Trailer[];
  clients: Client[];
  reservations: Reservation[];
  profiles: UserProfile[];
  currentUserId: string | null;
  language: string;
  statusColors: StatusColors;
  addReservation: (res: Reservation) => void;
  updateReservation: (res: Reservation, action?: ReservationHistoryEntry["action"]) => void;
  deleteReservation: (id: string) => void;
  updateTrailerStatus: (id: string, status: Trailer["status"]) => void;
  addTrailer: (trailer: Trailer) => void;
  updateTrailer: (trailer: Trailer) => void;
  deleteTrailer: (id: string) => void;
  resetTrailers: () => void;
  updateClientBalance: (id: string, amount: number) => void;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  setLanguage: (lang: string) => void;
  updateStatusColor: (status: Reservation["status"], color: ColorOption) => void;
  loginUser: (id: string) => void;
  logoutUser: () => void;
  checkTrailerAvailability: (trailerId: string, start: Date, end: Date, excludeReservationId?: string) => boolean;
  logReservationAction: (reservationId: string, action: ReservationHistoryEntry["action"]) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [trailers, setTrailers] = useState<Trailer[]>(initialTrailers);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [profiles, setProfiles] = useState<UserProfile[]>(initialProfiles);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("de");
  const [statusColors, setStatusColors] = useState<StatusColors>(defaultStatusColors);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTrailers = localStorage.getItem("trailers");
    const savedClients = localStorage.getItem("clients");
    const savedReservations = localStorage.getItem("reservations");
    const savedProfiles = localStorage.getItem("profiles");
    const savedCurrentUserId = localStorage.getItem("currentUserId");
    const savedLanguage = localStorage.getItem("language");
    const savedStatusColors = localStorage.getItem("statusColors");

    queueMicrotask(() => {
      if (savedTrailers) setTrailers(JSON.parse(savedTrailers));
      if (savedClients) setClients(JSON.parse(savedClients));
      if (savedReservations) setReservations(JSON.parse(savedReservations));
      if (savedProfiles) setProfiles(JSON.parse(savedProfiles));
      if (savedCurrentUserId) setCurrentUserId(savedCurrentUserId);
      if (savedLanguage) setLanguage(savedLanguage);
      if (savedStatusColors) setStatusColors(JSON.parse(savedStatusColors));
      
      setIsLoaded(true);
    });
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    // Check local storage across tabs for 'profiles' to sync "online/offline" status if needed.
    // We'll keep it simple: just save local state.
    if (isLoaded) {
      localStorage.setItem("trailers", JSON.stringify(trailers));
      localStorage.setItem("clients", JSON.stringify(clients));
      localStorage.setItem("reservations", JSON.stringify(reservations));
      localStorage.setItem("profiles", JSON.stringify(profiles));
      if (currentUserId) {
        localStorage.setItem("currentUserId", currentUserId);
      } else {
        localStorage.removeItem("currentUserId");
      }
      localStorage.setItem("language", language);
      localStorage.setItem("statusColors", JSON.stringify(statusColors));
    }
  }, [trailers, clients, reservations, profiles, currentUserId, language, statusColors, isLoaded]);

  // Sync profiles state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "profiles" && e.newValue) {
        setProfiles(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const loginUser = (id: string) => {
    setCurrentUserId(id);
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, isOnline: true } : p));
  };

  const logoutUser = () => {
    if (currentUserId) {
      setProfiles(prev => prev.map(p => p.id === currentUserId ? { ...p, isOnline: false } : p));
    }
    setCurrentUserId(null);
  };

  const getHistoryEntry = (action: ReservationHistoryEntry["action"]): ReservationHistoryEntry => {
    const currentUser = profiles.find(p => p.id === currentUserId);
    return {
      id: Math.random().toString(36).substring(7),
      action,
      timestamp: new Date().toISOString(),
      profileId: currentUser?.id,
      profileName: currentUser?.name || "System"
    };
  };

  const addReservation = (res: Reservation) => {
    const historyEntry = getHistoryEntry("created");
    setReservations((prev) => [...prev, { ...res, history: [historyEntry] }]);
  };

  const updateReservation = (res: Reservation, action?: ReservationHistoryEntry["action"]) => {
    setReservations((prev) => prev.map((r) => {
      if (r.id === res.id) {
        let updatedRes = { ...res };
        if (action) {
          const historyEntry = getHistoryEntry(action);
          updatedRes.history = [...(r.history || []), historyEntry];
        }
        return updatedRes;
      }
      return r;
    }));
  };

  const logReservationAction = (reservationId: string, action: ReservationHistoryEntry["action"]) => {
    setReservations((prev) => prev.map((r) => {
      if (r.id === reservationId) {
        const historyEntry = getHistoryEntry(action);
        return {
          ...r,
          history: [...(r.history || []), historyEntry]
        };
      }
      return r;
    }));
  };

  const deleteReservation = (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  const updateTrailerStatus = (id: string, status: Trailer["status"]) => {
    setTrailers((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const addTrailer = (trailer: Trailer) => {
    setTrailers((prev) => [...prev, trailer]);
  };

  const updateTrailer = (trailer: Trailer) => {
    setTrailers((prev) => prev.map((t) => (t.id === trailer.id ? trailer : t)));
  };

  const deleteTrailer = (id: string) => {
    setTrailers((prev) => prev.filter((t) => t.id !== id));
  };

  const resetTrailers = () => {
    setTrailers([...initialTrailers]);
    const t = translations[language as keyof typeof translations];
    toast.success(t.trailersSynced);
  };

  const updateClientBalance = (id: string, amount: number) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, balance: c.balance + amount } : c)));
  };

  const addClient = (client: Client) => {
    setClients((prev) => [...prev, client]);
  };

  const updateClient = (client: Client) => {
    setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
  };

  const updateStatusColor = (status: Reservation["status"], color: ColorOption) => {
    setStatusColors((prev) => ({ ...prev, [status]: color }));
  };

  const checkTrailerAvailability = (trailerId: string, start: Date, end: Date, excludeReservationId?: string) => {
    return !reservations.some(res => {
      if (res.status === "cancelled") return false;
      if (res.trailerId !== trailerId) return false;
      if (excludeReservationId && res.id === excludeReservationId) return false;

      const resStart = new Date(res.startDate);
      const resEnd = new Date(res.endDate);
      
      const resEndWithBuffer = new Date(resEnd.getTime() + 60 * 60 * 1000); 

      return start < resEndWithBuffer && end > resStart;
    });
  };

  return (
    <AppContext.Provider value={{ 
      trailers, 
      clients, 
      reservations, 
      profiles,
      currentUserId,
      language, 
      statusColors,
      addReservation, 
      updateReservation,
      deleteReservation,
      updateTrailerStatus, 
      addTrailer,
      updateTrailer,
      deleteTrailer,
      resetTrailers,
      updateClientBalance, 
      addClient, 
      updateClient,
      setLanguage,
      updateStatusColor,
      loginUser,
      logoutUser,
      checkTrailerAvailability,
      logReservationAction
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
