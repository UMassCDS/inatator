// functions to interact with the backend API
// functions handle errors by printing

const API_URL = "http://localhost:8000";

export async function generatePrediction(data) {
  const response = await fetch(`${API_URL}/generate_prediction/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .catch((error) => console.error("Error generating prediction:", error));
  return response;
}

export async function saveAnnotation(data) {
  const response = await fetch(`${API_URL}/save_annotation/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .catch((error) => console.error("Error saving annotation:", error));

  return response;
}

export async function loadAnnotation(data) {
  const response = await fetch(`${API_URL}/load_annotation/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .catch((error) => console.error("Error loading annotation:", error));

  return response;
}
