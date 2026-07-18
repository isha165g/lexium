export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff"
}
  });
}

export function error(message, status = 500) {
  return json(
    {
      error: message
    },
    status
  );
}