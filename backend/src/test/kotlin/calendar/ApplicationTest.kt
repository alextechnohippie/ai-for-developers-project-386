package calendar

import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.testing.testApplication
import kotlinx.serialization.json.Json
import kotlin.test.Test
import kotlin.test.assertEquals

class ApplicationTest {
    @Test
    fun `GET api health returns ok`() = testApplication {
        application { module() }

        val response = client.get("/api/health")

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals(ContentType.Application.Json, response.contentType()?.withoutParameters())
        assertEquals("""{"status":"ok"}""", response.bodyAsText())
    }

    @Test
    fun `GET api meeting-types returns the two seed types`() = testApplication {
        application { module() }

        val response = client.get("/api/meeting-types")

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals(ContentType.Application.Json, response.contentType()?.withoutParameters())

        val types = Json.decodeFromString<List<MeetingType>>(response.bodyAsText())
        assertEquals(
            listOf("introduction" to 15, "consultation" to 30),
            types.map { it.id to it.durationMinutes },
        )
        assertEquals(listOf("Знакомство", "Консультация"), types.map { it.title })
        assertEquals(true, types.all { it.description.isNotBlank() })
    }
}
