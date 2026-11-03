import { type FormEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
import "./App.css";
import {
  type Booking,
  createBooking,
  listMeetingTypes,
  listSlots,
  type MeetingType,
  type Slot,
} from "./api/generated";

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

function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso));
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return `${dayFormat.format(date)}, ${timeFormat.format(date)}`;
}

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

function BookingView({ meeting }: { meeting: MeetingType }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [confirmation, setConfirmation] = useState<Booking | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    heading.current?.focus();
  }, []);

  useEffect(() => {
    let active = true;
    listSlots({ path: { meetingTypeId: meeting.id } }).then(({ data }) => {
      if (active && data) {
        setSlots(data);
      }
    });
    return () => {
      active = false;
    };
  }, [meeting.id, reloadToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStart) {
      return;
    }
    setSubmitting(true);
    setBookingError(null);
    const { data, error } = await createBooking({
      body: { meetingTypeId: meeting.id, start: selectedStart, guestName },
    });
    setSubmitting(false);
    if (data) {
      setConfirmation(data);
      setSelectedStart(null);
      setGuestName("");
    } else {
      setBookingError(error?.message ?? "Не удалось создать запись. Попробуйте ещё раз.");
    }
    // Перечитать слоты: занятое время должно исчезнуть, конфликтное — обновиться.
    setReloadToken((token) => token + 1);
  }

  return (
    <>
      <h1 ref={heading} tabIndex={-1}>
        {meeting.title}
      </h1>
      {confirmation ? (
        <div className="confirmation">
          <p className="success">Готово! Вы записаны.</p>
          <p>
            {meeting.title} — {formatDateTime(confirmation.start)} МСК
          </p>
          <p>Имя гостя: {confirmation.guestName}</p>
        </div>
      ) : (
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
                        <button
                          type="button"
                          className={slot.start === selectedStart ? "slot slot-selected" : "slot"}
                          aria-pressed={slot.start === selectedStart}
                          onClick={() => {
                            setSelectedStart(slot.start);
                            setBookingError(null);
                          }}
                        >
                          {formatTime(slot.start)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </section>
          {selectedStart && (
            <form className="booking-form" onSubmit={handleSubmit}>
              <p className="chosen">Выбрано: {formatDateTime(selectedStart)} МСК</p>
              <label htmlFor="guest-name">Ваше имя</label>
              <input
                id="guest-name"
                className="name-input"
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
              />
              {bookingError && (
                <p className="form-error" role="alert">
                  {bookingError}
                </p>
              )}
              <div className="form-actions">
                <button type="submit" className="button" disabled={submitting}>
                  Записаться
                </button>
                <button type="button" className="secondary" onClick={() => setSelectedStart(null)}>
                  Отмена
                </button>
              </div>
            </form>
          )}
        </>
      )}
      <a className="back-link" href="#/">
        Вернуться на главную
      </a>
    </>
  );
}

function App() {
  const hash = useSyncExternalStore(subscribeToLocation, () => window.location.hash);
  const heading = useRef<HTMLHeadingElement>(null);
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[] | null>(null);
  const isHome = hash === "" || hash === "#/";
  const isLoading = meetingTypes === null;
  const meeting = meetingTypes?.find((item) => hash === `#/book/${item.id}`);

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
    document.title = isHome
      ? "Календарь звонков"
      : `${meeting?.title ?? "Страница не найдена"} — Календарь звонков`;
    if (isHome || !meeting) {
      heading.current?.focus();
    }
  }, [hash, isHome, meeting]);

  if (!isHome) {
    return (
      <main className="page booking-page">
        <p className="eyebrow">Календарь звонков</p>
        <section className="booking-card">
          {isLoading ? (
            <p className="loading">Загружаем типы встреч…</p>
          ) : meeting ? (
            <BookingView meeting={meeting} key={meeting.id} />
          ) : (
            <>
              <h1 ref={heading} tabIndex={-1}>
                Страница не найдена
              </h1>
              <p>Проверьте ссылку или выберите тип встречи на главной.</p>
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
