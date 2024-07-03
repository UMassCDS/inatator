import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, LayersControl, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as h3 from 'h3-js/legacy';

// Component to generate and display hexagons
const HexagonLayer = ({ hexResolution }) => {
  const [hexagons, setHexagons] = useState([]);
  const map = useMap()

  useEffect(() => {
    if (hexResolution) {
      const generateHexagons = () => {

        const bounds = map.getBounds();
        const southWest = bounds.getSouthWest();
        const northEast = bounds.getNorthEast();

        const hexIndexes = h3.polyfill(
          [
            [southWest.lng, southWest.lat],
            [northEast.lng, southWest.lat],
            [northEast.lng, northEast.lat],
            [southWest.lng, northEast.lat],
          ],
          hexResolution
        );

        const hexagonsData = hexIndexes.map((hex) => h3.h3ToGeoBoundary(hex, true).map(([lat, lng]) => [lat, lng]));
        setHexagons(hexagonsData);
      };

      generateHexagons();
    }
  }, [hexResolution]);
  return (
    <Polygon positions={hexagons} pathOptions={{ color: 'green', fillColor: 'blue', fillOpacity: 0.1 }} />
  );
};

// Component for Prediction Polygon
const PredictionPolygon = ({ hullPoints }) => {
  const map = useMap();

  useEffect(() => {
    if (hullPoints) {
      map.flyToBounds(hullPoints, {maxZoom: 5});
    }
  }, [hullPoints, map]);

  return hullPoints ? <Polygon positions={hullPoints} pathOptions={{ color: 'red', fillColor: 'yellow' }} /> : null;
};

// Main Map Component
const Map = ({ hullPoints, hexResolution }) => {
  return (
    <MapContainer center={[39, 34]} zoom={3} style={{ height: '100vh', width: '100%' }}>
      <LayersControl position="topright">

        {/* Base Layers */}
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            minZoom={4}
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
        <LayersControl.Overlay checked name="Hexagon Layer">
          <HexagonLayer hexResolution={hexResolution}/>
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
