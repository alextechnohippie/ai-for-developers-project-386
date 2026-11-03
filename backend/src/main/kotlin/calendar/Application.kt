package calendar

import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import java.time.Clock

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module(clock: Clock = Clock.systemUTC()) {
    install(ContentNegotiation) {
        json()
    }
    routing {
        route("/api") {
            get("/health") {
                call.respond(HealthResponse(status = "ok"))
            }
            get("/meeting-types") {
                call.respond(seedMeetingTypes)
            }
            get("/meeting-types/{meetingTypeId}/slots") {
                val meetingTypeId = call.parameters["meetingTypeId"]
                val meetingType = seedMeetingTypes.find { it.id == meetingTypeId }
                if (meetingType == null) {
                    call.respond(
                        HttpStatusCode.NotFound,
                        ApiError(
                            code = "MEETING_TYPE_NOT_FOUND",
                            message = "Тип встречи не найден: $meetingTypeId",
                        ),
                    )
                } else {
                    // Пока броней нет (POST /api/bookings — тикет #10), занятых интервалов нет.
                    val slots = Slots.available(
                        durationMinutes = meetingType.durationMinutes,
                        now = clock.instant(),
                        zone = MOSCOW_ZONE,
                        occupied = emptyList(),
                    )
                    call.respond(slots)
                }
            }
        }
    }
}
