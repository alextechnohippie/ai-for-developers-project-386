package calendar

import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.RoutingContext
import io.ktor.server.routing.get
import io.ktor.server.routing.post
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
    val bookingStore = BookingStore()
    routing {
        route("/api") {
            calendarRoutes(clock, bookingStore)
        }
    }
}

private fun Route.calendarRoutes(clock: Clock, store: BookingStore) {
    get("/health") {
        call.respond(HealthResponse(status = "ok"))
    }
    get("/meeting-types") {
        call.respond(seedMeetingTypes)
    }
    get("/meeting-types/{meetingTypeId}/slots") {
        respondSlots(clock, store)
    }
    get("/bookings") {
        call.respond(store.list())
    }
    post("/bookings") {
        respondBooking(clock, store)
    }
}

private suspend fun RoutingContext.respondSlots(clock: Clock, store: BookingStore) {
    val meetingTypeId = call.parameters["meetingTypeId"]
    val meetingType = seedMeetingTypes.find { it.id == meetingTypeId }
    if (meetingType == null) {
        call.respond(
            HttpStatusCode.NotFound,
            ApiError(code = "MEETING_TYPE_NOT_FOUND", message = "Тип встречи не найден: $meetingTypeId"),
        )
        return
    }
    val slots = Slots.available(
        durationMinutes = meetingType.durationMinutes,
        now = clock.instant(),
        zone = MOSCOW_ZONE,
        occupied = store.occupiedIntervals(),
    )
    call.respond(slots)
}

private suspend fun RoutingContext.respondBooking(clock: Clock, store: BookingStore) {
    val request = call.receive<CreateBookingRequest>()
    when (val result = Bookings.create(request, clock.instant(), store)) {
        is BookingResult.Created -> call.respond(HttpStatusCode.Created, result.booking)
        BookingResult.UnknownType -> call.respond(
            HttpStatusCode.NotFound,
            ApiError(
                code = "MEETING_TYPE_NOT_FOUND",
                message = "Тип встречи не найден: ${request.meetingTypeId}",
            ),
        )
        is BookingResult.Invalid -> call.respond(
            HttpStatusCode.BadRequest,
            ApiError(code = "VALIDATION_ERROR", message = result.message),
        )
        BookingResult.Conflict -> call.respond(
            HttpStatusCode.Conflict,
            ApiError(code = "SLOT_TAKEN", message = "Это время уже занято. Выберите другой свободный слот."),
        )
    }
}
