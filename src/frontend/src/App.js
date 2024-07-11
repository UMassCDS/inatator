import React, { useRef, useState, useEffect } from "react";
import Map from "./components/Map";
import Sidebar from "./components/Sidebar";
import Buttons from "./components/Buttons";
import * as h3 from "h3-js/legacy";
import "./App.css";

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
  const [annotationHexagonIDs, setAnnotationHexagonIDs] = useState([]);
  const [hexResolution, setHexResolution] = useState(4);

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

    fetch("http://localhost:8000/generate_prediction/", {
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

  const handlSaveAnnotation = () => {
    const body = {
      taxa_name: formRefs.taxaName.current.value,
      hex_resolution: Number(formRefs.hexResolution.current.value),
      threshold: Number(formRefs.threshold.current.value),
      model: formRefs.model.current.value,
      disable_ocean_mask: formRefs.disableOceanMask.current.checked,
      annotation_hexagon_ids: annotationHexagonIDs,
    };

    fetch("http://localhost:8000/save_annotation/", {
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
        console.error("Error generating prediction:", error);
      });
  };

  const handlClearAnnotation = () => {
    const body = {
      taxa_name: formRefs.taxaName.current.value,
      hex_resolution: Number(formRefs.hexResolution.current.value),
      threshold: Number(formRefs.threshold.current.value),
      model: formRefs.model.current.value,
      disable_ocean_mask: formRefs.disableOceanMask.current.checked,
      annotation_hexagon_ids: [],
    };

    fetch("http://localhost:8000/save_annotation/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        setAnnotationHexagonIDs([]);
        alert("Annotation cleared successfully!");
        console.log("Annotation cleared successfully!");
      })
      .catch((error) => {
        console.error("Error generating prediction:", error);
      });
  };

  const handleAddAnnotationHexagonIDs = (latlng) => {
    const hexResolution = Number(formRefs.hexResolution.current.value);
    const hexagonID = h3.geoToH3(latlng.lat, latlng.lng, hexResolution);
    setAnnotationHexagonIDs((prevAnnotationHexagonIDs) => {
      // Create a Set from the previous annotation hexagon IDs
      const annotationHexagonIDsSet = new Set(prevAnnotationHexagonIDs);

      // Check if the new hexagon ID is already in the Set and toggle its presence
      if (annotationHexagonIDsSet.has(hexagonID)) {
        annotationHexagonIDsSet.delete(hexagonID);
      } else {
        annotationHexagonIDsSet.add(hexagonID);
      }

      // Convert the Set back to an array and return it
      return Array.from(annotationHexagonIDsSet);
    });
  };

  return (
    <div className="app-container">
      <Sidebar ref={formRefs} />
      <div className="main-content">
        <Buttons
          onGeneratePrediction={handleGeneratePrediction}
          onSaveAnnotation={handlSaveAnnotation}
          onClearAnnotation={handlClearAnnotation}
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
