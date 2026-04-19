import { addDays, subDays, startOfDay } from "date-fns";

export type TrailerType = 
  | "Laweta" 
  | "Chłodnia" 
  | "Konie" 
  | "Wciągarka" 
  | "Przyczepa kablowa" 
  | "Wciągarka pomocnicza" 
  | "Wpycharka do kabli" 
  | "Kompresor"
  | "Z plandeką"
  | "Kontener"
  | "Otwarta"
  | "Wywrotka"
  | "Maszynowa"
  | "Motocyklowa"
  | "Opuszczana"
  | "LKW"
  | "Obrotnica";

export interface Trailer {
  id: string;
  plate?: string;
  type: TrailerType;
  capacity: string;
  dimensions: string;
  tuvExpiry?: string; // ISO date
  status: "available" | "service";
  vin?: string;
  model?: string;
  specs?: string;
  notes?: string;
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

export interface ReturnProtocolState {
  fahrzeugausstattung: { uebergabe: boolean; rueckgabe: boolean };
  planeUndSpriegel: { uebergabe: boolean; rueckgabe: boolean };
  kofferaufbau: { uebergabe: boolean; rueckgabe: boolean };
  kupplung: { uebergabe: boolean; rueckgabe: boolean };
  auflaufbremse: { uebergabe: boolean; rueckgabe: boolean };
  elektrik: { uebergabe: boolean; rueckgabe: boolean };
  reifen: { uebergabe: boolean; rueckgabe: boolean };
  stuetzrad: { uebergabe: boolean; rueckgabe: boolean };
  bordwaende: { uebergabe: boolean; rueckgabe: boolean };
  leuchten: { uebergabe: boolean; rueckgabe: boolean };
  damageDescription?: string;
  returnDate?: string;
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
  protocol?: ReturnProtocolState;
  history?: ReservationHistoryEntry[];
  pickupPhotos?: string[];
  returnPhotos?: string[];
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
  // 📦 Przyczepy z plandeką (Planenanhänger)
  { id: "t_ndc130", plate: "N-DC 130", type: "Z plandeką", capacity: "750 kg / 580 kg", dimensions: "210 x 130 x 155 cm", tuvExpiry: "2026-03-01T00:00:00Z", vin: "WB0AU1AA300238979", model: "Tieflader (koła na zewnątrz)", status: "available" },
  { id: "t_ndc135", plate: "N-DC 135", type: "Z plandeką", capacity: "1000 kg / 690 kg", dimensions: "252 x 150 x 155 cm", tuvExpiry: "2027-05-01T00:00:00Z", vin: "WB0AB1AAA00351994", model: "Tieflader (Tempo 100 km/h)", status: "available" },
  { id: "t_ndc1112", plate: "N-DC 1112", type: "Z plandeką", capacity: "1300 kg / 965 kg", dimensions: "251 x 126 x 180 cm", tuvExpiry: "2027-05-01T00:00:00Z", vin: "W090011316ND20760", model: "Tieflader (Tempo 100 km/h)", status: "available" },
  { id: "t_ndc1113", plate: "N-DC 1113", type: "Z plandeką", capacity: "1300 kg / 965 kg", dimensions: "251 x 126 x 155 cm", tuvExpiry: "2027-05-01T00:00:00Z", vin: "W090011316ND20761", model: "Tieflader (Tempo 100 km/h)", status: "available" },
  { id: "t_nue609", plate: "N-UE 609", type: "Z plandeką", capacity: "2700 kg / 2205 kg", dimensions: "365 x 150 x 175 cm", model: "Tieflader (Tempo 100 km/h)", status: "service", notes: "Verkauft (Sprzedana)" },
  { id: "t_ndc210", plate: "N-DC 210", type: "Z plandeką", capacity: "3500 kg / 2595 kg", dimensions: "517 x 200 x 220 cm", tuvExpiry: "2026-03-01T00:00:00Z", vin: "W090002357ND20677", model: "Hochlader (koła pod spodem)", status: "available" },
  { id: "t_nuf179", plate: "N-UF 179", type: "Z plandeką", capacity: "2700 kg / 2130 kg", dimensions: "405 x 205 x 190 cm", tuvExpiry: "2026-11-01T00:00:00Z", vin: "YC3PL272002000632", model: "Hochlader (Tempo 100 km/h)", status: "available" },
  { id: "t_ndc1120", plate: "N-DC 1120", type: "Z plandeką", capacity: "2600 kg / 1960 kg", dimensions: "400 x 180 x 180 cm", tuvExpiry: "2027-05-01T00:00:00Z", vin: "W090022613ND20745", model: "Tieflader (Brak Tempo 100)", status: "service", notes: "DEFEKT / abgemeldet" },
  { id: "t_ndc1121", plate: "N-DC 1121", type: "Z plandeką", capacity: "2700 kg / 2050 kg", dimensions: "324 x 180 x 185 cm", tuvExpiry: "2027-07-01T00:00:00Z", vin: "WB0CH3AA100209263", model: "Hochlader (Tempo 100 km/h)", status: "available" },
  { id: "t_nuo377", plate: "N-UO 377", type: "Z plandeką", capacity: "2700 kg / 2220 kg", dimensions: "405 x 180 x 230 cm", tuvExpiry: "2028-02-01T00:00:00Z", vin: "XLG00PL30A0351608", model: "Hochlader (Tempo 100 km/h)", status: "available" },
  { id: "t_nik909", plate: "N-IK 909", type: "Z plandeką", capacity: "3500 kg / 2450 kg", dimensions: "600 x 180 x 205 cm", tuvExpiry: "2026-08-01T00:00:00Z", vin: "W090003355ND20645", model: "Drehschemel (Obrotnica)", status: "available" },
  { id: "t_nsd523", plate: "N-SD 523", type: "Kontener", capacity: "2000 kg / 1420 kg", dimensions: "-", model: "Hochlader", status: "service", notes: "Brak aktualnego TÜV/VIN. Achse defekt" },

