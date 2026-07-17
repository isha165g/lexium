async function request(url, options = {}) {
  const response = await fetch(url, options);

  let data = {};

  try {
    data = await response.json();
  } catch {}

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
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