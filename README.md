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

Сейчас реализована первая функция: главная с двумя заранее заданными типами встреч
и переходом к заглушке записи. Ссылки `/#/book/introduction` и
`/#/book/consultation` можно открыть напрямую. Создание записи и управление типами
встреч появятся на следующем этапе. Согласованное содержание — в
[описании главной](docs/home-page.md), термины — в [словаре](GLOSSARY.md),
решения — в [ADR](docs/adr/0001-home-page-scope.md).

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

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
