package calendar

import kotlinx.serialization.Serializable

/** Тип встречи, который гость может забронировать. Управление типами вне scope — это seed-данные. */
@Serializable
data class MeetingType(
    val id: String,
    val title: String,
    val description: String,
    val durationMinutes: Int,
)

/** Заранее заданные типы встреч владельца (seed; перезапуск сервиса их восстанавливает). */
val seedMeetingTypes: List<MeetingType> = listOf(
    MeetingType(
        id = "introduction",
        title = "Знакомство",
        description = "Короткий звонок, чтобы обсудить ваш вопрос.",
        durationMinutes = 15,
    ),
    MeetingType(
        id = "consultation",
        title = "Консультация",
        description = "Подробный разговор по вашей задаче.",
        durationMinutes = 30,
    ),
)
