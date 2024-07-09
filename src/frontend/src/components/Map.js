import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Polygon,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as h3 from "h3-js/legacy";

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
        color: "gray",
        fillColor: "gray",
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

  return (
    hullPoints && (
      <Polygon
        positions={hullPoints}
        pathOptions={{ color: "blue", fillColor: "blue" }}
      />
    )
  );
};

const PredictionHexagons = ({ hexagons }) => {
  const map = useMap();

  useEffect(() => {
    if (hexagons) {
      map.flyToBounds(hexagons, { maxZoom: 5 });
    }
  }, [hexagons, map]);

  return (
    hexagons && (
      <Polygon
        positions={hexagons}
        pathOptions={{ color: "blue", fillColor: "blue" }}
      />
    )
  );
};

const AnnotationHexagonsLayer = ({ annotationHexagons }) => {
  return (
    annotationHexagons && (
      <Polygon
        positions={annotationHexagons}
        pathOptions={{ color: "green", fillColor: "green" }}
      />
    )
  );
};

const ClickHandler = ({ onAddAnnotationHexagons }) => {
  useMapEvents({
    click: (e) => {
      onAddAnnotationHexagons(e.latlng);
    },
  });
  return null;
};

const Map = ({
  hullPoints,
  hexagons,
  annotationHexagons,
  onAddAnnotationHexagons,
}) => {
  return (
    <MapContainer
      center={[39, 34]}
      zoom={3}
      style={{ height: "100vh", width: "100%" }}
    >
      <LayersControl position="topright">
        {/* Base Layers */}
        <LayersControl.BaseLayer name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer checked name="World Light Gray Base">
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
          <LayersControl.Overlay name="Prediction Polygon">
            <PredictionPolygon hullPoints={hullPoints} />
          </LayersControl.Overlay>
        )}
        {/* Render the Hexagon Layer */}
        <LayersControl.Overlay checked name="Hexagon Grid">
          <HexagonLayer />
        </LayersControl.Overlay>

        {/* Render the PredictionHexagons if hexagons are available */}
        {hexagons && (
          <LayersControl.Overlay checked name="Prediction Hexagons">
            <PredictionHexagons hexagons={hexagons} />
          </LayersControl.Overlay>
        )}

        {/* Custom Hexagons Layer */}
        <LayersControl.Overlay checked name="Current Annotation">
          <AnnotationHexagonsLayer annotationHexagons={annotationHexagons} />
        </LayersControl.Overlay>
      </LayersControl>

      <ClickHandler onAddAnnotationHexagons={onAddAnnotationHexagons} />
    </MapContainer>
  );
};

export default Map;
