import React from 'react';

const Buttons = ({ onGeneratePrediction, onSaveAnnotation}) => {
  return (
    <div className="buttons">
      <button id="generate_prediction" onClick={onGeneratePrediction}>Generate Prediction</button>
      <button id="save_annotation" onClick={onSaveAnnotation}>Save Annotation</button>
      <button id="load_annotation">Load Annotation</button>
      <button id="clear_annotation">Clear Annotation</button>
    </div>
  );
};

export default Buttons;
