"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Trailer, Client, Reservation, initialTrailers, initialClients, initialReservations } from "./store";
import { ColorOption } from "./colors";

export type StatusColors = Record<Reservation["status"], ColorOption>;

const defaultStatusColors: StatusColors = {
  paid: "green",
  invoiced: "amber",
  defect: "red",
  completed: "slate",
  active: "blue"
};

interface AppState {
  trailers: Trailer[];
  clients: Client[];
  reservations: Reservation[];
  language: string;
  statusColors: StatusColors;
  addReservation: (res: Reservation) => void;
  updateReservation: (res: Reservation) => void;
  deleteReservation: (id: string) => void;
  updateTrailerStatus: (id: string, status: Trailer["status"]) => void;
  addTrailer: (trailer: Trailer) => void;
  updateTrailer: (trailer: Trailer) => void;
  deleteTrailer: (id: string) => void;
  updateClientBalance: (id: string, amount: number) => void;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  setLanguage: (lang: string) => void;
  updateStatusColor: (status: Reservation["status"], color: ColorOption) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [trailers, setTrailers] = useState<Trailer[]>(initialTrailers);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [language, setLanguage] = useState<string>("pl");
  const [statusColors, setStatusColors] = useState<StatusColors>(defaultStatusColors);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTrailers = localStorage.getItem("trailers");
    const savedClients = localStorage.getItem("clients");
    const savedReservations = localStorage.getItem("reservations");
    const savedLanguage = localStorage.getItem("language");
    const savedStatusColors = localStorage.getItem("statusColors");

    queueMicrotask(() => {
      if (savedTrailers) setTrailers(JSON.parse(savedTrailers));
      if (savedClients) setClients(JSON.parse(savedClients));
      if (savedReservations) setReservations(JSON.parse(savedReservations));
      if (savedLanguage) setLanguage(savedLanguage);
      if (savedStatusColors) setStatusColors(JSON.parse(savedStatusColors));
      
      setIsLoaded(true);
    });
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("trailers", JSON.stringify(trailers));
      localStorage.setItem("clients", JSON.stringify(clients));
      localStorage.setItem("reservations", JSON.stringify(reservations));
      localStorage.setItem("language", language);
      localStorage.setItem("statusColors", JSON.stringify(statusColors));
    }
  }, [trailers, clients, reservations, language, statusColors, isLoaded]);

  const addReservation = (res: Reservation) => {
    setReservations((prev) => [...prev, res]);
  };

  const updateReservation = (res: Reservation) => {
    setReservations((prev) => prev.map((r) => (r.id === res.id ? res : r)));
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

  return (
    <AppContext.Provider value={{ 
      trailers, 
      clients, 
      reservations, 
      language, 
      statusColors,
      addReservation, 
      updateReservation,
      deleteReservation,
      updateTrailerStatus, 
      addTrailer,
      updateTrailer,
      deleteTrailer,
      updateClientBalance, 
      addClient, 
      updateClient,
      setLanguage,
      updateStatusColor
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
