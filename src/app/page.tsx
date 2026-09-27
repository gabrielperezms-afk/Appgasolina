"use client";

import { useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { stations, provincias, statusRank } from "@/lib/stations";
import { haversineKm } from "@/lib/distance";
import { normalizeText } from "@/lib/text";
import type { FuelType, StationWithDistance } from "@/lib/types";
import FiltersBar, { type SortMode } from "@/components/FiltersBar";
import StationCard from "@/components/StationCard";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type LocationStatus = "idle" | "loading" | "denied" | "error";

export default function Home() {
  const [query, setQuery] = useState("");
  const [fuelType, setFuelType] = useState<FuelType>("premium");
  const [provincia, setProvincia] = useState("");
  const [onlyApproved, setOnlyApproved] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("calificacion");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [showMapMobile, setShowMapMobile] = useState(false);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("error");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationStatus("idle");
        setSortMode("distancia");
      },
      (err) => {
        setLocationStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const withDistance: StationWithDistance[] = useMemo(() => {
    return stations.map((s) => ({
      ...s,
      distanceKm:
        userLocation && s.lat != null && s.lon != null
          ? haversineKm(userLocation.lat, userLocation.lon, s.lat, s.lon)
          : null,
    }));
  }, [userLocation]);

  const filtered = useMemo(() => {
    const q = normalizeText(query.trim());
    let list = withDistance.filter((s) => {
      if (provincia && s.provincia !== provincia) return false;
      if (
        q &&
        !normalizeText(s.nombre).includes(q) &&
        !normalizeText(s.direccion).includes(q)
      )
        return false;
      if (onlyApproved) {
        const status = fuelType === "premium" ? s.ron_premium : s.ron_regular;
        if (status !== "aprobado") return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortMode === "nombre") return a.nombre.localeCompare(b.nombre, "es");
      if (sortMode === "distancia") {
        if (a.distanceKm == null && b.distanceKm == null) return 0;
        if (a.distanceKm == null) return 1;
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      }
      // calificacion: aprobado primero, luego por distancia si existe, luego nombre
      const ra = statusRank(fuelType === "premium" ? a.ron_premium : a.ron_regular);
      const rb = statusRank(fuelType === "premium" ? b.ron_premium : b.ron_regular);
      if (ra !== rb) return ra - rb;
      if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm;
      if (a.distanceKm != null) return -1;
      if (b.distanceKm != null) return 1;
      return a.nombre.localeCompare(b.nombre, "es");
    });

    return list;
  }, [withDistance, query, provincia, onlyApproved, fuelType, sortMode]);

  const mapStations = useMemo(() => filtered.slice(0, 400), [filtered]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <header className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          ⛽ Gasolina RD
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Calidad de combustible (RON) por estación, según inspecciones del Ministerio de
          Industria, Comercio y Mipymes · Datos actualizados a junio 2026
        </p>
      </header>

      <FiltersBar
        query={query}
        onQueryChange={setQuery}
        fuelType={fuelType}
        onFuelTypeChange={setFuelType}
        provincia={provincia}
        onProvinciaChange={setProvincia}
        provincias={provincias}
        onlyApproved={onlyApproved}
        onOnlyApprovedChange={setOnlyApproved}
        sortMode={sortMode}
        onSortModeChange={setSortMode}
        hasLocation={userLocation !== null}
        onRequestLocation={requestLocation}
        locationStatus={locationStatus}
      />

      <div className="flex sm:hidden border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setShowMapMobile(false)}
          className={`flex-1 py-2 text-sm font-medium ${
            !showMapMobile ? "border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400" : "text-zinc-500"
          }`}
        >
          Lista ({filtered.length})
        </button>
        <button
          onClick={() => setShowMapMobile(true)}
          className={`flex-1 py-2 text-sm font-medium ${
            showMapMobile ? "border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400" : "text-zinc-500"
          }`}
        >
          Mapa
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        <div
          className={`${
            showMapMobile ? "hidden" : "flex"
          } sm:flex flex-col w-full sm:w-[380px] shrink-0 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto p-3 gap-2`}
        >
          <p className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400 px-1">
            {filtered.length} estaciones encontradas
          </p>
          {filtered.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 px-1 py-6 text-center">
              No se encontraron estaciones con esos filtros.
            </p>
          )}
          {filtered.map((s) => (
            <StationCard
              key={s.id}
              station={s}
              selected={s.id === selectedId}
              onClick={() => {
                setSelectedId(s.id);
                setShowMapMobile(true);
              }}
            />
          ))}
        </div>

        <div className={`${showMapMobile ? "flex" : "hidden"} sm:flex flex-1 min-h-0 p-0 sm:p-3`}>
          <MapView
            stations={mapStations}
            fuelType={fuelType}
            selectedId={selectedId}
            userLocation={userLocation}
            onSelect={setSelectedId}
          />
        </div>
      </div>
    </div>
  );
}