  // 🚪 Przyczepy zamknięte / Kontenery (Koffer)
  { id: "t_ndc306", plate: "N-DC 306", type: "Kontener", capacity: "2700 kg / 2078 kg", dimensions: "301 x 150 x 180 cm", tuvExpiry: "2027-07-01T00:00:00Z", vin: "WB0AT1AA800310620", model: "Drzwi / Rampa (Tempo 100 km/h)", status: "available" },
  { id: "t_ndc307", plate: "N-DC 307", type: "Kontener", capacity: "1350 kg / 1014 kg", dimensions: "251 x 130 x 150 cm", tuvExpiry: "2026-04-01T00:00:00Z", vin: "WB0AB1AA900338879", model: "Drzwi skrzydełkowe (Flügeltüre)", status: "available" },
  { id: "t_ndc311", plate: "N-DC 311", type: "Kontener", capacity: "1350 kg / 1000 kg", dimensions: "251 x 130 x 150 cm", tuvExpiry: "2027-08-01T00:00:00Z", vin: "WB0AB1AAA00333786", model: "Aluminiowa", status: "available" },
  { id: "t_ndc305", plate: "N-DC 305", type: "Kontener", capacity: "2700 kg / 1800 kg", dimensions: "360 x 160 x 175 cm", tuvExpiry: "2027-05-01T00:00:00Z", vin: "WB0AB1AAA00333786", model: "Aluminiowa", status: "available", notes: "VIN taki sam jak N-DC 311?" },
  { id: "t_ndc344", plate: "N-DC 344", type: "Kontener", capacity: "1600 kg / 1220 kg", dimensions: "250 x 150 x 105 cm", tuvExpiry: "2026-10-01T00:00:00Z", vin: "W090002274ND20622", model: "Z pokrywą / Deckel (Tempo 100)", status: "service", notes: "Sprzedana (Verkauft an Reichenmacher)" },

