import React, { useRef, useState, useEffect } from "react";
import Map from "./components/Map";
import Sidebar from "./components/Sidebar";
import Buttons from "./components/Buttons";
import Instruction from "./components/Instruction";
import * as h3 from "h3-js/legacy";
import "./App.css";

const API_URL = "http://localhost:8000";

const DEFAULT_ANNOTATION_HEXAGON_IDS = {"presence": [], "absence": []}

function App() {
  const formRefs = {
    taxaName: useRef(null),
    threshold: useRef(null),
    model: useRef(null),
    hexResolution: useRef(null),
    disableOceanMask: useRef(null),
  };

  const [hullPoints, setHullPoints] = useState(null);
  const [predictionHexagonIDs, setPredictionHexagonIDs] = useState(null);
  const [annotationHexagonIDs, setAnnotationHexagonIDs] = useState(DEFAULT_ANNOTATION_HEXAGON_IDS);
  const [hexResolution, setHexResolution] = useState(4);
  const [isPresence, setIsPresence] = useState(true);

  const annotationType = isPresence ? "presence" : "absence"

  useEffect(() => {
    // Update the hexResolution state when the input value changes
    const updateHexResolution = () => {
      const newResolution = formRefs.hexResolution.current
        ? Number(formRefs.hexResolution.current.value)
        : 4;
      setHexResolution(newResolution);
    };

    const hexResolutionInput = formRefs.hexResolution.current;
    hexResolutionInput?.addEventListener("change", updateHexResolution);

    return () => {
      hexResolutionInput?.removeEventListener("change", updateHexResolution);
    };
  }, [formRefs.hexResolution]);

  const handleGeneratePrediction = () => {
    const formData = {
      taxa_name: formRefs.taxaName.current.value,
      hex_resolution: Number(formRefs.hexResolution.current.value),
      threshold: Number(formRefs.threshold.current.value),
      model: formRefs.model.current.value,
      disable_ocean_mask: formRefs.disableOceanMask.current.checked,
    };

    fetch(`${API_URL}/generate_prediction/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.hull_points) {
          setHullPoints(data.hull_points);
        }
        if (data.prediction_hexagon_ids) {
          setPredictionHexagonIDs(data.prediction_hexagon_ids);
        }
        if (data.annotation_hexagon_ids) {
          setAnnotationHexagonIDs(data.annotation_hexagon_ids);
        }
      })
      .catch((error) => {
        console.error("Error generating prediction:", error);
      });
  };

  const handleSaveAnnotation = () => {
    const body = {
      taxa_name: formRefs.taxaName.current.value,
      hex_resolution: Number(formRefs.hexResolution.current.value),
      threshold: Number(formRefs.threshold.current.value),
      model: formRefs.model.current.value,
      disable_ocean_mask: formRefs.disableOceanMask.current.checked,
      annotation_hexagon_ids: annotationHexagonIDs,
    };

    fetch(`${API_URL}/save_annotation/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Annotation saved successfully!");
        console.log("Annotation saved successfully!");
      })
      .catch((error) => {
        console.error("Error saving annotation:", error);
      });
  };

  const handleClearAnnotation = () => {
    setAnnotationHexagonIDs(DEFAULT_ANNOTATION_HEXAGON_IDS);
  };

  const handleLoadAnnotation = () => {
    const formData = {
      taxa_name: formRefs.taxaName.current.value,
      hex_resolution: Number(formRefs.hexResolution.current.value),
      threshold: Number(formRefs.threshold.current.value),
      model: formRefs.model.current.value,
      disable_ocean_mask: formRefs.disableOceanMask.current.checked,
    };

    fetch(`${API_URL}/load_annotation/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.annotation_hexagon_ids) {
          setAnnotationHexagonIDs(data.annotation_hexagon_ids);
        }
      })
      .catch((error) => {
        console.error("Error loading annotation:", error);
      });
  };

  const handleAddAnnotationHexagonIDs = (latlng) => {
    const hexResolution = Number(formRefs.hexResolution.current.value);
    const hexagonID = h3.geoToH3(latlng.lat, latlng.lng, hexResolution);
    setAnnotationHexagonIDs((prevAnnotationHexagonIDs) => {
      const newAnnotationHexagonIDs = {
        presence: new Set(prevAnnotationHexagonIDs.presence),
        absence: new Set(prevAnnotationHexagonIDs.absence),
      };

      for (const [type, hexIDs] of Object.entries(newAnnotationHexagonIDs)) {
        const isRemoved = hexIDs.delete(hexagonID);
        if (type === annotationType && !isRemoved) {
          hexIDs.add(hexagonID);
        }
      }
      return {
        presence: Array.from(newAnnotationHexagonIDs.presence),
        absence: Array.from(newAnnotationHexagonIDs.absence),
      };
    });
  };

  return (
    <div className="app-container">
      <Sidebar ref={formRefs} />
      <div className="main-content">
        <Instruction />
        <Buttons
          onGeneratePrediction={handleGeneratePrediction}
          onSaveAnnotation={handleSaveAnnotation}
          onClearAnnotation={handleClearAnnotation}
          onLoadAnnotation={handleLoadAnnotation}
          isPresence={isPresence}
          setIsPresence={setIsPresence}
        />
        <Map
          hullPoints={hullPoints}
          predictionHexagonIDs={predictionHexagonIDs}
          annotationHexagonIDs={annotationHexagonIDs}
          onAddAnnotationHexagonIDs={handleAddAnnotationHexagonIDs}
          hexResolution={hexResolution}
        />
      </div>
    </div>
  );
}

export default App;
