import React, { useRef, useState } from 'react';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import Buttons from './components/Buttons';
import * as h3 from 'h3-js/legacy';
import './App.css';


function App() {
  const formRefs = {
    taxaName: useRef(null),
    hexResolution: useRef(null),
    threshold: useRef(null),
    model: useRef(null),
    disableOceanMask: useRef(null),
  };

  const [hullPoints, setHullPoints] = useState(null);
  const [hexagons, setHexagons] = useState(null);
  const [annotationHexagons, setAnnotationHexagons] = useState([]);

  const handleGeneratePrediction = () => {
    const formData = {
      taxa_name: formRefs.taxaName.current.value,
      hex_resolution: Number(formRefs.hexResolution.current.value),
      threshold: Number(formRefs.threshold.current.value),
      model: formRefs.model.current.value,
      disable_ocean_mask: formRefs.disableOceanMask.current.checked,
    };

    fetch('/generate_prediction/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Prediction generated:', data);
      if (data.hull_points) {
        setHullPoints(data.hull_points);
      }
      if (data.hexagons) {
        setHexagons(data.hexagons);
      }
    })
    .catch(error => {
      console.error('Error generating prediction:', error);
    });
  };

  const handleAddAnnotationHexagons = (latlng) => {
    const hexResolution = Number(formRefs.hexResolution.current.value)
    const hexagonIndex = h3.geoToH3(latlng.lat, latlng.lng, hexResolution);
    const hexagonVertices = h3.h3ToGeoBoundary(hexagonIndex);
    const newAnnotationHexagon = hexagonVertices.map(vertex => [vertex[0], vertex[1]]);
    setAnnotationHexagons(prevAnnotationHexagons => {
      // Check if the new hexagon is already in the array
      const index = prevAnnotationHexagons.findIndex(hexagon => 
        hexagon.every((point, i) => point[0] === newAnnotationHexagon[i][0] && point[1] === newAnnotationHexagon[i][1])
      );

      if (index !== -1) {
        // If the hexagon is found, remove it
        const updatedAnnotationHexagons = [...prevAnnotationHexagons];
        updatedAnnotationHexagons.splice(index, 1);
        return updatedAnnotationHexagons;

      } else {
        // If the hexagon is not found, add it
        return [...prevAnnotationHexagons, newAnnotationHexagon];
      }
    });
  };

  return (
    <div className="app-container">
      <Sidebar ref={formRefs} />
      <div className="main-content">
        <Buttons onGeneratePrediction={handleGeneratePrediction} />
        <Map
          hullPoints={hullPoints}
          hexagons={hexagons}
          annotationHexagons={annotationHexagons}
          onAddAnnotationHexagons={handleAddAnnotationHexagons}
        />
      </div>
    </div>
  );
}

export default App;
