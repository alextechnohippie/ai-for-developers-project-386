package calendar

import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.time.Instant

/**
 * In-memory хранилище записей (ADR-0002): интервалы [start, end) в одной коллекции,
 * проверка пересечения и вставка целиком под единым [Mutex]. Критическая секция
 * синхронная — гонка исключена, порядок параллельных запросов не влияет на корректность.
 * Перезапуск сервиса сбрасывает данные.
 */
class BookingStore {
    private val mutex = Mutex()
    private val bookings = mutableListOf<Booking>()

    /** Снимок занятых интервалов для генерации свободных слотов. */
    suspend fun occupiedIntervals(): List<Interval> = mutex.withLock {
        bookings.map { Interval(Instant.parse(it.start), Instant.parse(it.end)) }
    }

    /**
     * Атомарно проверяет конфликт и добавляет запись. Возвращает `true`, если запись
     * создана, и `false`, если интервал пересекается с уже существующей бронью любого типа.
     */
    suspend fun add(booking: Booking): Boolean = mutex.withLock {
        val start = Instant.parse(booking.start)
        val end = Instant.parse(booking.end)
        val conflict = bookings.any { existing ->
            intervalsOverlap(start, end, Instant.parse(existing.start), Instant.parse(existing.end))
        }
        if (conflict) {
            false
        } else {
            bookings.add(booking)
            true
        }
    }
}
