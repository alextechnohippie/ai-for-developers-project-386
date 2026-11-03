package calendar

import kotlinx.serialization.Serializable

/** Запись гостя на встречу. start/end — ISO-8601 UTC, полуоткрытый интервал [start, end). */
@Serializable
data class Booking(
    val id: String,
    val meetingTypeId: String,
    val start: String,
    val end: String,
    val guestName: String,
)

/** Тело запроса на создание записи: end сервер выводит из длительности типа. */
@Serializable
data class CreateBookingRequest(
    val meetingTypeId: String,
    val start: String,
    val guestName: String,
)
