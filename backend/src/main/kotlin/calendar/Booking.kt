package calendar

import kotlinx.serialization.Serializable
import java.time.Instant

/** Запись гостя на встречу. start/end — ISO-8601 UTC, полуоткрытый интервал [start, end). */
@Serializable
data class Booking(
    val id: String,
    val meetingTypeId: String,
    val start: String,
    val end: String,
    val guestName: String,
)

/** Интервал занятости [start, end) этой брони. */
fun Booking.toInterval(): Interval = Interval(Instant.parse(start), Instant.parse(end))

/** Тело запроса на создание записи: end сервер выводит из длительности типа. */
@Serializable
data class CreateBookingRequest(
    val meetingTypeId: String,
    val start: String,
    val guestName: String,
)
