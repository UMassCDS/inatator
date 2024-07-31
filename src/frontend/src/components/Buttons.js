import React from "react";

const Buttons = ({
  onGeneratePrediction,
  onSaveAnnotation,
  onClearAnnotation,
  onLoadAnnotation,
}) => {
  const buttons = [
    { id: 'generate_prediction', text: 'Generate Prediction', onClick: onGeneratePrediction },
    { id: 'save_annotation', text: 'Save Annotation', onClick: onSaveAnnotation },
    { id: 'load_annotation', text: 'Load Annotation', onClick: () => console.log('Load annotation clicked') },
    { id: 'clear_annotation', text: 'Clear Annotation', onClick: onClearAnnotation },
  ];

  return (
    <div className="buttons">
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