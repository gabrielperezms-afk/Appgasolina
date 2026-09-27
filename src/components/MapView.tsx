"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import type { FuelType, StationWithDistance } from "@/lib/types";

const ICON_COLORS: Record<string, string> = {
  aprobado: "#10b981",
  no_aprobado: "#ef4444",
  sin_producto: "#f59e0b",
  desconocido: "#a1a1aa",
};

const PIN_PATH =
  "M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

let loaderPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (loaderPromise) return loaderPromise;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    loaderPromise = Promise.reject(
      new Error("Falta configurar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY")
    );
    return loaderPromise;
  }
  setOptions({ key: apiKey, v: "weekly" });
  loaderPromise = Promise.all([
    importLibrary("maps"),
    importLibrary("marker"),
  ]).then(() => undefined);
  return loaderPromise;
}

function pinIcon(color: string, big: boolean): google.maps.Symbol {
  const width = big ? 30 : 22;
  return {
    path: PIN_PATH,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "white",
    strokeWeight: 1.5,
    scale: width / 384,
    anchor: new google.maps.Point(192, 500),
  };
}

export default function MapView({
  stations,
  fuelType,
  selectedId,
  userLocation,
  onSelect,
}: {
  stations: StationWithDistance[];
  fuelType: FuelType;
  selectedId: number | null;
  userLocation: { lat: number; lon: number } | null;
  onSelect: (id: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<number, google.maps.Marker>>(new Map());
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!containerRef.current) return;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        const map = new google.maps.Map(containerRef.current, {
          center: { lat: 18.7357, lng: -70.1627 },
          zoom: 8,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapRef.current = map;
        infoWindowRef.current = new google.maps.InfoWindow();
        setReady(true);
      })
      .catch((err: Error) => {
        if (!cancelled) setLoadError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current) return;
    const map = mapRef.current;
    if (!map) return;
    const ro = new ResizeObserver(() => {
      const center = map.getCenter();
      google.maps.event.trigger(map, "resize");
      if (center) map.setCenter(center);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const existing = markersRef.current;
    const seen = new Set<number>();

    for (const st of stations) {
      if (st.lat == null || st.lon == null) continue;
      seen.add(st.id);
      const status = fuelType === "premium" ? st.ron_premium : st.ron_regular;
      const isSelected = st.id === selectedId;
      const icon = pinIcon(ICON_COLORS[status] ?? ICON_COLORS.desconocido, isSelected);
      let marker = existing.get(st.id);
      if (!marker) {
        marker = new google.maps.Marker({
          position: { lat: st.lat, lng: st.lon },
          map,
          icon,
        });
        marker.addListener("click", () => onSelect(st.id));
        existing.set(st.id, marker);
      } else {
        marker.setPosition({ lat: st.lat, lng: st.lon });
        marker.setIcon(icon);
      }
      marker.setZIndex(isSelected ? 999 : 1);
      if (isSelected) {
        map.panTo({ lat: st.lat, lng: st.lon });
        if ((map.getZoom() ?? 8) < 13) map.setZoom(13);
        const iw = infoWindowRef.current;
        if (iw) {
          iw.setContent(
            `<div style="font-family:inherit;font-size:13px;line-height:1.4;max-width:220px">` +
              `<strong>${escapeHtml(st.nombre)}</strong><br/>${
                st.direccion ? escapeHtml(st.direccion) + ", " : ""
              }${escapeHtml(st.provincia)}` +
              `</div>`
          );
          iw.open({ map, anchor: marker });
        }
      }
    }

    for (const [id, marker] of existing) {
      if (!seen.has(id)) {
        marker.setMap(null);
        existing.delete(id);
      }
    }
  }, [ready, stations, fuelType, selectedId, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !userLocation) return;
    const pos = { lat: userLocation.lat, lng: userLocation.lon };
    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        position: pos,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 3,
        },
        zIndex: 1000,
      });
    } else {
      userMarkerRef.current.setPosition(pos);
    }
    map.panTo(pos);
    map.setZoom(13);
  }, [ready, userLocation]);

  if (loadError) {
    return (
      <div className="h-full w-full rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
        No se pudo cargar Google Maps ({loadError}). Verifica la API key configurada.
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full rounded-xl" />;
}
