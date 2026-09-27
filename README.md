# Gasolina RD

Aplicación web para consultar la calidad de combustible (RON) de estaciones de servicio en República Dominicana, según los informes de inspección del Ministerio de Industria, Comercio y Mipymes.

## Funcionalidades

- Búsqueda de estaciones por nombre o dirección.
- Filtro por tipo de combustible (Premium / Regular), provincia y estatus de aprobación.
- Ordenar por mejor calificación, por cercanía (usando tu ubicación) o alfabéticamente.
- Mapa interactivo (Leaflet + OpenStreetMap) con marcadores coloreados por resultado.

## Datos

Los datos provienen de los PDFs "Gasolina premium.pdf" y "Gasolina regular.pdf" (informes RON) y fueron procesados a `src/data/stations.json`. Las coordenadas se obtuvieron por geocodificación (Nominatim/OpenStreetMap) con respaldo al centroide de la provincia cuando la dirección no pudo geocodificarse con precisión.

## Desarrollo

```bash
npm install
npm run dev
```

## Despliegue

Proyecto listo para desplegar en Vercel (Next.js estándar, sin variables de entorno requeridas).
