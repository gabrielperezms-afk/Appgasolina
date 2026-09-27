import raw from "@/data/stations.json";
import type { Station } from "./types";

export const stations: Station[] = raw as Station[];

export const provincias: string[] = Array.from(
  new Set(stations.map((s) => s.provincia).filter(Boolean))
).sort((a, b) => a.localeCompare(b, "es"));

export function statusRank(status: Station["ron_premium"]): number {
  switch (status) {
    case "aprobado":
      return 0;
    case "sin_producto":
      return 1;
    case "no_aprobado":
      return 2;
    default:
      return 3;
  }
}
