import React from "react";

const Buttons = ({
  onGeneratePrediction,
  onSaveAnnotation,
  onClearAnnotation,
  onLoadAnnotation,
}) => {
  return (
    <div className="buttons">
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
