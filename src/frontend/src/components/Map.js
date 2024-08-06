import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Polygon,
  FeatureGroup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import * as h3 from "h3-js/legacy";
import L, { featureGroup } from 'leaflet';

// Tools
const h3IDsToGeoBoundary = ({ hexagonIDs }) => {
  if (hexagonIDs) {
    const hexagons = hexagonIDs.map((hexID) =>
      h3.h3ToGeoBoundary(hexID, false).map(([lat, lng]) => [lat, lng])
    );
    return hexagons;
  }
  return null;
};

// Component to generate and display hexagons
const HexagonLayer = ({ hexResolution }) => {
  const [hexagons, setHexagons] = useState([]);
  const map = useMap();

  const generateHexagons = (hexResolution) => {
    if (map.getZoom() <= 7 || hexResolution == null) {
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

    const hexagonsData = h3IDsToGeoBoundary({ hexagonIDs: hexIdxs });
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

const PredictionHexagons = ({ predictionHexagonIDs }) => {
  const map = useMap();

  const [predictionHexagons, setPredictionHexagons] = useState(null);
  useEffect(() => {
    if (predictionHexagonIDs) {
      const hexagons = h3IDsToGeoBoundary({ hexagonIDs: predictionHexagonIDs });
      setPredictionHexagons(hexagons);
    }
  }, [predictionHexagonIDs]);

  useEffect(() => {
    if (predictionHexagons) {
      map.flyToBounds(predictionHexagons, { maxZoom: 5 });
    }
  }, [predictionHexagons, map]);

  return (
    predictionHexagons && (
      <Polygon
        positions={predictionHexagons}
        pathOptions={{ color: "blue", fillColor: "blue" }}
      />
    )
  );
};

const AnnotationHexagonsLayer = ({ annotationHexagonIDs, color }) => {
  const [annotationHexagons, setAnnotationHexagons] = useState([]);

  useEffect(() => {
    if (annotationHexagonIDs) {
      const hexagons = h3IDsToGeoBoundary({ hexagonIDs: annotationHexagonIDs });
      setAnnotationHexagons(hexagons);
    }
  }, [annotationHexagonIDs]);

  return (
    annotationHexagons && (
      <Polygon
        positions={annotationHexagons}
        pathOptions={{ color: color, fillColor: color }}
      />
    )
  );
};

const ClickHandler = ({ onAddAnnotationHexagonIDs, hexResolution }) => {
  useMapEvents({
    click: (e) => {
      const hexagonID = h3.geoToH3(e.latlng.lat, e.latlng.lng, hexResolution);
      onAddAnnotationHexagonIDs(hexagonID);
    },
  });
  return null;
};

const onCreated = ( onAddAnnotationMultiSelect, annotationType, hexResolution ) => (e) => {
  console.log(`Creating annotations with type: ${annotationType}`);
  var polygon_latlngs = e.layer.getLatLngs()[0];
  const polygonCoords = polygon_latlngs.map(latlng => [latlng.lat, latlng.lng]);
  var hexagonIds = h3.polyfill(polygonCoords, hexResolution);
  onAddAnnotationMultiSelect(hexagonIds, annotationType);
  console.log(featureGroup)
  e.target.eachLayer((layer) => {
    if ((layer instanceof L.Rectangle || layer instanceof L.Polygon) && layer.options.clickable === true){
      console.log("about to delete layter")
      e.target.removeLayer(layer);
    }
  })
};

const Map = ({
  hullPoints,
  predictionHexagonIDs,
  annotationHexagonIDs,
  annotationType,
  hexResolution,
  onAddAnnotationHexagonIDs,
  onAddAnnotationMultiSelect,
}) => {
  console.log('Render map');
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

        {/* Render the Hexagon Layer */}
        <LayersControl.Overlay checked name="Hexagon Grid">
          <HexagonLayer hexResolution={hexResolution} />
        </LayersControl.Overlay>

        {/* Custom Hexagons Layer */}
        <LayersControl.Overlay checked name="Annotation (Presence)">
          <AnnotationHexagonsLayer
            annotationHexagonIDs={annotationHexagonIDs.presence}
            color={"green"}
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay checked name="Annotation (Absence)">
          <AnnotationHexagonsLayer
            annotationHexagonIDs={annotationHexagonIDs.absence}
            color={"red"}
          />
        </LayersControl.Overlay>

        {/* Render the PredictionHexagons if hexagons are available */}
        <LayersControl.Overlay name="Prediction Hexagons">
          <PredictionHexagons predictionHexagonIDs={predictionHexagonIDs} />
        </LayersControl.Overlay>

        {/* Render the PredictionPolygon if hullPoints are available */}
        {hullPoints && (
          <LayersControl.Overlay name="Prediction Polygon">
            <PredictionPolygon hullPoints={hullPoints} />
          </LayersControl.Overlay>
        )}

      </LayersControl>
      <FeatureGroup>
        <EditControl
          position="topleft"
          onCreated = {onCreated(onAddAnnotationMultiSelect, annotationType, hexResolution)}
          draw={{
            rectangle: true,
            polygon: true,
            circle: false,
            polyline: false,
            marker: false,
            circlemarker: false,
          }}
          edit={{
            edit: false,
            remove: false,
          }}
        />
      </FeatureGroup>
      <ClickHandler 
      onAddAnnotationHexagonIDs={onAddAnnotationHexagonIDs} 
      hexResolution={hexResolution} />
    </MapContainer>
  );
};

export default Map;
