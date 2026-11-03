package calendar

import java.time.Instant
import kotlin.test.Test
import kotlin.test.assertEquals

/** Проверки чистой генерации слотов, в частности исключения занятых интервалов (опора на #10). */
class SlotsTest {
    // 2026-11-04 15:00 МСК → окно начинается 2026-11-05; первый слот консультации 06:00–06:30Z.
    private val now: Instant = Instant.parse("2026-11-04T12:00:00Z")

    @Test
    fun `occupied interval removes the overlapping slot but keeps the next one`() {
        val occupied = listOf(
            Interval(
                start = Instant.parse("2026-11-05T06:00:00Z"),
                end = Instant.parse("2026-11-05T06:30:00Z"),
            ),
        )

        val slots = Slots.available(
            durationMinutes = 30,
            now = now,
            zone = MOSCOW_ZONE,
            occupied = occupied,
        )

        assertEquals(true, slots.none { it.start == "2026-11-05T06:00:00Z" }, "занятый слот исключён")
        assertEquals(true, slots.any { it.start == "2026-11-05T06:30:00Z" }, "соседний слот свободен")
    }

    @Test
    fun `adjacent intervals keep the slot because intervals are half-open`() {
        val touchingBefore = Interval(
            start = Instant.parse("2026-11-05T05:30:00Z"),
            end = Instant.parse("2026-11-05T06:00:00Z"),
        )
        val touchingAfter = Interval(
            start = Instant.parse("2026-11-05T06:30:00Z"),
            end = Instant.parse("2026-11-05T07:00:00Z"),
        )

        val slots = Slots.available(
            durationMinutes = 30,
            now = now,
            zone = MOSCOW_ZONE,
            occupied = listOf(touchingBefore, touchingAfter),
        )

        assertEquals(true, slots.any { it.start == "2026-11-05T06:00:00Z" }, "примыкание — не пересечение")
    }
}
