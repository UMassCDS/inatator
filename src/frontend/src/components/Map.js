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

// Component to generate and display hexagons
const HexagonLayer = () => {
  const [hexagons, setHexagons] = useState([]);
  const [chosenHexagons, setChosenHexagons] = useState([]);
  const map = useMap();
  const hexResolution = 5;

  const generateHexagons = (hexResolution) => {
    const { _southWest: sw, _northEast: ne } = map.getBounds();
    const screenBounds = [
      [sw.lat, sw.lng],
      [ne.lat, sw.lng],
      [ne.lat, ne.lng],
      [sw.lat, ne.lng],
      [sw.lat, sw.lng],
    ];

    const hexIdxs = h3.polyfill(screenBounds, hexResolution);

    const hexagonsData = hexIdxs.map((hex) =>
      h3.h3ToGeoBoundary(hex, false).map(([lat, lng]) => [lat, lng])
    );
    setHexagons(hexagonsData);
  };

  map.on("moveend", () => map.getZoom() > 7 && generateHexagons(hexResolution)); // it is better if it renders at 'end' because otherwise it gets really slow
  map.on("zoomend", () => map.getZoom() > 7 && generateHexagons(hexResolution));
  // map.mouseEventToLatLng("click");
  map.on("click", (e) => {
    // e.latlng
    // console.log(e.latlng);

    setChosenHexagons(
      chosenHexagons.concat([
        h3.h3ToGeoBoundary(
          h3.geoToH3(e.latlng.lat, e.latlng.lng, hexResolution),
          false
        ),
      ])
    );
  });

  return (
    <>
      <Polygon
        positions={hexagons}
        pathOptions={{
          color: "white",
          fillColor: "white",
          fillOpacity: 0.2,
          opacity: 0.4,
        }}
      />
      <Polygon
        positions={chosenHexagons}
        pathOptions={{
          color: "red",
          fillColor: "red",
          fillOpacity: 0.2,
          opacity: 0.4,
        }}
      />
    </>
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
        {/* Render the Hexagon Layer */}
        <LayersControl.Overlay checked name="Hexagon Grid">
          <HexagonLayer />
        </LayersControl.Overlay>

        {/* Render the PredictionPolygon if hullPoints are available */}
        {hullPoints && (
          <LayersControl.Overlay checked name="Prediction Polygon">
            <PredictionPolygon hullPoints={hullPoints} />
          </LayersControl.Overlay>
        )}
      </LayersControl>
    </MapContainer>
  );
};

export default Map;
