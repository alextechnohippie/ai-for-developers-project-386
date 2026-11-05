# syntax=docker/dockerfile:1
#
# Многостадийная сборка: один образ обслуживает и API, и собранный фронтенд (SPA).
# Ktor читает порт из переменной окружения PORT и отдаёт статику из resources/static.

# --- Стадия 1: сборка фронтенда (SPA) ---
# Генерированный SDK уже в репозитории, поэтому контракты для сборки не нужны —
# достаточно `npm ci` + `npm run build` (tsc -b + vite build) → frontend/dist.
FROM node:24.22.2-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Стадия 2: сборка бэкенда (fat jar со встроенной статикой) ---
# Gradle вызываем через Wrapper кроссплатформенно (java -classpath ... GradleWrapperMain),
# как в mise.toml — без chmod/CRLF-зависимости от ./gradlew. Собранный фронт кладём
# в resources/static, чтобы он попал внутрь jar.
FROM eclipse-temurin:21-jdk AS backend
WORKDIR /app/backend
COPY backend/ ./
COPY --from=frontend /app/frontend/dist ./src/main/resources/static
RUN java -classpath gradle/wrapper/gradle-wrapper.jar \
    org.gradle.wrapper.GradleWrapperMain buildFatJar --no-daemon --console=plain

# --- Стадия 3: рантайм (только JRE + fat jar) ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend /app/backend/build/libs/*-all.jar ./app.jar
# Порт по умолчанию; на деплое и в проверке переопределяется переменной PORT.
ENV PORT=8080
EXPOSE 8080
# Приложение стартует автоматически при запуске контейнера; порт берётся из PORT в коде.
CMD ["java", "-jar", "/app/app.jar"]