  // 🚧 Przyczepy otwarte i z siatką (Offen / Laubgitter)
  { id: "t_ndc2002", plate: "N-DC 2002", type: "Otwarta", capacity: "750 kg / 460 kg", dimensions: "251 x 126 x 40 cm", tuvExpiry: "2026-10-01T00:00:00Z", vin: "W090001167ND20683", model: "Otwarte burty", status: "available" },
  { id: "t_nhd219", plate: "N-HD 219", type: "Otwarta", capacity: "2500 kg / 1930 kg", dimensions: "335 x 165 x 40 cm", tuvExpiry: "2027-02-01T00:00:00Z", vin: "39451", model: "Otwarte burty", status: "available" },
  { id: "t_ndc2003", plate: "N-DC 2003", type: "Otwarta", capacity: "750 kg / 460 kg", dimensions: "250 x 126 x 40 cm", tuvExpiry: "2027-05-01T00:00:00Z", vin: "W090010721ND20769", model: "Otwarte burty", status: "available" },
  { id: "t_ndc2000", plate: "N-DC 2000", type: "Otwarta", capacity: "1350 kg / 1065 kg", dimensions: "251 x 127 x 39 cm", tuvExpiry: "2026-08-01T00:00:00Z", vin: "W090011314ND20749", model: "Z nadstawką siatkową / Laubgitter", status: "available" },
  { id: "t_ndc260", plate: "N-DC 260", type: "Otwarta", capacity: "2700 kg / 1840 kg", dimensions: "625 x 240 x 55 cm", tuvExpiry: "2027-10-01T00:00:00Z", vin: "W0900002277ND20684", model: "Otwarte burty", status: "available" },

  // ❄️ Chłodnie (Kühlanhänger)
  { id: "t_ndc408", plate: "N-DC 408", type: "Chłodnia", capacity: "1860 kg / 1000 kg", dimensions: "310 x 160 x 200 cm", tuvExpiry: "2026-08-01T00:00:00Z", vin: "W090002277ND20684", model: "Kühler (Tempo 100 km/h)", status: "service", notes: "Sprzedana (verkauft)" },
  { id: "t_kuhler_rotenr", plate: "Kühler RoteNr.", type: "Chłodnia", capacity: "1200 kg / 650 kg", dimensions: "240 x 145 x 195 cm", model: "Tylko na czerwone tablice", status: "available" },
  { id: "t_kuhler_neussinger", plate: "Kühler Neussinger", type: "Chłodnia", capacity: "2500 kg / 1530 kg", dimensions: "300 x 140 x 200 cm", model: "Kühler Neussinger", status: "available" },
  { id: "t_nuc556", plate: "N-UC 556", type: "Chłodnia", capacity: "2000 kg / 1150 kg", dimensions: "355 x 160 x 195 cm", tuvExpiry: "2026-08-01T00:00:00Z", vin: "GA9001854", model: "Kühler", status: "available" },
  { id: "t_ndc450", plate: "N-DC 450", type: "Chłodnia", capacity: "3500 kg / 2010 kg", dimensions: "360 x 205 x 200 cm", tuvExpiry: "2026-06-01T00:00:00Z", vin: "W090002357ND20680", model: "Kühler", status: "available" },

  // 🏗️ Wywrotki (Kipper)
  { id: "t_ndc501_v1", plate: "N-DC 501", type: "Wywrotka", capacity: "2700 kg / 2034 kg", dimensions: "256 x 165 x 30 cm", tuvExpiry: "2027-02-01T00:00:00Z", vin: "WHD353518W0121349", model: "Wywrotka tylna elektryczna", status: "available" },
  { id: "t_ndc508", plate: "N-DC 508", type: "Wywrotka", capacity: "3500 kg / 2510 kg", dimensions: "324 x 180 x 35 cm", tuvExpiry: "2027-06-01T00:00:00Z", vin: "WB0RDK2A400209305", model: "Trójstronna elektryczna", status: "available" },
  { id: "t_ndc507", plate: "N-DC 507", type: "Wywrotka", capacity: "3500 kg / 2510 kg", dimensions: "324 x 180 x 35 cm", tuvExpiry: "2027-07-01T00:00:00Z", vin: "WB0RDK2A100209813", model: "Trójstronna elektryczna", status: "available" },
  { id: "t_ndc502", plate: "N-DC 502", type: "Wywrotka", capacity: "3500 kg / 2490 kg", dimensions: "350 x 180 x 40 cm", model: "Trójstronna (bez pompy elektr.)", status: "service", notes: "Sprzedana" },
  { id: "t_ndc503", plate: "N-DC 503", type: "Wywrotka", capacity: "3500 kg / 2500 kg", dimensions: "324 x 180 x 35 cm", model: "Trójstronna elektryczna", status: "service", notes: "Sprzedana" },
  { id: "t_ndc501_v2", plate: "N-DC 501 (V2)", type: "Wywrotka", capacity: "2500 kg / 2570 kg", dimensions: "348 x 182 x 40 cm", model: "Starsza wersja", status: "service", notes: "Zastąpiona nowszym modelem" },

