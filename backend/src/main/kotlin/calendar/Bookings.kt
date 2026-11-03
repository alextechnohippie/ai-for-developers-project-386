package calendar

import java.time.Duration
import java.time.Instant
import java.util.UUID

/** Исход попытки создать запись — роут отображает его в HTTP-статус и тело. */
sealed interface BookingResult {
    data class Created(val booking: Booking) : BookingResult
    data object UnknownType : BookingResult
    data class Invalid(val message: String) : BookingResult
    data object Conflict : BookingResult
}

/** Прикладная логика создания записи: валидация легальности старта, вывод end, атомарная вставка. */
object Bookings {
    // Ранние возвраты — это guard-clause-валидация (неизвестный тип, пустое имя,
    // формат, легальность старта), каждый случай читается отдельной строкой.
    @Suppress("ReturnCount")
    suspend fun create(request: CreateBookingRequest, now: Instant, store: BookingStore): BookingResult {
        val meetingType = seedMeetingTypes.find { it.id == request.meetingTypeId }
            ?: return BookingResult.UnknownType

        if (request.guestName.isBlank()) {
            return BookingResult.Invalid("Укажите имя гостя.")
        }

        val startInstant = runCatching { Instant.parse(request.start) }.getOrNull()
            ?: return BookingResult.Invalid("Некорректный формат времени.")

        val legalStarts = Slots.available(meetingType.durationMinutes, now, MOSCOW_ZONE, emptyList())
            .map { Instant.parse(it.start) }
            .toSet()
        if (startInstant !in legalStarts) {
            return BookingResult.Invalid("Выбранное время недоступно для записи.")
        }

        val end = startInstant.plus(Duration.ofMinutes(meetingType.durationMinutes.toLong()))
        val booking = Booking(
            id = UUID.randomUUID().toString(),
            meetingTypeId = meetingType.id,
            start = toIsoInstant(startInstant),
            end = toIsoInstant(end),
            guestName = request.guestName,
        )
        return if (store.add(booking)) BookingResult.Created(booking) else BookingResult.Conflict
    }
}
