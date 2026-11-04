package calendar

import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

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
        bookings.map { it.toInterval() }
    }

    /** Все записи, отсортированные по времени начала (ISO-8601 UTC сортируется как хронология). */
    suspend fun list(): List<Booking> = mutex.withLock {
        bookings.sortedBy { it.start }
    }

    /**
     * Атомарно проверяет конфликт и добавляет запись. Возвращает `true`, если запись
     * создана, и `false`, если интервал пересекается с уже существующей бронью любого типа.
     */
    suspend fun add(booking: Booking): Boolean = mutex.withLock {
        val interval = booking.toInterval()
        val conflict = bookings.any { intervalsOverlap(interval, it.toInterval()) }
        if (conflict) {
            false
        } else {
            bookings.add(booking)
            true
        }
    }
}