  // 🚗 Autolawety i przyczepy maszynowe
  { id: "t_ndc704", plate: "N-DC 704", type: "Laweta", capacity: "2700 kg / 2035 kg", dimensions: "410 x 194 cm", tuvExpiry: "2027-06-01T00:00:00Z", vin: "TJ5R2B2J0F1058465", model: "Uchylna / Kippbar (Tempo 100)", status: "available" },
  { id: "t_ndc706", plate: "N-DC 706", type: "Laweta", capacity: "2700 kg / 2075 kg", dimensions: "410 x 205 cm", tuvExpiry: "2027-11-01T00:00:00Z", vin: "YC340204202517655", model: "Hochlader EDUARD (Tempo 100)", status: "available" },
  { id: "t_ndc708", plate: "N-DC 708", type: "Laweta", capacity: "2700 kg / 2075 kg", dimensions: "410 x 205 cm", tuvExpiry: "2027-11-01T00:00:00Z", vin: "YC340204702517716", model: "Hochlader EDUARD (Tempo 100)", status: "available" },
  { id: "t_nav457", plate: "N-AV 457", type: "Z plandeką", capacity: "2500 kg / 1905 kg", dimensions: "490 x 202 x 180 cm", tuvExpiry: "2027-11-01T00:00:00Z", vin: "WHD245019Y0159676", model: "Uchylna z plandeką (Tempo 100)", status: "available", notes: "Dawniej obrotnica (DEFEKT)" },
  { id: "t_nto625", plate: "N-TO 625", type: "Laweta", capacity: "3500 kg / 2720 kg", dimensions: "560 x 243 x 10 cm", tuvExpiry: "2026-07-01T00:00:00Z", vin: "W090002353ND20603", model: "Hochlader", status: "available" },
  { id: "t_ndc717", plate: "N-DC 717", type: "Laweta", capacity: "3500 kg / 2220 kg", dimensions: "580 x 240 cm", tuvExpiry: "2027-03-01T00:00:00Z", vin: "W090023521ND20776", model: "Hochlader", status: "available" },
  { id: "t_ndc108", plate: "N-DC 108", type: "Kontener", capacity: "3000 kg / 1440 kg", dimensions: "600 x 240 x 210 cm", tuvExpiry: "2026-03-01T00:00:00Z", vin: "504081", model: "Kontener wielkogabarytowy", status: "available" },
  { id: "t_ndc701_old", plate: "Bez rejestracji", type: "Obrotnica", capacity: "3500 kg / 2550 kg", dimensions: "860 x 220 x 10 cm", tuvExpiry: "2026-12-01T00:00:00Z", vin: "W09D35003A0B94133", model: "Drehschemel (Dawniej N-DC 701)", status: "available" },
  { id: "t_ndc702", plate: "N-DC 702", type: "Maszynowa", capacity: "3500 kg / 2930 kg", dimensions: "353 x 165 x 10 cm", tuvExpiry: "2027-05-01T00:00:00Z", vin: "VA9D1604967VB1120", model: "Transport maszyn / aut", status: "available" },
  { id: "t_ndc703", plate: "N-DC 703", type: "Laweta", capacity: "2700 kg / 2095 kg", dimensions: "410 x 193 x 10 cm", model: "Autotransporter", status: "service", notes: "Sprzedana" },

