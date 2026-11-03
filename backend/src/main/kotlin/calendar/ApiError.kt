package calendar

import kotlinx.serialization.Serializable

/** Ошибка API: машинный код и человекочитаемое сообщение для гостя. */
@Serializable
data class ApiError(val code: String, val message: String)
