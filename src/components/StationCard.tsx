import type { StationWithDistance } from "@/lib/types";
import StatusBadge from "./StatusBadge";

export default function StationCard({
  station,
  selected,
  onClick,
}: {
  station: StationWithDistance;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-3 transition-colors ${
        selected
          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">
          {station.nombre}
        </h3>
        {station.distanceKm !== null && (
          <span className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {station.distanceKm < 1
              ? `${Math.round(station.distanceKm * 1000)} m`
              : `${station.distanceKm.toFixed(1)} km`}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {station.direccion ? `${station.direccion}, ` : ""}
        {station.provincia}
        {station.precision !== "geocoded" && (
          <span className="italic"> · ubicación aproximada</span>
        )}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <StatusBadge status={station.ron_premium} label="Premium" fuel="premium" />
        <StatusBadge status={station.ron_regular} label="Regular" fuel="regular" />
      </div>
    </button>
  );
}
