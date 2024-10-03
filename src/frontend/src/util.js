/* eslint-disable no-unused-vars */
import { generatePrediction, saveAnnotation, loadAnnotation } from "./api"; // import necessary functions from api
import * as h3 from "h3-js";

// parses taxa id from given string if it exists,
export function parseTaxaID(taxaString) {
  const split = taxaString.split("(")[1];
  return split ? split.slice(0, split.length - 1) : null;
}

export function findDateLineIntersections(boundary) {
  const intersections = [];

  // Making assumption that the h3 boundary has some order, not random
  for (let i = 0; i < boundary.length; i++) {
    const p1 = boundary[i];
    const p2 = boundary[(i + 1) % boundary.length];

    if (Math.abs(p1[1] - p2[1]) > 180) {
      let [x1, y1, z1] = [
        Math.cos(p1[1]) * Math.sin(p1[0]),
        Math.sin(p1[1]) * Math.sin(p1[0]),
        Math.cos(p1[0]),
      ];

      let [x2, y2, z2] = [
        Math.cos(p2[1]) * Math.sin(p2[0]),
        Math.sin(p2[1]) * Math.sin(p2[0]),
        Math.cos(p2[0]),
      ];

      const t = y2 / (y2 - y1);

      let [x, y, z] = [t * x1 + (1 - t) * x2, 0, t * z1 + (1 - t) * z2];

      const interLat = Math.atan(z / x);

      intersections.push({
        p: p1,
        pIdx: i,
        lat: p1[0],
        // lat: interLat,
        lng: 180 * Math.sign(p1[1]),
      });

      intersections.push({
        p: p2,
        pIdx: (i + 1) % boundary.length,
        lat: p2[0],
        // lat: interLat,
        lng: 180 * Math.sign(p2[1]),
      });
    }
  }

  return intersections;
}

export function crossesDateLine(boundary) {
  let crossesDateline = false;
  for (let i = 0; i < boundary.length; i++) {
    const p1 = boundary[i];
    const p2 = boundary[(i + 1) % boundary.length];
    if (Math.abs(p1[1] - p2[1]) > 180) {
      crossesDateline = true;
      break;
    }
  }
  return crossesDateline;
}

export function processHexagon(boundary) {
  if (!crossesDateLine(boundary)) {
    return [boundary];
  }

  const intersections = findDateLineIntersections(boundary);
  console.log(intersections);
  const leftPoly = [];
  const rightPoly = [];

  let currentPoly = leftPoly;
  // let i = 0;
  for (let i = 0; i < boundary.length; i++) {
    const p = boundary[i];
    if (p[1] < 0) {
      leftPoly.push(p);
      const inter = intersections.find((int) => int.pIdx === i);
      if (inter) {
        leftPoly.push([inter.lat, inter.lng]);
      }
    } else {
      rightPoly.push(p);
      const inter = intersections.find((int) => int.pIdx === i);
      if (inter) {
        rightPoly.push([inter.lat, inter.lng]);
      }
    }
  }

  return [leftPoly, rightPoly];
}

export async function handleGeneratePrediction(data, handler) {
  // function with error handling, sets state for predictions hexagons
  try {
    handler.loadingHandlers.open();
    const response = await generatePrediction(data);

    if (response.prediction_hexagon_ids) {
      handler.setPredictionHexagonIDs(response.prediction_hexagon_ids);
    }
    if (response.annotation_hexagon_ids) {
      handler.setAnnotationHexagonIDs(response.annotation_hexagon_ids);
    }
    handler.loadingHandlers.close();
  } catch (error) {
    console.error("Error generating prediction:", error);
    alert("An unexpected error occurred.");
  } finally {
    handler.loadingHandlers.close();
  }
}

export async function handleSaveAnnotation(data, handler) {
  // function with error handling, saves on screen annotations
  try {
    handler.loadingHandlers.open();
    // clean annotation data to exclude dateline points
    // const crossesDlById = (id) =>
    //   crossesDateLine(
    //     h3.cellToBoundary(id, false).map(([lat, lng]) => [lat, lng])
    //   );
    // data.annotation_hexagon_ids.absence = Array.from(
    //   data.annotation_hexagon_ids.absence
    // ).filter((id) => !crossesDlById(id));
    // data.annotation_hexagon_ids.presence = Array.from(
    //   data.annotation_hexagon_ids.presence
    // ).filter((id) => !crossesDlById(id));

    const response = await saveAnnotation(data);
    if (response instanceof Error) {
      console.error("Error save annotation:", response.message);
      alert("Operation failed. Please try again later.");
    }

    handler.loadingHandlers.close();
  } catch (error) {
    console.error("Error save annotation:", error);
    alert("An unexpected error occurred.");
  } finally {
    handler.loadingHandlers.close();
  }
}

export async function handleClearAnnotation(data, handler) {
  // function with error handling, clears annotation on screen
  try {
    handler.loadingHandlers.open();
    handler.setAnnotationHexagonIDs({ presence: [], absence: [] });
    handler.loadingHandlers.close();
  } catch (error) {
    console.error("Error clear annotation:", error);
    alert("An unexpected error occurred.");
  } finally {
    handler.loadingHandlers.close();
  }
}

export async function handleLoadAnnotation(data, handler) {
  // function with error handling, sets annotation hexagons with the most recent annotation to that species
  try {
    handler.loadingHandlers.open();
    const response = await loadAnnotation(data);

    if (response.annotation_hexagon_ids) {
      handler.setAnnotationHexagonIDs(response.annotation_hexagon_ids);
    }
    handler.loadingHandlers.close();
  } catch (error) {
    console.error("Error load annotation:", error);
    alert("An unexpected error occurred.");
  } finally {
    handler.loadingHandlers.close();
  }
}

export function handleAddAnnotationHexagonIDs(hexagonID, handler, switchData) {
  // function to handle added hexagon ids
  handler.setAnnotationHexagonIDs((prevAnnotationHexagonIDs) => {
    const newAnnotationHexagonIDs = {
      presence: new Set(prevAnnotationHexagonIDs.presence),
      absence: new Set(prevAnnotationHexagonIDs.absence),
    };

    for (const [type, hexIDs] of Object.entries(newAnnotationHexagonIDs)) {
      const isRemoved = hexIDs.delete(hexagonID);
      if (type === (switchData ? "presence" : "absence") && !isRemoved) {
        hexIDs.add(hexagonID);
      }
    }
    return {
      presence: newAnnotationHexagonIDs.presence,
      absence: newAnnotationHexagonIDs.absence,
    };
  });
}

export function handleAddAnnotationMultiSelect(
  hexagonIDs,
  isAddAnnotationMultiSelect,
  handler,
  isPresence
) {
  // function that handles multiselected hexagon ids
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
        if (type === (isPresence ? "presence" : "absence")) {
          hexagonIDs.forEach((hexID) => hexIDs.add(hexID));
        }
      } else {
        console.log("Removing");
        // If removing hexagons, only remove them from the current layer
        if (type === (isPresence ? "presence" : "absence")) {
          hexagonIDs.forEach((hexID) => hexIDs.delete(hexID));
        }
      }
    }

    // Return the updated annotation hexagon IDs
    return {
      presence: newAnnotationHexagonIDs.presence,
      absence: newAnnotationHexagonIDs.absence,
    };
  });
}
