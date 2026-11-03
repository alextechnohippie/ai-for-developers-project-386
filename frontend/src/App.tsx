import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import "./App.css";
import { listMeetingTypes, listSlots, type MeetingType, type Slot } from "./api/generated";

const BOOKING_ZONE = "Europe/Moscow";
const dayFormat = new Intl.DateTimeFormat("ru-RU", {
  timeZone: BOOKING_ZONE,
  day: "numeric",
  month: "long",
});
const timeFormat = new Intl.DateTimeFormat("ru-RU", {
  timeZone: BOOKING_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

function groupByDay(slots: Slot[]): [string, Slot[]][] {
  const groups = new Map<string, Slot[]>();
  for (const slot of slots) {
    const day = dayFormat.format(new Date(slot.start));
    const bucket = groups.get(day) ?? [];
    bucket.push(slot);
    groups.set(day, bucket);
  }
  return [...groups.entries()];
}

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function App() {
  const hash = useSyncExternalStore(subscribeToLocation, () => window.location.hash);
  const heading = useRef<HTMLHeadingElement>(null);
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[] | null>(null);
  const [slotsFor, setSlotsFor] = useState<{ id: string; slots: Slot[] } | null>(null);
  const isHome = hash === "" || hash === "#/";
  const isLoading = meetingTypes === null;
  const meeting = meetingTypes?.find((item) => hash === `#/book/${item.id}`);
  const meetingId = meeting?.id;
  // null, пока слоты для текущего типа ещё не загружены (или тип не выбран).
  const slots = slotsFor && slotsFor.id === meetingId ? slotsFor.slots : null;

  useEffect(() => {
    let active = true;
    listMeetingTypes().then(({ data }) => {
      if (active && data) {
        setMeetingTypes(data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!meetingId) {
      return;
    }
    let active = true;
    listSlots({ path: { meetingTypeId: meetingId } }).then(({ data }) => {
      if (active && data) {
        setSlotsFor({ id: meetingId, slots: data });
      }
    });
    return () => {
      active = false;
    };
  }, [meetingId]);

  useEffect(() => {
    document.title = isHome
      ? "Календарь звонков"
      : `${meeting?.title ?? "Страница не найдена"} — Календарь звонков`;
    heading.current?.focus();
  }, [hash, isHome, meeting]);

  if (!isHome) {
    return (
      <main className="page booking-page">
        <p className="eyebrow">Календарь звонков</p>
        <section className="booking-card">
          {isLoading ? (
            <p className="loading">Загружаем типы встреч…</p>
          ) : (
            <>
              <h1 ref={heading} tabIndex={-1}>
                {meeting?.title ?? "Страница не найдена"}
              </h1>
              {meeting ? (
                <>
                  <p className="duration">{meeting.durationMinutes} минут</p>
                  <section aria-label="Свободное время">
                    {slots === null ? (
                      <p className="loading">Загружаем свободное время…</p>
                    ) : slots.length === 0 ? (
                      <p className="empty">Свободных слотов пока нет.</p>
                    ) : (
                      groupByDay(slots).map(([day, daySlots]) => (
                        <div className="slot-day" key={day}>
                          <h2 className="slot-day-title">{day}</h2>
                          <ul className="slot-times">
                            {daySlots.map((slot) => (
                              <li key={slot.start}>
                                <button type="button" className="slot">
                                  {timeFormat.format(new Date(slot.start))}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </section>
                </>
              ) : (
                <p>Проверьте ссылку или выберите тип встречи на главной.</p>
              )}
              <a className="back-link" href="#/">
                Вернуться на главную
              </a>
            </>
          )}
        </section>
      </main>
    );
  }
  return (
    <main className="page">
      <header className="intro">
        <p className="eyebrow">Время для разговора</p>
        <h1 ref={heading} tabIndex={-1}>
          Календарь звонков
        </h1>
        <p className="lead">Выберите формат встречи и удобное время. Регистрация не нужна.</p>
      </header>
      <section aria-labelledby="meeting-types-title">
        <h2 id="meeting-types-title" className="section-title">
          Выберите формат встречи
        </h2>
        {isLoading ? (
          <p className="loading">Загружаем типы встреч…</p>
        ) : (
          <div className="cards">
            {meetingTypes.map((item) => (
              <article className="card" key={item.id} aria-labelledby={`${item.id}-title`}>
                <p className="duration">{item.durationMinutes} минут</p>
                <h3 id={`${item.id}-title`}>{item.title}</h3>
                <p className="description">{item.description}</p>
                <a className="button" href={`#/book/${item.id}`}>
                  Выбрать время
                </a>
              </article>
            ))}
          </div>
        )}
      </section>
      <p className="footnote">Выберите тип встречи, затем переходите к выбору времени.</p>
    </main>
  );
}

export default App;
