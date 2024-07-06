import React, { useEffect } from 'react';
import { MapContainer, TileLayer, LayersControl, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const PredictionPolygon = ({ hullPoints }) => {
  const map = useMap();

  useEffect(() => {
    if (hullPoints) {
      map.flyToBounds(hullPoints, { 'maxZoom': 5 });
    }
  }, [hullPoints, map]);

  return (
    hullPoints && <Polygon positions={hullPoints} pathOptions={{ color: 'red', fillColor: 'yellow' }} />
  );
};

const PredictionHexagons = ({ hexagons }) => {
  const map = useMap();

  useEffect(() => {
    if (hexagons) {
      map.flyToBounds(hexagons, { 'maxZoom': 5 });
    }
  }, [hexagons, map]);

  return (
    hexagons && <Polygon positions={hexagons} pathOptions={{ color: 'green', fillColor: 'green' }} />
  );
};

const Map = ({ hullPoints, hexagons }) => {
  return (
    <MapContainer center={[39, 34]} zoom={3} style={{ height: "100vh", width: "100%" }}>
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
          <LayersControl.Overlay name="Prediction Polygon">
            <PredictionPolygon hullPoints={hullPoints} />
          </LayersControl.Overlay>
        )}

        {/* Render the PredictionHexagons if hexagons are available */}
        {hexagons && (
          <LayersControl.Overlay checked name="Prediction Hexagons">
            <PredictionHexagons hexagons={hexagons} />
          </LayersControl.Overlay>
        )}

      </LayersControl>
    </MapContainer>
  );
};

export default Map;
