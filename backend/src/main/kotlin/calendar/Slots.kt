package calendar

import kotlinx.serialization.Serializable
import java.time.Duration
import java.time.Instant
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter

/** Свободный слот: полуоткрытый интервал [start, end) во времени UTC (ISO-8601). */
@Serializable
data class Slot(val start: String, val end: String)

/** Занятый интервал [start, end) — например, уже созданная бронь. */
data class Interval(val start: Instant, val end: Instant)

/**
 * Пересекаются ли полуоткрытые интервалы [aStart, aEnd) и [bStart, bEnd).
 * Примыкание (конец одного = начало другого) пересечением не считается.
 */
fun intervalsOverlap(aStart: Instant, aEnd: Instant, bStart: Instant, bEnd: Instant): Boolean =
    aStart.isBefore(bEnd) && bStart.isBefore(aEnd)

/** Пересекаются ли два интервала (полуоткрытые, примыкание — не пересечение). */
fun intervalsOverlap(a: Interval, b: Interval): Boolean =
    intervalsOverlap(a.start, a.end, b.start, b.end)

/** Форматирует момент времени в ISO-8601 UTC (например, 2026-11-05T06:00:00Z). */
fun toIsoInstant(instant: Instant): String = DateTimeFormatter.ISO_INSTANT.format(instant)

/** Таймзона рабочих часов владельца (T1). Europe/Moscow = UTC+3, без переходов на лето. */
val MOSCOW_ZONE: ZoneId = ZoneId.of("Europe/Moscow")

private const val WORK_START_HOUR = 9
private const val WORK_END_HOUR = 18
private const val WINDOW_DAYS = 14

/** Генерация свободных слотов по модели T1. Детерминирована относительно [now] и [zone]. */
object Slots {
    /**
     * Свободные слоты для встречи длительностью [durationMinutes] минут.
     *
     * Окно — [WINDOW_DAYS] календарных дней, начиная с завтрашнего (относительно [now] в [zone]);
     * рабочие часы 09:00–18:00; старты идут от 09:00 с шагом в длительность, включаются только
     * слоты, целиком помещающиеся до 18:00. Пересекающиеся с [occupied] интервалы исключаются
     * (пересечение полуоткрытых интервалов; примыкание конца к началу — не пересечение).
     */
    fun available(
        durationMinutes: Int,
        now: Instant,
        zone: ZoneId,
        occupied: List<Interval>,
    ): List<Slot> {
        val duration = Duration.ofMinutes(durationMinutes.toLong())
        val workStart = LocalTime.of(WORK_START_HOUR, 0)
        val workEnd = LocalTime.of(WORK_END_HOUR, 0)
        val firstDay = now.atZone(zone).toLocalDate().plusDays(1)

        val slots = mutableListOf<Slot>()
        for (dayOffset in 0 until WINDOW_DAYS) {
            val day = firstDay.plusDays(dayOffset.toLong())
            val dayEnd = day.atTime(workEnd).atZone(zone).toInstant()
            var start = day.atTime(workStart).atZone(zone).toInstant()
            while (!start.plus(duration).isAfter(dayEnd)) {
                val end = start.plus(duration)
                if (occupied.none { intervalsOverlap(start, end, it.start, it.end) }) {
                    slots.add(Slot(start = toIsoInstant(start), end = toIsoInstant(end)))
                }
                start = end
            }
        }
        return slots
    }
}
