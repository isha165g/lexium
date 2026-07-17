import { route } from "./router.js";
import { error } from "./utils.js";

export default {
  async fetch(request, env) {

    try {

      const response = await route(request, env);

      if (response) {
        return response;
      }

      const pathname = new URL(request.url).pathname;

      if (pathname.startsWith("/api/")) {
        return error("Endpoint not found.", 404);
      }

      return env.ASSETS.fetch(request);

    } catch (err) {

      console.error(err);

      return error(
        err instanceof Error
          ? err.message
          : "Internal server error."
      );
    }
  }
};