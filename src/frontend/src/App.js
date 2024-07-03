import React, { useRef, useState } from 'react';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import Buttons from './components/Buttons';
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
  const [hexResolution, setHexResolution] = useState(null);

  const handleGeneratePrediction = () => {
    const formData = {
      taxa_name: formRefs.taxaName.current.value,
      hexResolution: Number(formRefs.hexResolution.current.value),
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
    })
    .catch(error => {
      console.error('Error generating prediction:', error);
    });
  };

  const onShowGrid = () => {
    setHexResolution(Number(formRefs.hexResolution.current.value));
  };

  return (
    <div className="app-container">
      <Sidebar ref={formRefs} />
      <div className="main-content">
        <Buttons onGeneratePrediction={handleGeneratePrediction} onShowGrid={onShowGrid} />
        <Map hullPoints={hullPoints} hexResolution={hexResolution} />
      </div>
    </div>
  );
}

export default App;
