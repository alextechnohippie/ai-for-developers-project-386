import "@typespec/http";

using Http;

@service(#{ title: "Calendar API" })
@server("http://localhost:8080", "Local development")
namespace CalendarApi;

/** Проверка живости сервиса. */
model HealthResponse {
  status: string;
}

@get
@route("/api/health")
op getHealth(): HealthResponse;
