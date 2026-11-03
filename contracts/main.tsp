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

/** Свободный слот: полуоткрытый интервал [start, end) во времени UTC. */
model Slot {
  /** Начало слота (включительно), UTC. */
  start: utcDateTime;

  /** Конец слота (исключительно), UTC. */
  end: utcDateTime;
}

/** Ошибка API: машинный код и человекочитаемое сообщение. */
model ApiError {
  /** Машиночитаемый код ошибки. */
  code: string;

  /** Сообщение для показа гостю. */
  message: string;
}

@get
@route("/api/health")
op getHealth(): HealthResponse;

/** Список типов встреч, доступных для записи. */
@get
@route("/api/meeting-types")
op listMeetingTypes(): MeetingType[];

/** Свободные слоты выбранного типа встречи на окно записи (14 дней с завтрашнего). */
@get
@route("/api/meeting-types/{meetingTypeId}/slots")
op listSlots(@path meetingTypeId: string):
  | {
      @statusCode statusCode: 200;
      @body slots: Slot[];
    }
  | {
      @statusCode statusCode: 404;
      @body error: ApiError;
    };
