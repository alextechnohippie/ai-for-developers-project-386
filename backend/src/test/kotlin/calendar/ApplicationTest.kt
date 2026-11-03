package calendar

import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.server.testing.testApplication
import kotlinx.serialization.json.Json
import java.time.Clock
import java.time.Instant
import java.time.LocalTime
import java.time.ZoneOffset
import kotlin.test.Test
import kotlin.test.assertEquals

/** Фиксированные «сейчас» для детерминизма окна записи: 2026-11-04 15:00 по Москве. */
private val FIXED_CLOCK: Clock = Clock.fixed(Instant.parse("2026-11-04T12:00:00Z"), ZoneOffset.UTC)

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

    @Test
    fun `slots window opens tomorrow at 09 00 Moscow`() = testApplication {
        application { module(FIXED_CLOCK) }

        val response = client.get("/api/meeting-types/consultation/slots")

        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals(ContentType.Application.Json, response.contentType()?.withoutParameters())

        val slots = Json.decodeFromString<List<Slot>>(response.bodyAsText())
        assertEquals("2026-11-05T06:00:00Z", slots.first().start)
        assertEquals("2026-11-05T06:30:00Z", slots.first().end)
    }

    @Test
    fun `last start of a day ends exactly at 18 00 Moscow`() = testApplication {
        application { module(FIXED_CLOCK) }

        val slots = client.get("/api/meeting-types/consultation/slots").slots()
        val firstDay = slots.filter { it.start.substringBefore('T') == "2026-11-05" }

        assertEquals("2026-11-05T14:30:00Z", firstDay.last().start)
        assertEquals("2026-11-05T15:00:00Z", firstDay.last().end)
    }

    @Test
    fun `slots cover the 14 day window from tomorrow`() = testApplication {
        application { module(FIXED_CLOCK) }

        val slots = client.get("/api/meeting-types/consultation/slots").slots()

        assertEquals(true, slots.none { it.start.substringBefore('T') == "2026-11-04" })
        assertEquals("2026-11-05", slots.first().start.substringBefore('T'))
        assertEquals("2026-11-18", slots.last().start.substringBefore('T'))
    }

    @Test
    fun `every slot stays within working hours`() = testApplication {
        application { module(FIXED_CLOCK) }

        val slots = client.get("/api/meeting-types/introduction/slots").slots()
        val open = LocalTime.parse("09:00")
        val close = LocalTime.parse("18:00")

        slots.forEach { slot ->
            val start = Instant.parse(slot.start).atZone(MOSCOW_ZONE).toLocalTime()
            val end = Instant.parse(slot.end).atZone(MOSCOW_ZONE).toLocalTime()
            assertEquals(true, !start.isBefore(open), "старт ${slot.start} раньше 09:00 МСК")
            assertEquals(true, !end.isAfter(close), "конец ${slot.end} позже 18:00 МСК")
        }
    }

    @Test
    fun `unknown meeting type returns 404 error`() = testApplication {
        application { module(FIXED_CLOCK) }

        val response = client.get("/api/meeting-types/unknown/slots")

        assertEquals(HttpStatusCode.NotFound, response.status)
        assertEquals(ContentType.Application.Json, response.contentType()?.withoutParameters())

        val error = Json.decodeFromString<ApiError>(response.bodyAsText())
        assertEquals("MEETING_TYPE_NOT_FOUND", error.code)
        assertEquals(true, error.message.isNotBlank())
    }
}

private suspend fun io.ktor.client.statement.HttpResponse.slots(): List<Slot> =
    Json.decodeFromString(bodyAsText())
