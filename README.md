# Календарь звонков


[![hexlet-check](https://github.com/alextechnohippie/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/alextechnohippie/ai-for-developers-project-386/actions)

Разработайте совместно с ИИ сервис для бронирования календаря

Учебный проект Хекслета: https://ru.hexlet.io/programs/ai-for-developers
Как это должно работать: https://files.hexlet.app/a/2ipc5m

## Сценарий

Владелец календаря задаёт типы встреч с названием, описанием и длительностью.
Гость без регистрации выбирает тип встречи, свободное время в пределах ближайших
14 календарных дней и подтверждает запись. Она появляется в списке предстоящих
встреч владельца. Пересекающиеся встречи, в том числе разных типов, недопустимы.

Реализован полный сценарий: главная с типами встреч, выбор свободного слота в окне
14 дней, создание записи гостем (с запретом пересечений — включая разные типы и
одновременные запросы) и список предстоящих встреч владельца (`/#/owner`). Термины —
в [словаре](GLOSSARY.md), ключевые решения — в [ADR](docs/adr/), описание главной —
в [docs/home-page.md](docs/home-page.md).

## Стек приложения

- Окружение и задачи: **mise** (Java 21, Node 24)
- Контракт API: **TypeSpec → OpenAPI 3.0.0**, клиентский SDK — `@hey-api/openapi-ts`
- Бэкенд: **Kotlin + Ktor** (Gradle)
- Фронтенд: **React + TypeScript + Vite**
- Проверки: detekt, Oxlint + oxfmt, Vitest/JUnit; git-хуки — hk; CI — GitHub Actions

## Установка

```bash
git clone https://github.com/alextechnohippie/ai-for-developers-project-386.git
cd ai-for-developers-project-386
mise install        # инструменты (Java, Node, hk)
mise run install    # npm-зависимости
```

## Использование

```bash
mise run dev:backend    # Ktor на http://localhost:8080
mise run dev:frontend   # Vite на http://localhost:5173 (проксирует /api)
mise run check          # все проверки (линт, типы, тесты, сборка)
```

Рабочие команды и правила проекта — в [AGENTS.md](AGENTS.md).

## Запущенное приложение

Публичная ссылка: **https://calendar-zvonkov-96m9.onrender.com**

По ссылке проходит полный сценарий: гость выбирает тип встречи и свободный слот,
создаёт запись, она появляется в списке владельца (`/#/owner`), а повторная
пересекающаяся запись отклоняется.

> ⚠️ **Хранение данных.** Типы встреч заданы заранее (seed), а записи хранятся
> **в памяти процесса** и **сбрасываются при каждом перезапуске** (передеплой,
> рестарт или засыпание бесплатного инстанса Render). Постоянного хранилища нет —
> это осознанное ограничение учебного проекта.

## Запуск в Docker

Приложение упаковано в один образ (multi-stage [`Dockerfile`](Dockerfile) в корне):
Vite собирает фронтенд, Gradle — fat jar со встроенной статикой, рантайм — JRE.
Один сервис Ktor отдаёт и API (`/api`), и собранный фронтенд.

```bash
docker build -t calendar-zvonkov .
docker run --rm -e PORT=3000 -p 3000:3000 calendar-zvonkov
# открыть http://localhost:3000
```

Приложение слушает порт из переменной окружения **`PORT`** (по умолчанию `8080`);
её же задаёт хостинг при деплое.

## Деплой на Render через MCP

Деплой выполняет агент через [Render MCP](https://render.com/docs/mcp-server).
Конфигурация MCP-сервера — в [`.mcp.json`](.mcp.json) (проектный сервер Claude Code,
**без секретов**). Порядок подключения:

1. Сервер `render` (URL `https://mcp.render.com/mcp`, transport `http`) уже прописан
   в `.mcp.json` — он подхватывается агентом из проекта.
2. Авторизоваться одним из способов — **реальные ключи в репозиторий не коммитим**:
   - **OAuth** — официальный плагин Render для Claude Code (`/plugin install render`),
     с предрегистрированным клиентом; ключ не нужен; либо
   - **API-ключ** — создать ключ в Render (*Account Settings → API Keys*) и передать его
     **только в локальной** конфигурации через заголовок/переменную окружения:
     `claude mcp add --transport http render https://mcp.render.com/mcp --header "Authorization: Bearer $RENDER_API_KEY"`.
     Реальный ключ остаётся вне Git (в `~/.claude.json` или переменной окружения).
3. Агент создаёт Web Service (runtime Docker, ветка `main`); Render задаёт `PORT`,
   выкат идёт автоматически при push в `main`.

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
