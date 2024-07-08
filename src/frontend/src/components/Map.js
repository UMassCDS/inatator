import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Polygon,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as h3 from "h3-js/legacy";

const SelectedHexagonLayer = () => {
  // Layer for colored hexagons
  const map = useMap();
  const [hexagons, setHexagons] = useState(new Set());
  const resolution = 5;

  const addHex = (id) => {
    // wrapper functions for useState
    setHexagons((hexagons) => new Set([...hexagons, id]));
  };

  const delHex = (id) => {
    setHexagons(
      (hexagons) => new Set([...hexagons].filter((idx) => idx !== id))
    );
  };

  map.on("click", (e) => {
    // on click, get the clicked h3-id and add it or delete it based on if it was selected previously
    const id = h3.geoToH3(e.latlng.lat, e.latlng.lng, resolution);
    if (hexagons.has(id)) {
      delHex(id);
    } else {
      addHex(id);
    }
  });

  return (
    <Polygon
      positions={[...hexagons].map(
        (
          id // maps indexes to polygon positions
        ) => h3.h3ToGeoBoundary(id, false).map(([lat, lng]) => [lat, lng])
      )}
      pathOptions={{
        color: "red",
        fillColor: "red",
        fillOpacity: 0.2,
        opacity: 0.4,
      }}
    />
  );
};

// Component to generate and display hexagons
const HexagonLayer = () => {
  const [hexagons, setHexagons] = useState([]);
  const map = useMap();
  const hexResolution = 5;

  const generateHexagons = (hexResolution) => {
    if (map.getZoom() <= 7) {
      // function only draws the polygon if zoom level constraint is satisfied
      setHexagons([]);
      return;
    }
    const { _southWest: sw, _northEast: ne } = map.getBounds();
    const screenBounds = [
      [sw.lat, sw.lng],
      [ne.lat, sw.lng],
      [ne.lat, ne.lng],
      [sw.lat, ne.lng],
      [sw.lat, sw.lng],
    ];

    const hexIdxs = h3.polyfill(screenBounds, hexResolution); // fills onscreen rectangle with h3

    const hexagonsData = hexIdxs.map((hex) =>
      h3.h3ToGeoBoundary(hex, false).map(([lat, lng]) => [lat, lng])
    );
    setHexagons(hexagonsData); // sets and renders screen
  };

  map.on("moveend", () => generateHexagons(hexResolution)); // it is better if it renders at 'end' because otherwise it gets really slow
  map.on("zoomend", () => generateHexagons(hexResolution)); // event listeners to achieve dynamic renders with interactions with the map

  return (
    <Polygon
      positions={hexagons}
      pathOptions={{
        color: "white",
        fillColor: "white",
        fillOpacity: 0.2,
        opacity: 0.4,
      }}
    />
  );
};

// Component for Prediction Polygon
const PredictionPolygon = ({ hullPoints }) => {
  const map = useMap();

  useEffect(() => {
    if (hullPoints) {
      map.flyToBounds(hullPoints, { maxZoom: 5 });
    }
  }, [hullPoints, map]);

  return hullPoints ? (
    <Polygon
      positions={hullPoints}
      pathOptions={{ color: "purple", fillColor: "purple", opacity: 0.7 }}
    />
  ) : null;
};

// Main Map Component
const Map = ({ hullPoints }) => {
  return (
    <MapContainer
      center={[39, 34]}
      zoom={3}
      style={{ height: "100vh", width: "100%" }}
    >
      <LayersControl position="topright">
        {/* Base Layers */}
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="World Light Gray Base">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="World Imagery">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.arcgis.com/">ArcGIS</a>'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="World Topo Map">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.arcgis.com/">ArcGIS</a>'
          />
        </LayersControl.BaseLayer>
        {/* Render the PredictionPolygon if hullPoints are available */}
        {hullPoints && (
          <LayersControl.Overlay checked name="Prediction Polygon">
            <PredictionPolygon hullPoints={hullPoints} />
          </LayersControl.Overlay>
        )}
        {/* Render the Hexagon Layer */}
        <LayersControl.Overlay checked name="Hexagon Grid">
          <HexagonLayer />
        </LayersControl.Overlay>

        {/* Render the Selected Hexagon Layer */}
        <LayersControl.Overlay checked name="Select Hexagon Grid">
          <SelectedHexagonLayer />
        </LayersControl.Overlay>
      </LayersControl>
    </MapContainer>
  );
};

export default Map;
