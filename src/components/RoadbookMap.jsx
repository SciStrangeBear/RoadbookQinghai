import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import {
  LayersControl,
  MapContainer,
  Polyline,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
const roadLayer = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};

const satelliteLayer = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attribution: "Tiles &copy; Esri",
};

export default function RoadbookMap({
  destinations,
  selectedId,
  onSelect,
  onMapModeChange,
  routeStyle,
}) {
  const route = destinations.map((place) => [
    place.coordinates.lat,
    place.coordinates.lng,
  ]);

  return (
    <MapContainer
      className="roadbook-map"
      center={[35.2, 99.2]}
      zoom={6}
      minZoom={4}
      maxZoom={18}
      zoomControl={false}
      preferCanvas
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="路网">
          <TileLayer {...roadLayer} />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="卫星">
          <TileLayer {...satelliteLayer} />
        </LayersControl.BaseLayer>
      </LayersControl>

      <ZoomControl position="bottomright" />
      <BaseLayerListener onChange={onMapModeChange} />
      <MapViewport destinations={destinations} selectedId={selectedId} />

      {routeStyle.visible && route.length > 1 && (
        <Polyline
          positions={route}
          pathOptions={{
            color: routeStyle.color,
            weight: routeStyle.shape === "dotted" ? 2.25 : 2.5,
            opacity: 0.9,
            dashArray:
              routeStyle.shape === "solid"
                ? undefined
                : routeStyle.shape === "dashed"
                  ? "10 8"
                  : "1 8",
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      )}

      {destinations.map((place) => (
        <HtmlMarker
          key={place.id}
          place={place}
          active={place.id === selectedId}
          onClick={() => onSelect(place)}
        />
      ))}
    </MapContainer>
  );
}

function BaseLayerListener({ onChange }) {
  const map = useMap();

  useEffect(() => {
    const handleBaseLayerChange = (event) => {
      onChange?.(event.name === "卫星" ? "satellite" : "road");
    };

    map.on("baselayerchange", handleBaseLayerChange);
    return () => map.off("baselayerchange", handleBaseLayerChange);
  }, [map, onChange]);

  return null;
}

function HtmlMarker({ place, active, onClick }) {
  const map = useMap();
  const elementRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const container = document.createElement("button");
    container.type = "button";
    container.className = `day-marker ${active ? "is-active" : ""}`;
    container.innerHTML = `
      <span class="marker-dot"></span>
      <span class="marker-label">
        <small>DAY</small>
        <strong>${String(place.day).padStart(2, "0")}${
          place.stop > 1 ? `<sup>·${place.stop}</sup>` : ""
        }</strong>
      </span>
      <span class="marker-name">${place.name}</span>
    `;
    container.addEventListener("click", onClick);
    elementRef.current = container;

    const icon = L.divIcon({
      html: container,
      className: "marker-wrapper",
      iconSize: [130, 56],
      iconAnchor: [17, 42],
    });

    markerRef.current = L.marker(
      [place.coordinates.lat, place.coordinates.lng],
      { icon, keyboard: false, riseOnHover: true },
    ).addTo(map);

    return () => {
      container.removeEventListener("click", onClick);
      markerRef.current?.remove();
    };
  }, [map, place, onClick]);

  useEffect(() => {
    elementRef.current?.classList.toggle("is-active", active);
    markerRef.current?.setZIndexOffset(active ? 1000 : 0);
  }, [active]);

  return null;
}

function MapViewport({ destinations, selectedId }) {
  const map = useMap();
  const initialFit = useRef(false);
  const selected = useMemo(
    () => destinations.find((place) => place.id === selectedId),
    [destinations, selectedId],
  );

  useEffect(() => {
    if (!destinations.length) return;

    if (selected) {
      const mobile = window.matchMedia("(max-width: 760px)").matches;
      const point = L.latLng(selected.coordinates.lat, selected.coordinates.lng);
      map.flyTo(point, Math.max(map.getZoom(), mobile ? 8 : 9), {
        duration: 1.1,
      });
      if (!mobile) map.panBy([180, 0], { animate: true });
      return;
    }

    const bounds = L.latLngBounds(
      destinations.map((place) => [
        place.coordinates.lat,
        place.coordinates.lng,
      ]),
    );
    map.fitBounds(bounds, {
      paddingTopLeft: [80, 110],
      paddingBottomRight: [80, 80],
      maxZoom: 8,
      animate: initialFit.current,
    });
    initialFit.current = true;
  }, [destinations, map, selected]);

  return null;
}
