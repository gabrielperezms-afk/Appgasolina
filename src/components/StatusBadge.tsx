import type { RonStatus } from "@/lib/types";

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

export default function StatusBadge({ status, label }: { status: RonStatus; label: string }) {
  const cfg = CONFIG[status] ?? CONFIG.desconocido;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}
      title={`${label}: ${cfg.label}`}
    >
      {label}: {cfg.label}
    </span>
  );
}
