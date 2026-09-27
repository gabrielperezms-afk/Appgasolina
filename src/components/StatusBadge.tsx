import type { FuelType, RonStatus } from "@/lib/types";

const CONFIG: Record<RonStatus, { label: string; className: string }> = {
  aprobado: {
    label: "Aprobada",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  no_aprobado: {
    label: "No aprobada",
    className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  },
  sin_producto: {
    label: "Sin producto",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  desconocido: {
    label: "Sin datos",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
};

// Umbral RON publicado por Industria y Comercio para cada tipo de combustible.
// El informe original no publica el valor medido por estación, solo si superó
// o no este umbral en la última inspección.
const RON_THRESHOLD: Record<FuelType, { pass: number; fail: number }> = {
  premium: { pass: 94.5, fail: 94.4 },
  regular: { pass: 88.5, fail: 88.4 },
};

function ronNote(status: RonStatus, fuel: FuelType): string | null {
  const t = RON_THRESHOLD[fuel];
  if (status === "aprobado") return `RON ≥ ${t.pass}`;
  if (status === "no_aprobado") return `RON ≤ ${t.fail}`;
  return null;
}

export default function StatusBadge({
  status,
  label,
  fuel,
}: {
  status: RonStatus;
  label: string;
  fuel: FuelType;
}) {
  const cfg = CONFIG[status] ?? CONFIG.desconocido;
  const note = ronNote(status, fuel);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}
      title={`${label}: ${cfg.label}${note ? ` (${note})` : ""}`}
    >
      {label}: {cfg.label}
      {note && <span className="opacity-70">· {note}</span>}
    </span>
  );
}
