import { defineConfig } from "@playwright/test";

const BACKEND =
  "java -classpath gradle/wrapper/gradle-wrapper.jar org.gradle.wrapper.GradleWrapperMain run --console=plain";

// Один браузер, живой стек: Ktor на :8080 и собранный фронт через `vite preview` на :4173.
// webServer-команды запускаются относительно папки e2e (cwd), фронт проксирует /api на Ktor.
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: "line",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: BACKEND,
      cwd: "../backend",
      url: "http://localhost:8080/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command: "npm run preview -- --port 4173 --strictPort",
      cwd: "../frontend",
      url: "http://localhost:4173",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
