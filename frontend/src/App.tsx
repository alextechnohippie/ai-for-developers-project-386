import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import "./App.css";
import { listMeetingTypes, type MeetingType } from "./api/generated";

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
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
                  <p className="placeholder-message">Онлайн-запись скоро появится</p>
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
