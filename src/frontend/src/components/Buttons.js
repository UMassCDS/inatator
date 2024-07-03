import React from 'react';

const Buttons = ({ onGeneratePrediction, onShowGrid }) => {
  return (
    <div className="buttons">
      <button id="generate_prediction" onClick={onGeneratePrediction}>Generate Prediction</button>
      <button id="save_annotation">Save Annotation</button>
      <button id="load_annotation">Load Annotation</button>
      <button id="clear_annotation">Clear Annotation</button>
      <button id="show_grid" onClick={onShowGrid}>Show Grid</button>
    </div>
  );
};

export default Buttons;
