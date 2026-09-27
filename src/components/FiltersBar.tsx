"use client";

import type { FuelType } from "@/lib/types";

export type SortMode = "calificacion" | "distancia" | "nombre";

export default function FiltersBar({
  query,
  onQueryChange,
  fuelType,
  onFuelTypeChange,
  provincia,
  onProvinciaChange,
  provincias,
  onlyApproved,
  onOnlyApprovedChange,
  sortMode,
  onSortModeChange,
  hasLocation,
  onRequestLocation,
  locationStatus,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  fuelType: FuelType;
  onFuelTypeChange: (v: FuelType) => void;
  provincia: string;
  onProvinciaChange: (v: string) => void;
  provincias: string[];
  onlyApproved: boolean;
  onOnlyApprovedChange: (v: boolean) => void;
  sortMode: SortMode;
  onSortModeChange: (v: SortMode) => void;
  hasLocation: boolean;
  onRequestLocation: () => void;
  locationStatus: "idle" | "loading" | "denied" | "error";
}) {
  return (
    <div className="flex flex-col gap-3 p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar estación o dirección..."
          className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={onRequestLocation}
          className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            hasLocation
              ? "bg-emerald-600 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          {locationStatus === "loading"
            ? "Buscando..."
            : hasLocation
            ? "📍 Ubicación activa"
            : "📍 Usar mi ubicación"}
        </button>
      </div>
      {locationStatus === "denied" && (
        <p className="text-xs text-red-600 dark:text-red-400">
          Permiso de ubicación denegado. Actívalo en la configuración del navegador para ver
          las estaciones más cercanas.
        </p>
      )}
      {locationStatus === "error" && (
        <p className="text-xs text-red-600 dark:text-red-400">
          No se pudo obtener tu ubicación. Intenta de nuevo.
        </p>
      )}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-700 overflow-hidden text-sm">
          {(["premium", "regular"] as FuelType[]).map((t) => (
            <button
              key={t}
              onClick={() => onFuelTypeChange(t)}
              className={`px-3 py-1.5 font-medium capitalize ${
                fuelType === t
                  ? "bg-emerald-600 text-white"
                  : "bg-transparent text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <select
          value={provincia}
          onChange={(e) => onProvinciaChange(e.target.value)}
          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm"
        >
          <option value="">Todas las provincias</option>
          {provincias.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={sortMode}
          onChange={(e) => onSortModeChange(e.target.value as SortMode)}
          className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm"
        >
          <option value="calificacion">Mejor calificación primero</option>
          <option value="distancia">Más cercana primero</option>
          <option value="nombre">Nombre A-Z</option>
        </select>

        <label className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={onlyApproved}
            onChange={(e) => onOnlyApprovedChange(e.target.checked)}
            className="rounded"
          />
          Solo aprobadas
        </label>
      </div>
    </div>
  );
}
