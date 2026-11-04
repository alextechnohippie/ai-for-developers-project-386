package calendar

import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.testing.testApplication
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

/**
 * Проверяет, что тот же сервис отдаёт статику фронтенда из resources/static.
 * В тестах статика берётся из src/test/resources/static/index.html; в образе
 * этот каталог наполняется собранным фронтом (vite build).
 */
class StaticContentTest {
    @Test
    fun `GET root serves the SPA index html`() = testApplication {
        application { module() }

        val response = client.get("/")

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals(ContentType.Text.Html, response.contentType()?.withoutParameters())
        assertTrue(response.bodyAsText().contains("<!doctype html>", ignoreCase = true))
    }

    @Test
    fun `api routes are not shadowed by static content`() = testApplication {
        application { module() }

        val response = client.get("/api/health")

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals(ContentType.Application.Json, response.contentType()?.withoutParameters())
    }
}
