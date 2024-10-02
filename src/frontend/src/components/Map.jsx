/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
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
import * as h3 from "h3-js";
import L from "leaflet";
import "../styles/Map.css";
import { crossesDateLine } from "../util";

window.type = true; // sets global type variable, used by leaflet-draw, without it the rectangle select fails
// An ongoing issue: https://github.com/Leaflet/Leaflet.draw/issues/1026
// Might need to switch map libraries because of it

// Customizing the tooltip messages
L.drawLocal.draw.toolbar.buttons.rectangle = "REMOVE annotation hexagons";
L.drawLocal.draw.handlers.rectangle.tooltip.start =
  "Click and drag to select an area for REMOVING annotation hexagons";
L.drawLocal.draw.toolbar.buttons.polygon = "ADD annotation hexagons";
L.drawLocal.draw.handlers.polygon.tooltip.start =
  "Click to start drawing a shape for ADDING annotation hexagons";
L.drawLocal.draw.handlers.polygon.tooltip.cont =
  "Continue drawing the shape for ADDING annotation hexagons";
L.drawLocal.draw.handlers.polygon.tooltip.end =
  "Click the first point to finish drawing and fill the shape with hexagons";

// Helper function
const h3IDsToGeoBoundary = ({ hexagonIDs }) => {
  if (!hexagonIDs) {
    return null;
  }

  return Array.from(hexagonIDs)
    .map((hexID) =>
      h3.cellToBoundary(hexID, false).map(([lat, lng]) => [lat, lng])
    )
    .filter((boundary) => !crossesDateLine(boundary));
};

// Hexagon render layer, after certain zoom it will display gray hexagons on screen
function HexagonLayer({ hexResolution }) {
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

    const hexIdxs = h3.polygonToCells(screenBounds, hexResolution); // fills onscreen rectangle with h3

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
}

// Layer for prediction hexagons, uses handler functions to manage state
function PredictionHexagons({ predictionHexagonIDs }) {
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
        pathOptions={{ color: "#4eaee4", fillColor: "#4eaee4" }} // blue
      />
    )
  );
}

// Annotation hexagon layer, uses handlers to manage state
function AnnotationHexagonsLayer({ annotationHexagonIDs, color }) {
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
}

// Creates a listener on map
const ClickHandler = ({ onAddAnnotationHexagonIDs, hexResolution }) => {
  useMapEvents({
    click: (e) => {
      const hexagonID = h3.latLngToCell(
        e.latlng.lat,
        e.latlng.lng,
        hexResolution
      );
      onAddAnnotationHexagonIDs(hexagonID);
    },
  });
  return null;
};

function Map({
  hullPoints,
  predictionHexagonIDs,
  annotationHexagonIDs,
  hexResolution,
  taxonId,
  onAddAnnotationHexagonIDs,
  onAddAnnotationMultiSelect,
}) {
  const [multipleAnnotationHexagonIDs, setMultipleAnnotationHexagonIDs] =
    useState(null);
  const [isAddAnnotationMultiSelect, setIsAddAnnotationMultiSelect] =
    useState(true);

  // Function to register created polygons on the map
  const handleCreated = (e) => {
    console.log(e);
    var hexagonIds = null;
    try {
      const layer = e.layer;
      const polygonCoords = layer
        .getLatLngs()[0]
        .map((latlng) => [latlng.lat, latlng.lng]);
      console.log(polygonCoords);
      hexagonIds = h3.polygonToCells(polygonCoords, hexResolution);
      // Add hexagons for each vertex of the polygon
      polygonCoords.map((latlng) =>
        hexagonIds.push(h3.latLngToCell(latlng[0], latlng[1], hexResolution))
      );
      // catch an error if the figure is not fully drawn
    } catch (error) {
      console.error("Error ocurred in map:", error);
      hexagonIds = null;
    }
    // Clean blue select layer
    e.layer.remove();
    setMultipleAnnotationHexagonIDs(hexagonIds);
    // Set to true to add hexagons if the user draws a polygon;
    // set to false to remove hexagons if the user draws a rectangle.
    setIsAddAnnotationMultiSelect(e.layerType === "polygon");
  };

  useEffect(() => {
    multipleAnnotationHexagonIDs &&
      onAddAnnotationMultiSelect(
        multipleAnnotationHexagonIDs,
        isAddAnnotationMultiSelect
      );
  }, [multipleAnnotationHexagonIDs, isAddAnnotationMultiSelect]);

  return (
    <div className="map-container">
      <MapContainer
        center={[39, 34]}
        zoom={3}
        style={{ height: "100%", width: "100%" }}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        worldCopyJump:false
        maxBoundsViscosity={0.8}
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
          <LayersControl.Overlay name="Hexagon Grid">
            <HexagonLayer hexResolution={hexResolution} />
          </LayersControl.Overlay>

          {/* Add the iNaturalist Observations Layer */}
          <LayersControl.Overlay checked name="iNaturalist Observations">
            <TileLayer
              url={`https://tiles.inaturalist.org/v1/grid/{z}/{x}/{y}.png?taxon_id=${taxonId}`}
              noWrap:true
            />
          </LayersControl.Overlay>

          {/* Custom Hexagons Layer */}
          <LayersControl.Overlay checked name="Annotation (Presence)">
            <AnnotationHexagonsLayer
              annotationHexagonIDs={annotationHexagonIDs.presence}
              color={"#00b175"}
            />
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Annotation (Absence)">
            <AnnotationHexagonsLayer
              annotationHexagonIDs={annotationHexagonIDs.absence}
              color={"#e14b23"}
            />
          </LayersControl.Overlay>

          {/* Render the PredictionHexagons if hexagons are available */}
          {predictionHexagonIDs && (
            <LayersControl.Overlay name="Prediction Hexagons">
              <PredictionHexagons predictionHexagonIDs={predictionHexagonIDs} />
            </LayersControl.Overlay>
          )}
        </LayersControl>
        <FeatureGroup>
          <EditControl
            position="topleft"
            onCreated={handleCreated}
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
          hexResolution={hexResolution}
        />
      </MapContainer>
    </div>
  );
}

export default Map;
