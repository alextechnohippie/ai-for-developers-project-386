import { expect, test } from "@playwright/test";

// Сквозной happy-path против живого стека (без подмены ответов API):
// гость выбирает тип → видит слоты → бронирует → видит подтверждение;
// затем бронь появляется в списке владельца.
test("гость бронирует слот, владелец видит встречу", async ({ page }) => {
  const guestName = `Гость ${Date.now()}`;

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Календарь звонков", level: 1 })).toBeVisible();

  // Выбираем тип «Консультация».
  const consultation = page.getByRole("article", { name: "Консультация" });
  await consultation.getByRole("link", { name: "Выбрать время" }).click();

  // Видим свободные слоты, берём первый.
  const firstSlot = page.locator("button.slot").first();
  await expect(firstSlot).toBeVisible();
  await firstSlot.click();

  // Заполняем имя и бронируем.
  await page.getByLabel("Ваше имя").fill(guestName);
  await page.getByRole("button", { name: "Записаться" }).click();

  // Подтверждение.
  await expect(page.getByText("Готово! Вы записаны.")).toBeVisible();
  await expect(page.getByText(guestName)).toBeVisible();

  // Бронь видна в списке владельца.
  await page.goto("/#/owner");
  await expect(page.getByRole("heading", { name: "Предстоящие встречи", level: 1 })).toBeVisible();
  await expect(page.getByText(guestName)).toBeVisible();
  await expect(page.getByText("Консультация")).toBeVisible();
});
