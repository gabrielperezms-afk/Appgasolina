export type RonStatus = "aprobado" | "no_aprobado" | "sin_producto" | "desconocido";

export type FuelType = "premium" | "regular";

export interface Station {
  id: number;
  nombre: string;
  direccion: string;
  provincia: string;
  lat: number | null;
  lon: number | null;
  precision: "geocoded" | "provincia" | "ninguna";
  ron_premium: RonStatus;
  ron_regular: RonStatus;
}

export interface StationWithDistance extends Station {
  distanceKm: number | null;
}
