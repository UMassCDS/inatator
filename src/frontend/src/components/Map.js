import React, { useEffect } from 'react';
import { MapContainer, TileLayer, LayersControl, Polygon, useMap, useMapEvents } from 'react-leaflet';
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
    hexagons && <Polygon positions={hexagons} pathOptions={{ color: 'blue', fillColor: 'blue' }} />
  );
};

const AnnotationHexagonsLayer = ({ annotationHexagons }) => {
  return (
    annotationHexagons && <Polygon positions={annotationHexagons} pathOptions={{ color: 'green', fillColor: 'green' }} />

  //   customHexagons.map((hexagon, index) => (
  //     <Polygon key={index} positions={hexagon} pathOptions={{ color: 'blue', fillColor: 'blue' }} />
  //   ))
  );
};

const ClickHandler = ({ onAddAnnotationHexagons }) => {
  useMapEvents({
    click: (e) => {
      onAddAnnotationHexagons(e.latlng);
    }
  });
  return null;
};

const Map = ({ hullPoints, hexagons, annotationHexagons, onAddAnnotationHexagons }) => {


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
