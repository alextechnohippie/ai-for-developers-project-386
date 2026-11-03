import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

// Изолируем дымовой тест от сети: подменяем SDK.
vi.mock("./api/generated", () => ({
  getHealth: () => Promise.resolve({ data: { status: "ok" }, error: undefined }),
}));

describe("App", () => {
  it("рендерится и показывает статус бэкенда", async () => {
    render(<App />);
    expect(screen.getByText("Календарь звонков")).toBeDefined();
    expect(await screen.findByText("ok")).toBeDefined();
  });
});
