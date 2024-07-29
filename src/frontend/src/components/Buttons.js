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


  const buttons = [
    { id: 'generate_prediction', text: 'Generate Prediction', onClick: onGeneratePrediction },
    { id: 'save_annotation', text: 'Save Annotation', onClick: onSaveAnnotation },
    { id: 'load_annotation', text: 'Load Annotation', onClick: onLoadAnnotation },
    { id: 'clear_annotation', text: 'Clear Annotation', onClick: onClearAnnotation },
  ];

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

      {buttons.map((button) => (
        <button
          key={button.id}
          id={button.id}
          onClick={button.onClick}
        >
          {button.text}
        </button>
      ))}
    </div>
  );
};

export default Buttons;