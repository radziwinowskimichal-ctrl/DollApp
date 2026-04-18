import { addDays, subDays, startOfDay } from "date-fns";

export type TrailerType = "Laweta" | "Chłodnia" | "Konie" | "Wciągarka";

export interface Trailer {
  id: string;
  plate: string;
  type: TrailerType;
  capacity: string;
  dimensions: string;
  tuvExpiry: string; // ISO date
  status: "available" | "service";
}

export interface Client {
  id: string;
  name: string;
  balance: number;
  notes: string;
  type: "private" | "company";
  phone?: string;
  email?: string;
  nip?: string;
  address?: string;
  driverLicenseClass?: string;
  driverLicenseIssueDate?: string;
  driverLicenseIssuePlace?: string;
  idCardNumber?: string;
  idCardExpiry?: string;
  idCardIssuePlace?: string;
}

export interface RentalAgreement {
  pickupTime?: string;
  returnTime?: string;
  prices?: {
    daily?: number;
    weekend?: number;
    weekly?: number;
    total?: number;
  };
  deposits?: {
    lock?: boolean;
    straps?: boolean;
    adapter?: boolean;
    registration?: boolean;
    general?: number;
    total?: number;
  };
  paymentMethod?: "BAR" | "EC-Karte" | "Kreditkarte";
}

export interface ReservationHistoryEntry {
  id: string;
  action: "created" | "released" | "edited" | "status_changed" | "completed" | "cancelled";
  timestamp: string;
  profileId?: string;
  profileName?: string;
}

export interface Reservation {
  id: string;
  trailerId: string;
  clientId: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  status: "paid" | "invoiced" | "defect" | "completed" | "active" | "cancelled";
  invoiceNumber?: string;
  defectNote?: string;
  agreement?: RentalAgreement;
  history?: ReservationHistoryEntry[];
}

const today = startOfDay(new Date());

export interface UserProfile {
  id: string;
  name: string;
  isOnline: boolean;
}

export const initialProfiles: UserProfile[] = [
  { id: "u1", name: "Erwin", isOnline: false },
  { id: "u2", name: "Steffi", isOnline: false },
  { id: "u3", name: "BOSS", isOnline: false },
];

export const initialTrailers: Trailer[] = [
  { id: "t1", plate: "N-DC 882", type: "Laweta", capacity: "2500kg", dimensions: "4m x 2m", tuvExpiry: addDays(today, 180).toISOString(), status: "available" },
  { id: "t2", plate: "N-DC 1120", type: "Chłodnia", capacity: "1500kg", dimensions: "3m x 1.5m", tuvExpiry: addDays(today, 30).toISOString(), status: "service" },
  { id: "t3", plate: "N-DC 130", type: "Konie", capacity: "2000kg", dimensions: "3.5m x 1.8m", tuvExpiry: addDays(today, 14).toISOString(), status: "available" },
  { id: "t4", plate: "N-DC 550", type: "Wciągarka", capacity: "3000kg", dimensions: "5m x 2.2m", tuvExpiry: addDays(today, 365).toISOString(), status: "available" },
  { id: "t5", plate: "N-DC 990", type: "Laweta", capacity: "2000kg", dimensions: "4m x 2m", tuvExpiry: addDays(today, 60).toISOString(), status: "available" },
];

export const initialClients: Client[] = [
  { id: "c1", name: "Cofibra", balance: 0, notes: "Stały klient", type: "company", nip: "1234567890" },
  { id: "c2", name: "BMB", balance: 400, notes: "Zalega z płatnością za ostatni miesiąc", type: "company" },
  { id: "c3", name: "Alexander", balance: 120, notes: "Opona przebita, dopłata 120 euro", type: "private" },
];

export const initialReservations: Reservation[] = [
  { id: "r1", trailerId: "t1", clientId: "c1", startDate: subDays(today, 2).toISOString(), endDate: addDays(today, 2).toISOString(), status: "paid", invoiceNumber: "Re-Nr. 204221" },
  { id: "r2", trailerId: "t2", clientId: "c2", startDate: subDays(today, 1).toISOString(), endDate: addDays(today, 1).toISOString(), status: "defect", defectNote: "Achse defekt" },
  { id: "r3", trailerId: "t3", clientId: "c3", startDate: today.toISOString(), endDate: addDays(today, 3).toISOString(), status: "invoiced", invoiceNumber: "Re-Nr. 204222" },
  { id: "r4", trailerId: "t4", clientId: "c1", startDate: addDays(today, 5).toISOString(), endDate: addDays(today, 7).toISOString(), status: "paid", invoiceNumber: "Re-Nr. 204223" },
];
