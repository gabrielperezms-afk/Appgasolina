"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { FuelType, StationWithDistance } from "@/lib/types";

const ICON_COLORS: Record<string, string> = {
  aprobado: "#10b981",
  no_aprobado: "#ef4444",
  sin_producto: "#f59e0b",
  desconocido: "#a1a1aa",
};

const PIN_PATH =
  "M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z";

function makeIcon(color: string, big: boolean) {
  const w = big ? 30 : 22;
  const h = Math.round((w * 512) / 384);
  return L.divIcon({
    className: "",
    html: `<svg width="${w}" height="${h}" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 2px rgba(0,0,0,.45))">
      <path fill-rule="evenodd" d="${PIN_PATH}" fill="${color}" stroke="white" stroke-width="14"/>
    </svg>`,
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h + 4],
  });
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
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [18.7357, -70.1627],
      zoom: 8,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally read at cleanup time
      markersRef.current.clear();
      userMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const existing = markersRef.current;
    const seen = new Set<number>();

    for (const st of stations) {
      if (st.lat == null || st.lon == null) continue;
      seen.add(st.id);
      const status = fuelType === "premium" ? st.ron_premium : st.ron_regular;
      const isSelected = st.id === selectedId;
      const icon = makeIcon(ICON_COLORS[status] ?? ICON_COLORS.desconocido, isSelected);
      let marker = existing.get(st.id);
      if (!marker) {
        marker = L.marker([st.lat, st.lon], { icon });
        marker.on("click", () => onSelect(st.id));
        marker.addTo(map);
        existing.set(st.id, marker);
      } else {
        marker.setLatLng([st.lat, st.lon]);
        marker.setIcon(icon);
      }
      marker.bindPopup(
        `<strong>${st.nombre}</strong><br/>${st.direccion ? st.direccion + ", " : ""}${st.provincia}`
      );
      if (isSelected) {
        map.setView([st.lat, st.lon], Math.max(map.getZoom(), 13), { animate: true });
        marker.openPopup();
      }
    }

    for (const [id, marker] of existing) {
      if (!seen.has(id)) {
        marker.remove();
        existing.delete(id);
      }
    }
  }, [stations, fuelType, selectedId, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (userLocation) {
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lon], {
          icon: L.divIcon({
            className: "",
            html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,.4)"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          }),
        }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lon]);
      }
      map.setView([userLocation.lat, userLocation.lon], 13);
    }
  }, [userLocation]);

  return <div ref={containerRef} className="h-full w-full rounded-xl" />;
}
