// functions to interact with the backend API
// functions handle errors by printing

const API_URL = "http://localhost:8000";

// Errors from api functions must be handled by the callers, in util.js
export async function generatePrediction(data) {
  const response = await fetch(`${API_URL}/generate_prediction/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Fetch error, status:", response.status);
  }

  return await response.json();
}

export async function saveAnnotation(data) {
  const response = await fetch(`${API_URL}/save_annotation/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Fetch error, status:", response.status);
  }

  return await response.json();
}

export async function loadAnnotation(data) {
  const response = await fetch(`${API_URL}/load_annotation/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Fetch error, status:", response.status);
  }

  return await response.json();
}
