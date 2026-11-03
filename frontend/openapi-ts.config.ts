import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "../contracts/openapi/openapi.yaml",
  output: "src/api/generated",
  plugins: [
    "@hey-api/typescript",
    "@hey-api/sdk",
    // baseUrl: false → относительные URL, запрос идёт через Vite dev-proxy (/api → :8080)
    { name: "@hey-api/client-fetch", baseUrl: false },
  ],
});
