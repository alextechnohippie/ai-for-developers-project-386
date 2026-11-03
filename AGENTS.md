# AGENTS.md

Учебный проект «Календарь звонков» (Hexlet): сервис бронирования календаря.
Монорепо: контракт API + бэкенд + фронтенд. Окружение и задачи — через **mise**.

## Команды

Все команды запускаются из корня репозитория.

| Команда | Что делает |
|---|---|
| `mise install` | Ставит закреплённые инструменты (Java 21, Node 24, hk) |
| `mise run install` | Ставит npm-зависимости (contracts, frontend) |
| `mise run check` | Все проверки: контракт, дрифт SDK, detekt+тесты бэка, lint/format/build/test фронта |
| `mise run check:fast` | Быстрые проверки (линт/формат/типы) — используется в pre-commit |
| `mise run fmt` | Автоисправление формата и линта |
| `mise run dev:backend` | Ktor на http://localhost:8080 |
| `mise run dev:frontend` | Vite на http://localhost:5173 (проксирует `/api` на :8080) |
| `mise run e2e` | Браузерный e2e (Playwright) на живом стеке; **не входит** в `check` |
| `mise run e2e:install` | Зависимости e2e; браузер — `cd e2e && npx playwright install chromium` |

CI (`.github/workflows/ci.yml`) на каждый push выполняет `mise run install` + `mise run check`
(job `check`) и отдельным job `e2e` — браузерный сценарий на живом стеке.

## Устройство

- `contracts/` — API на **TypeSpec** → `contracts/openapi/openapi.yaml` (OpenAPI 3.0.0).
- `backend/` — **Kotlin + Ktor** (Gradle Wrapper), пакет `calendar`, эндпоинт `GET /api/health`.
- `frontend/` — **React + TypeScript + Vite**; TS-клиент генерится из контракта в
  `frontend/src/api/generated`.

Весь API — под префиксом `/api`. Контракт — источник правды: TypeSpec → OpenAPI → TS SDK.

## Скиллы (агентные)

Набор инженерных скиллов [mattpocock/skills](https://github.com/mattpocock/skills)
установлен в `.claude/skills/` (копии, в git; фиксация версий — `skills-lock.json`).
В Claude Code вызываются слэшем: `/to-spec`, `/to-tickets`, `/triage`, `/wayfinder`,
`/implement-spec`, `/code-review`, `/tdd` и др. Первичная настройка — `setup-matt-pocock-skills`
(повторять только при смене трекера). Обновление набора — `npx skills update`.

Конфигурация набора под репозиторий — в `docs/agents/`:

- **Трекер** — GitHub Issues этого репозитория. См. `docs/agents/issue-tracker.md`.
  Требует установленного и авторизованного `gh` CLI (`gh auth login`).
- **Метки triage** — канонические по умолчанию (`needs-triage`, `needs-info`,
  `ready-for-agent`, `ready-for-human`, `wontfix`). См. `docs/agents/triage-labels.md`.
- **Домен-доки** — single-context: `GLOSSARY.md` + `docs/adr/` в корне (заводятся лениво
  скиллом `/domain-modeling`). См. `docs/agents/domain.md`.

## Правила

- Коммиты — **Conventional Commits** (`feat:`, `fix:`, `chore:`, `build:`, `test:`, …).
  Проверяется хуком commit-msg.
- **Коммит реализации ссылается на тикет**, который закрывает, — номером в скобках в конце
  заголовка, напр. `feat: список типов встреч с бэкенда (#8)`. GitHub превращает номер в ссылку.
- **Не трогать** `.github/workflows/hexlet-check.yml` и имя репозитория — ими проверяет Хекслет.
- **Генерируемые пути — руками не править** (CI повторяет генерацию и проверяет дифф):
  - `contracts/openapi/openapi.yaml` — генерируется из TypeSpec (`mise run contract:build`);
  - `frontend/src/api/generated/` — клиентский SDK из OpenAPI (`mise run sdk:generate`).

  После изменения контракта выполнить оба шага, иначе дрифт-проверка в `mise run check` упадёт.
- Версии инструментов закреплены (локально = CI). Gradle — только через Wrapper, не через mise.
- Апгрейд инструментов — по официальной документации фреймворка, а не по памяти модели.

### Зафиксированные ограничения

- **TypeScript 6.x** (не 7): `@hey-api/openapi-ts` 0.99 несовместим с TS 7 preview.
- **detekt 1.23.8** (не 2.0-alpha): formatting-артефакт 2.0 не опубликован на Maven Central.
