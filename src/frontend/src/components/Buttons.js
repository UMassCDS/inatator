import React, { useState } from "react";

const Buttons = ({
  onGeneratePrediction,
  onSaveAnnotation,
  onClearAnnotation,
  onLoadAnnotation,
  isPresence,
  setIsPresence
}) => {

  const handleToggle = () => {
    setIsPresence(!isPresence);
  };

  return (
    <div className="buttons">

      <div className="toggle-container">
        <span className={`toggle-label ${isPresence ? "presence" : " absence"}`}>
          {isPresence ? "presence" : "absence"}
        </span>
        <label className="switch">
          <input type="checkbox" checked={isPresence} onChange={handleToggle} />
          <span className="slider round"></span>
        </label>
      </div>

      <button id="generate_prediction" onClick={onGeneratePrediction}>
        Generate Prediction
      </button>
      <button id="save_annotation" onClick={onSaveAnnotation}>
        Save Annotation
      </button>
      <button id="load_annotation" onClick={onLoadAnnotation}>
        Load Annotation
      </button>
      <button id="clear_annotation" onClick={onClearAnnotation}>
        Start Over
      </button>
    </div>
  );
};

export default Buttons;
