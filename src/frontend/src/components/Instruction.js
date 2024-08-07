import React, { useState } from 'react';

const Instruction = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleInstructions = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="instruction-container">
      <button onClick={toggleInstructions}>
        {isOpen ? 'Collapse Instructions' : 'Expand Instructions'}
      </button>
      {isOpen && (
        <div className="instructions">
          <h3>Instructions</h3>
            <p>1. To start the annotation, please select a <b>Taxa Name</b> in the left menu. </p>
            <p>2. You can enter <b>Taxa Name</b> or its <b>ID</b> from the <a target="_blank" href='https://www.inaturalist.org/observations?place_id=any&view=species'>iNaturalist’s</a> website.</p>
            <p>3. After selecting the <b>Taxa Name</b>, use one of the <b>buttons</b> to manage the annotation.</p>
          
          <h4>Buttons Function:</h4>
          <ol>
            <li>
              <strong className="generate-prediction">Generate Prediction</strong>: Clicking this button sends
              a request to the model, which returns predictions.
              <p> These predictions can be viewed in several formats
                (selected in the upper right corner of the map):</p>
              <ul>
                <li><strong>Prediction Polygon</strong>: Predictions in the form of polygons outlining the boundaries. <b>Not editable</b>.</li>
                <li><strong>Prediction Hexagons</strong>: Predictions in the form of hexagons (<b style={{ color: '#4eaee4' }}>blue</b> color). <b>Not editable</b>.</li>
                <li><strong>Current Annotation</strong>: Displays loaded predictions in <b style={{ color: '#00b175' }}>green</b>. <b>This is the <u>starting</u> point for annotation, available for editing.</b></li>
              </ul>
              An additional layer, <strong>Hexagon Grid</strong>, helps to see the grid of hexagons for more convenient marking of the annotation.
            </li>
            <br />
            <li>
              <strong className="save-annotation">Save Annotation</strong>: Clicking this button saves the
              current annotation layer to the database (displaying it in <b style={{ color: '#00b175' }}>green</b>).
              <p>Before clicking this button, make sure that the annotation looks
              correct for the selected Taxa.</p>
            </li>
            <br />
            <li>
              <strong className="load-annotation">Load Annotation</strong>: Clicking this button loads
              the last saved annotation for the currently selected Taxa from
              the database. <p>After loading, you can edit it and save it again. A
              new save will <b>overwrite</b> the previous one.</p>
            </li>
            <br />
            <li>
              <strong className="clear-annotation">Clear Annotation</strong>: Clicking this button clears the
              current annotation from the screen, allowing you to start annotating from scratch. 
              <p>Once you complete your annotation, be sure to <b>save</b> it using the <b>Save Annotation</b> button.</p>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default Instruction;
