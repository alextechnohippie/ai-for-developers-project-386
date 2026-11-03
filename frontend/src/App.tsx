import { useEffect, useRef, useSyncExternalStore } from "react";
import "./App.css";

const meetingTypes = [
  {
    id: "introduction",
    name: "Знакомство",
    duration: 15,
    description: "Короткий звонок, чтобы обсудить ваш вопрос.",
  },
  {
    id: "consultation",
    name: "Консультация",
    duration: 30,
    description: "Подробный разговор по вашей задаче.",
  },
];

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function App() {
  const hash = useSyncExternalStore(subscribeToLocation, () => window.location.hash);
  const heading = useRef<HTMLHeadingElement>(null);
  const isHome = hash === "" || hash === "#/";
  const meeting = meetingTypes.find((item) => hash === `#/book/${item.id}`);

  useEffect(() => {
    document.title = isHome
      ? "Календарь звонков"
      : `${meeting?.name ?? "Страница не найдена"} — Календарь звонков`;
    heading.current?.focus();
  }, [hash, isHome, meeting]);

  if (!isHome) {
    return (
      <main className="page booking-page">
        <p className="eyebrow">Календарь звонков</p>
        <section className="booking-card">
          <h1 ref={heading} tabIndex={-1}>
            {meeting?.name ?? "Страница не найдена"}
          </h1>
          {meeting ? (
            <>
              <p className="duration">{meeting.duration} минут</p>
              <p className="placeholder-message">Онлайн-запись скоро появится</p>
            </>
          ) : (
            <p>Проверьте ссылку или выберите тип встречи на главной.</p>
          )}
          <a className="back-link" href="#/">
            Вернуться на главную
          </a>
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
        <div className="cards">
          {meetingTypes.map((meeting) => (
            <article className="card" key={meeting.id} aria-labelledby={`${meeting.id}-title`}>
              <p className="duration">{meeting.duration} минут</p>
              <h3 id={`${meeting.id}-title`}>{meeting.name}</h3>
              <p className="description">{meeting.description}</p>
              <a className="button" href={`#/book/${meeting.id}`}>
                Выбрать время
              </a>
            </article>
          ))}
        </div>
      </section>
      <p className="footnote">Выберите тип встречи, затем переходите к выбору времени.</p>
    </main>
  );
}

export default App;
