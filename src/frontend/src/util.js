import { generatePrediction, saveAnnotation, loadAnnotation } from "./api";

export function parseTaxaID(taxaString) {
  const split = taxaString.split("(")[1];
  return split ? split.slice(0, split.length - 1) : null;
}

export async function handleGeneratePrediction(data, handler) {
  const response = await generatePrediction(data);

  if (response.prediction_hexagon_ids) {
    handler.setPredictionHexagonIDs(response.prediction_hexagon_ids);
  }
  if (response.annotation_hexagon_ids) {
    handler.setAnnotationHexagonIDs(response.annotation_hexagon_ids);
  }
}

export async function handleSaveAnnotation(data, handler) {
  const response = await saveAnnotation(data);
}

export async function handleClearAnnotation(data, handler) {
  handler.setAnnotationHexagonIDs({ presence: [], absence: [] });
}

export async function handleLoadAnnotation(data, handler) {
  const response = await loadAnnotation(data);

  if (response.annotation_hexagon_ids) {
    handler.setAnnotationHexagonIDs(data.annotation_hexagon_ids);
  }
}

export function handleAddAnnotationHexagonIDs(hexagonID, handler, switchData) {
  handler.setAnnotationHexagonIDs((prevAnnotationHexagonIDs) => {
    const newAnnotationHexagonIDs = {
      presence: new Set(prevAnnotationHexagonIDs.presence),
      absence: new Set(prevAnnotationHexagonIDs.absence),
    };

    for (const [type, hexIDs] of Object.entries(newAnnotationHexagonIDs)) {
      const isRemoved = hexIDs.delete(hexagonID);
      if (type === (switchData ? "absence" : "presence") && !isRemoved) {
        hexIDs.add(hexagonID);
      }
    }
    return {
      presence: Array.from(newAnnotationHexagonIDs.presence),
      absence: Array.from(newAnnotationHexagonIDs.absence),
    };
  });
}

export function handleAddAnnotationMultiSelect(
  hexagonIDs,
  isAddAnnotationMultiSelect,
  handler,
  switchData
) {
  handler.setAnnotationHexagonIDs((prevAnnotationHexagonIDs) => {
    const newAnnotationHexagonIDs = {
      presence: new Set(prevAnnotationHexagonIDs.presence),
      absence: new Set(prevAnnotationHexagonIDs.absence),
    };

    // Update hexagon sets based on the decided action
    for (const [type, hexIDs] of Object.entries(newAnnotationHexagonIDs)) {
      if (isAddAnnotationMultiSelect) {
        // If adding hexagons, remove them from the other layer and add to the current layer
        hexagonIDs.forEach((hexID) => hexIDs.delete(hexID));
        if (type === (switchData ? "absence" : "presence")) {
          hexagonIDs.forEach((hexID) => hexIDs.add(hexID));
        }
      } else {
        // If removing hexagons, only remove them from the current layer
        if (type === (switchData ? "absence" : "presence")) {
          hexagonIDs.forEach((hexID) => hexIDs.delete(hexID));
        }
      }
    }

    // Return the updated annotation hexagon IDs
    return {
      presence: Array.from(newAnnotationHexagonIDs.presence),
      absence: Array.from(newAnnotationHexagonIDs.absence),
    };
  });
}
