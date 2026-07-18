import { ERROR_MESSAGES } from "../shared/errors.js";

async function request(url, options = {}) {
  try {
    const response = await fetch(url, options);

    let data = {};

    try {
      data = await response.json();
    } catch {}

    if (!response.ok) {
      throw new Error(data.error || "Request failed.");
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError" || !navigator.onLine) {
      throw new Error(ERROR_MESSAGES.NETWORK);
    }
    throw error;
  }
}

export function generateWord(word) {
  return request("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ word })
  });
}

export function health() {
  return request("/api/health");
}