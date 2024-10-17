/* eslint-disable no-unused-vars */
import {
  generatePrediction,
  saveAnnotation,
  loadAnnotation,
  sampleAnnotation,
} from "./api"; // import necessary functions from api

// parses taxa id from given string if it exists,
export function parseTaxaID(taxaString) {
  const split = taxaString.split("(")[1];
  return split ? split.slice(0, split.length - 1) : null;
}

/**
 * Sorts the boundary points in a clockwise order
 *
 * @param {Array<Array<number>>} boundary - List of [latitude, longitude] coordinates representing the polygon's boundary
 * @returns {Array<Array<number>>} - List of sorted [latitude, longitude] coordinates
 */
export function sortBoundaryClockwise(boundary) {
  // sorts points in a coordinate system clockwise, so that it doesn't 'collapse'
  let points = boundary.map((p) => ({ x: p[0], y: p[1] })); // maps boundary to an object

  // find center point of x and y
  points.sort((a, b) => a.y - b.y);
  const cy = (points[0].y + points[points.length - 1].y) / 2;

  points.sort((a, b) => b.x - a.x);
  const cx = (points[0].x + points[points.length - 1].x) / 2;

  const center = { x: cx, y: cy };

  var startAng;
  // for each point find the angle from the center, add it to point's object
  points.forEach((point) => {
    var ang = Math.atan2(point.y - center.y, point.x - center.x);
    if (!startAng) {
      startAng = ang;
    } else {
      if (ang < startAng) {
        ang += Math.PI * 2;
      }
    }
    point.angle = ang;
  });

  // sort points using angle
  points.sort((a, b) => a.angle - b.angle);

  // remap objects to list
  return points.map((p) => [p.x, p.y]);
}

/**
 * Finds the intersection points of the boundary polygon that crosses the dateline, lng=+-180
 *
 * @param {Array<Array<number>>} boundary - List of [latitude, longitude] coordinates
 * @returns {Array<Object>} - Array of intersection objects containing the original point, point index, and intersection coordinates
 */
export function findDateLineIntersectionsOnBoundary(boundary) {
  // finds intersection points of a line that crosses the dateline
  const intersections = [];

  for (let i = 0; i < boundary.length; i++) {
    const p1 = boundary[i];
    const p2 = boundary[(i + 1) % boundary.length];

    // check if the two points are on opposite sides
    if (Math.abs(p1[1] - p2[1]) > 180) {
      // finds short distance (over the dateline) of two points
      const lngDist = p1[1] > p2[1] ? p2[1] + 360 - p1[1] : p1[1] + 360 - p2[1];
      // interpolation factor, y=180, point lies between p1 and p2 lng
      const t = (180 - Math.abs(p1[1])) / lngDist;

      // calculates latitude using linear interpolation, x = interLat point we interpolate to
      const interLat = p1[0] + t * (p2[0] - p1[0]);
      // refer to linear interpolation formula for a better understanding

      // push two points, one for west, one for east hemisphere
      intersections.push({
        p: p1,
        pIdx: i,
        lat: interLat,
        lng: 180 * Math.sign(p1[1]),
      });

      intersections.push({
        p: p2,
        pIdx: (i + 1) % boundary.length,
        lat: interLat,
        lng: 180 * Math.sign(p2[1]),
      });
    }
  }

  return intersections;
}

/**
 * Checks if a boundary crosses the dateline, lng=+-180
 *
 * @param {Array<Array<number>>} boundary - List of [latitude, longitude] coordinates
 * @returns {boolean} - Returns true if the boundary crosses the dateline, false otherwise
 */
export function crossesDateLine(boundary) {
  // checks if a polygon
  let crossesDateline = false;
  for (let i = 0; i < boundary.length; i++) {
    const p1 = boundary[i];
    const p2 = boundary[(i + 1) % boundary.length];

    // if longer distance is greater than 180, the shortest path crosses dateline
    if (Math.abs(p1[1] - p2[1]) > 180) {
      crossesDateline = true;
      break;
    }
  }
  return crossesDateline; // boolean
}

/**
 * Checks if a boundary crosses the Date Line and splits the polygon into two parts if it does
 *
 * @param {Array<Array<number>>} boundary - List of [latitude, longitude] coordinates
 * @returns {Array<Array<Array<number>>>} - Array of two polygons or a single polygon, based on if it crosses dateline
 */
export function checkAndSplitBoundary(boundary) {
  // checks if hexagon crosses dateline, if so splits to render it properly

  // must sort boundary to apply check and split operations
  const sortedBoundary = sortBoundaryClockwise(boundary);
  // will not split boundary if it does not cross dateline
  if (!crossesDateLine(sortedBoundary)) {
    return [sortedBoundary];
  }

  const intersections = findDateLineIntersectionsOnBoundary(sortedBoundary);
  const leftPoly = [];
  const rightPoly = [];

  for (let i = 0; i < sortedBoundary.length; i++) {
    const p = sortedBoundary[i];

    // depending on point's lng, push it to left or right
    // also push the intersection point related to the point
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

  // sort polygons again to avoid polygon collapse
  const sortedLeft = sortBoundaryClockwise(leftPoly);
  const sortedRight = sortBoundaryClockwise(rightPoly);

  // list gets extended by the caller
  return [sortedLeft, sortedRight];
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

/**
 * Handles download annotation button click. Data is hexagons on screen and species metadata, handler is an object of functions to control UI and state changes.
 * @param {JSON} data
 * @param {JSON} handler
 */
export async function handleSampleAnnotation(data, handler) {
  try {
    handler.loadingHandlers.open();
    const blob = await sampleAnnotation(data);
    // Downloading from UI has a strange workaround that creates a link for the file and must click to download
    // It won't render the link in UI, download is automatic
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    const file_name = `${data.taxa_name}_${new Date().toString()}.csv`;
    link.setAttribute("download", file_name);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (error) {
    console.log("Error downloading CSV:", error);
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
      presence: Array.from(newAnnotationHexagonIDs.presence),
      absence: Array.from(newAnnotationHexagonIDs.absence),
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
      presence: Array.from(newAnnotationHexagonIDs.presence),
      absence: Array.from(newAnnotationHexagonIDs.absence),
    };
  });
}