  // 🏍️ Przyczepy motocyklowe i opuszczane
  { id: "t_ndc266", plate: "N-DC 266", type: "Motocyklowa", capacity: "750 kg / 600 kg", dimensions: "200 x 128 cm", tuvExpiry: "2026-08-01T00:00:00Z", vin: "WSEMT751U6G001024", model: "Motocyklowa (Tempo 80)", status: "available" },
  { id: "t_nfr821", plate: "N-FR 821", type: "Motocyklowa", capacity: "750 kg / 466 kg", dimensions: "225 x 130 cm", tuvExpiry: "2026-09-01T00:00:00Z", vin: "WHD07201130244952", model: "1-szynowa (Tempo 100)", status: "available" },
  { id: "t_ndc695", plate: "N-DC 695", type: "Motocyklowa", capacity: "850 kg / 670 kg", dimensions: "210 x 128 cm", tuvExpiry: "2027-05-01T00:00:00Z", vin: "WSEMT0850HG800707", model: "3-szynowa (Tempo 100)", status: "available" },
  { id: "t_nue599", plate: "N-UE 599", type: "Motocyklowa", capacity: "1350 kg / 923 kg", dimensions: "305 x 170 cm", tuvExpiry: "2026-06-01T00:00:00Z", vin: "WB0HB2AAA00201806", model: "3-szynowa (Tempo 100)", status: "available" },
  { id: "t_ndc601", plate: "N-DC 601", type: "Opuszczana", capacity: "1300 kg / 883 kg", dimensions: "254 x 152 cm", tuvExpiry: "2027-09-01T00:00:00Z", vin: "WSEAEBAABKG000970", model: "Opuszczana (Tempo 100)", status: "service", notes: "Sprzedana" },
  { id: "t_ndc607", plate: "N-DC 607", type: "Opuszczana", capacity: "750 kg / 508 kg", dimensions: "254 x 152 cm", tuvExpiry: "2029-02-01T00:00:00Z", vin: "WSEAAABAXTGA00241", model: "Opuszczana (Tempo 100)", status: "available" },
  { id: "t_ndc608", plate: "N-DC 608", type: "Opuszczana", capacity: "1800 kg / 1215 kg", dimensions: "303 x 169 cm", tuvExpiry: "2027-11-01T00:00:00Z", vin: "WSEBHAAB5SGA00012", model: "Opuszczana elektrycznie (Tempo 100)", status: "available" },
  { id: "t_ndc603", plate: "N-DC 603", type: "Opuszczana", capacity: "1800 kg / 1294 kg", dimensions: "310 x 169 cm", tuvExpiry: "2027-10-01T00:00:00Z", vin: "WSEAHAAB0SGA00074", model: "Opuszczana (Tempo 100)", status: "service", notes: "Sprzedana" },
  { id: "t_ndc610", plate: "N-DC 610", type: "Opuszczana", capacity: "1300 kg / 945 kg", dimensions: "253 x 152 cm", vin: "WSEAEBAA5TGA00675", model: "Opuszczana manualnie", status: "available" },

  // 🐴 Przyczepy do transportu koni
  { id: "t_ndc901", plate: "N-DC 901", type: "Konie", capacity: "2400 kg / 1828 kg", dimensions: "-", tuvExpiry: "2028-01-01T00:00:00Z", vin: "WB0PHAAA200283281", model: "Na 2 konie z siodlarnią", status: "available" },

  // 🚛 Ciężkie przyczepy ciężarowe (LKW)
  { id: "t_nzb896", plate: "N-ZB 896", type: "LKW", capacity: "4500 kg / 2410 kg", dimensions: "620 x 242 x 240 cm", tuvExpiry: "2024-01-01T00:00:00Z", vin: "W090001605ND20644", model: "Hochlader Plane", status: "available" },
  { id: "t_ndc820", plate: "N-DC 820", type: "LKW", capacity: "4500 kg / 2030 kg", dimensions: "760 x 245 x 250 cm", tuvExpiry: "2020-11-01T00:00:00Z", vin: "W090001609ND20706", model: "Hochlader Plane", status: "service", notes: "Konieczna weryfikacja TÜV" },
  { id: "t_ndc882_lkw", plate: "N-DC 882", type: "LKW", capacity: "11900 kg / 9180 kg", dimensions: "503 x 242 x 50 cm", tuvExpiry: "2024-06-01T00:00:00Z", vin: "WHD115024P1149477", model: "Wywrotka trójstronna (Dreiseiten Kipper)", status: "available" },
  { id: "t_ndc830", plate: "N-DC 830", type: "LKW", capacity: "9900 kg / 7400 kg", dimensions: "500 x 201 x 25 cm", tuvExpiry: "2027-01-01T00:00:00Z", vin: "WHD115020N1142984", model: "Tandem Tieflader", status: "available" },

  // Pozostałe / Wcześniejsze
  { id: "t_ndc882_old", plate: "N-DC 882 (Old)", type: "Laweta", capacity: "2500kg", dimensions: "4m x 2m", tuvExpiry: addDays(today, 180).toISOString(), status: "available" },
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
