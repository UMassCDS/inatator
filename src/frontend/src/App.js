import React, { useRef, useState, useEffect } from "react";
import Map from "./components/Map";
import Sidebar from "./components/Sidebar";
import Buttons from "./components/Buttons";
import LoadingStatus from "./components/LoadingStatus";
import * as h3 from "h3-js/legacy";
import "./App.css";

const API_URL = "http://localhost:8000";
const PATH_TO_TAXA = '/static/taxa_names.json';
const BAR_STATUS = {
  inactive: {loadingStatus: "", color: "#b5b5b5"},
  generating: {loadingStatus: "Generating... This can take several seconds", color: "#b5b5b5"},
  generatingSuccess: {loadingStatus: "Success", color: "#007bff"},
  saving: {loadingStatus: "Saving", color: "#b5b5b5"},
  savingSuccess: {loadingStatus: "Saved", color: "#28a745"},
  clearing: {loadingStatus: "Clearing", color: "#b5b5b5"},
  clearingSuccess: {loadingStatus: "Cleared", color: "#28a745"},
  invalid: { loadingStatus: "Invalid Taxa Name", color: "#dc3545" },
  error: { loadingStatus: "Error checking taxa name", color: "#dc3545" },
  failure: {loadingStatus: "Failure", color: "#dc3545"},
};
const BAR_TIMEOUT = 2000;

function App() {
  const formRefs = {
    taxaName: useRef(null),
    threshold: useRef(null),
    model: useRef(null),
    hexResolution: useRef(null),
    disableOceanMask: useRef(null),
  };

  const [taxaNames, setTaxaNames] = useState(null);
  const [hullPoints, setHullPoints] = useState(null);
  const [predictionHexagonIDs, setPredictionHexagonIDs] = useState(null);
  const [annotationHexagonIDs, setAnnotationHexagonIDs] = useState([]);
  const [hexResolution, setHexResolution] = useState(4);
  const [barStatus, setBarStatus] = useState(BAR_STATUS.inactive);

  useEffect(() => { // loads taxaNames
    const fetchTaxaNames = async () => {
      try {
        const response = await fetch(PATH_TO_TAXA);
        const data = await response.json();
        setTaxaNames(data);
      } catch (e) {
        console.log(`Taxa names loading error: ${e}`);
        setBarStatus(BAR_STATUS.error);
      }
    };

    fetchTaxaNames();
  }, []);

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

  const checkTaxaValid = (taxa) => {
    try {
    if (!taxaNames.includes(taxa)) {
      setBarStatus(BAR_STATUS.invalid);
      return false;
    } else {
      return true;
    }} catch (error) {
      console.log(`Error: ${error}`);
      setBarStatus(BAR_STATUS.error);
      return false;
    }
  };

  const handleGeneratePrediction = async () => {
    const formData = {
      taxa_name: formRefs.taxaName.current.value,
      hex_resolution: Number(formRefs.hexResolution.current.value),
      threshold: Number(formRefs.threshold.current.value),
      model: formRefs.model.current.value,
      disable_ocean_mask: formRefs.disableOceanMask.current.checked,
    };

    if (!checkTaxaValid(formData.taxa_name)) {
      return;
    }

    setBarStatus(BAR_STATUS.generating);

    if (!checkTaxaValid(formData.taxa_name)) {
      return;
    }

    setBarStatus(BAR_STATUS.generating);

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
        setBarStatus(BAR_STATUS.generatingSuccess);
        setTimeout(() => {
          setBarStatus(BAR_STATUS.inactive);
        }, BAR_TIMEOUT);
      })
      .catch((error) => {
        setBarStatus(BAR_STATUS.failure);
        console.error("Error generating prediction:", error);
      });
  };

  const handlSaveAnnotation = async () => {
    const body = {
      taxa_name: formRefs.taxaName.current.value,
      hex_resolution: Number(formRefs.hexResolution.current.value),
      threshold: Number(formRefs.threshold.current.value),
      model: formRefs.model.current.value,
      disable_ocean_mask: formRefs.disableOceanMask.current.checked,
      annotation_hexagon_ids: annotationHexagonIDs,
    };

    if (!checkTaxaValid(body.taxa_name)) {
      return;
    }

    setBarStatus(BAR_STATUS.saving);

    fetch(`${API_URL}/save_annotation/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        setBarStatus(BAR_STATUS.savingSuccess);
        setTimeout(() => {
          setBarStatus(BAR_STATUS.inactive);
        }, BAR_TIMEOUT);
        // alert("Annotation saved successfully!");
        console.log("Annotation saved successfully!");
      })
      .catch((error) => {
        setBarStatus(BAR_STATUS.failure);
        console.error("Error generating prediction:", error);
      });
  };

  const handlClearAnnotation = async () => {
    const body = {
      taxa_name: formRefs.taxaName.current.value,
      hex_resolution: Number(formRefs.hexResolution.current.value),
      threshold: Number(formRefs.threshold.current.value),
      model: formRefs.model.current.value,
      disable_ocean_mask: formRefs.disableOceanMask.current.checked,
      annotation_hexagon_ids: [],
    };

    if (!checkTaxaValid(body.taxa_name)) {
      return;
    }
    
    setBarStatus(BAR_STATUS.clearing);

    fetch(`${API_URL}/save_annotation/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        setAnnotationHexagonIDs([]);
        // alert("Annotation cleared successfully!");
        setBarStatus(BAR_STATUS.clearingSuccess);
        setTimeout(() => {
          setBarStatus(BAR_STATUS.inactive);
        }, BAR_TIMEOUT);
        console.log("Annotation cleared successfully!");
      })
      .catch((error) => {
        setBarStatus(BAR_STATUS.failure);
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
        <LoadingStatus barStatus={barStatus}/>
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
