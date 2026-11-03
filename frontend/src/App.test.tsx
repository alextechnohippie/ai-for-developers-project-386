import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

// Юнит-тест изолирован от бэкенда: сгенерированный SDK замокан. Реальную
// связь фронт→бэк через контракт проверяет браузерный e2e (тикет #12).
vi.mock("./api/generated", () => ({
  listMeetingTypes: vi.fn(() =>
    Promise.resolve({
      data: [
        {
          id: "introduction",
          title: "Знакомство",
          description: "Короткий звонок, чтобы обсудить ваш вопрос.",
          durationMinutes: 15,
        },
        {
          id: "consultation",
          title: "Консультация",
          description: "Подробный разговор по вашей задаче.",
          durationMinutes: 30,
        },
      ],
    }),
  ),
}));

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

describe("Путь гостя", () => {
  it.each([
    ["introduction", "Знакомство", "15 минут"],
    ["consultation", "Консультация", "30 минут"],
  ])("открывает прямую ссылку на %s", async (id, name, duration) => {
    window.history.replaceState(null, "", `/#/book/${id}`);
    render(<App />);
    expect(await screen.findByRole("heading", { name, level: 1 })).toBeDefined();
    expect(screen.getByText(duration)).toBeDefined();
    expect(document.title).toContain(name);
  });

  it("позволяет вернуться с неизвестной ссылки", async () => {
    window.history.replaceState(null, "", "/#/book/unknown");
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Страница не найдена" })).toBeDefined();
    fireEvent.click(screen.getByRole("link", { name: "Вернуться на главную" }));
    expect(
      await screen.findByRole("heading", { name: "Календарь звонков", level: 1 }),
    ).toBeDefined();
  });

  it.each([
    ["Знакомство", "15 минут"],
    ["Консультация", "30 минут"],
  ])("переходит к записи на %s и возвращается", async (name, duration) => {
    render(<App />);
    fireEvent.click(
      within(await screen.findByRole("article", { name })).getByRole("link", {
        name: "Выбрать время",
      }),
    );
    expect(await screen.findByRole("heading", { name, level: 1 })).toBeDefined();
    expect(screen.getByText(duration)).toBeDefined();
    expect(screen.getByText("Онлайн-запись скоро появится")).toBeDefined();
    fireEvent.click(screen.getByRole("link", { name: "Вернуться на главную" }));
    expect(
      await screen.findByRole("heading", { name: "Календарь звонков", level: 1 }),
    ).toBeDefined();
  });

  it("показывает описание сервиса и два типа встречи с бэкенда", async () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Календарь звонков", level: 1 })).toBeDefined();
    expect(
      screen.getByText("Выберите формат встречи и удобное время. Регистрация не нужна."),
    ).toBeDefined();
    const introduction = await screen.findByRole("article", { name: "Знакомство" });
    expect(within(introduction).getByText("15 минут")).toBeDefined();
    expect(within(introduction).getByRole("link", { name: "Выбрать время" })).toBeDefined();
    const consultation = screen.getByRole("article", { name: "Консультация" });
    expect(within(consultation).getByText("30 минут")).toBeDefined();
    expect(within(consultation).getByRole("link", { name: "Выбрать время" })).toBeDefined();
  });
});
