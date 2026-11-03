import "@typespec/http";

using Http;

@service(#{ title: "Calendar API" })
@server("http://localhost:8080", "Local development")
namespace CalendarApi;

/** Проверка живости сервиса. */
model HealthResponse {
  status: string;
}

/** Тип встречи, который гость может забронировать. */
model MeetingType {
  /** Стабильный идентификатор типа. */
  id: string;

  /** Название, видимое гостю. */
  title: string;

  /** Короткое описание формата встречи. */
  description: string;

  /** Длительность встречи в минутах. */
  durationMinutes: int32;
}

@get
@route("/api/health")
op getHealth(): HealthResponse;

/** Список типов встреч, доступных для записи. */
@get
@route("/api/meeting-types")
op listMeetingTypes(): MeetingType[];
