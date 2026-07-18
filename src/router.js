import { health } from "./routes/health.js";
import { generate } from "./routes/generate.js";

export async function route(request, env) {

  const { pathname } = new URL(request.url);

  if (
    pathname === "/api/health" &&
    request.method === "GET"
  ) {
    return health(request, env);
  }

  if (
    pathname === "/api/generate" &&
    request.method === "POST"
  ) {
    return generate(request, env);
  }

  return null;
}