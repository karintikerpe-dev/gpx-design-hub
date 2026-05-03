import { useState, useEffect } from 'react';
import { CHALLENGES } from './data.js';

function useCountdown(deadline) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const target = new Date(deadline).getTime();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  return { diff, days, hours, mins };
}

function Avatar({ name, color, size = 32 }) {
  const initial = (name || "?").trim()[0].toUpperCase();
  return (
    <span className="ch-avatar" style={{
      background: color || "#94A3B8",
      width: size, height: size,
      fontSize: size * 0.42,
    }}>
      {initial}
    </span>
  );
}

function ActiveChallengeCard({ challenge }) {
  const { days, hours, mins, diff } = useCountdown(challenge.deadline);
  const finished = diff === 0;
  const slammed = challenge.title.replace(/\s+/g, "");
  return (
    <section className="ch-active">
      <div className="ch-active-head">
        <span className="ch-eyebrow"><span className="dot-pulse" /> Current challenge</span>
        <span className="ch-pill ch-pill-live">{challenge.status}</span>
      </div>
      <h2 className="ch-active-title" title={challenge.title}>
        <span className="ch-active-title-readable">{challenge.title}</span>
        <span className="ch-active-title-slam" aria-hidden="true">{slammed}</span>
      </h2>
      <div className="ch-active-meta">
        <div className="ch-countdown">
          {finished ? (
            <span className="ch-countdown-done">Submissions closed</span>
          ) : (
            <>
              <span className="ch-countdown-num">{days}</span>
              <span className="ch-countdown-unit">{days === 1 ? "day" : "days"}</span>
              <span className="ch-countdown-num">{hours}</span>
              <span className="ch-countdown-unit">hrs</span>
              <span className="ch-countdown-num">{mins}</span>
              <span className="ch-countdown-unit">min</span>
              <span className="ch-countdown-label">left to submit</span>
            </>
          )}
        </div>
        <div className="ch-active-actions">
          <button className="btn primary">Submit your entry</button>
          <button className="btn ghost">View brief</button>
        </div>
      </div>
    </section>
  );
}

function PreviousChallenges({ items }) {
  return (
    <section className="ch-section">
      <header className="ch-section-head">
        <h3>Previous challenges</h3>
        <span className="muted small">{items.length} this year</span>
      </header>
      <ul className="ch-prev-list">
        {items.map((c) => (
          <li key={c.id} className="ch-prev">
            <div className="ch-prev-date">{c.date}</div>
            <div className="ch-prev-title">{c.title}</div>
            <div className="ch-prev-winner">
              <span className="muted xs">Winner</span>
              <Avatar name={c.winner.name} color={c.winner.avatar} size={28} />
              <span className="ch-prev-winner-name">{c.winner.name}</span>
            </div>
            <button className="btn ghost xs">Open</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Leaderboard({ rows, scoring }) {
  return (
    <section className="ch-section">
      <header className="ch-section-head">
        <h3>Leaderboard</h3>
        <span className="muted small">
          1st · {scoring.first} pts &nbsp;·&nbsp;
          2nd · {scoring.second} pts &nbsp;·&nbsp;
          3rd · {scoring.third} pts &nbsp;·&nbsp;
          Entry · {scoring.entry} pts
        </span>
      </header>
      <div className="ch-table-wrap">
        <table className="ch-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Designer</th>
              <th>Entries</th>
              <th>1st</th>
              <th>2nd</th>
              <th>3rd</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className={r.rank <= 3 ? "ch-row-top" : ""}>
                <td className="ch-rank">{r.rank}.</td>
                <td>
                  <div className="ch-cell-designer">
                    <Avatar name={r.name} color={r.avatar} size={28} />
                    <span>{r.name}</span>
                  </div>
                </td>
                <td>{r.entries}</td>
                <td>{r.first || "—"}</td>
                <td>{r.second || "—"}</td>
                <td>{r.third || "—"}</td>
                <td className="ch-points">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatsStrip({ data }) {
  const totalChallenges = 3 + 1;
  const totalEntries = data.leaderboard.reduce((s, r) => s + r.entries, 0);
  const activeDesigners = data.designers.filter((d) => d.status === "active").length;
  const totalEntryRows = data.leaderboard.length * totalChallenges;
  const participation = Math.round(100 * totalEntries / Math.max(1, totalEntryRows));
  const uniqueWinners = new Set(data.previous.map((p) => p.winner.name)).size;
  const avg = (totalEntries / totalChallenges).toFixed(1);

  const items = [
    { label: "Total challenges", value: totalChallenges },
    { label: "Total entries", value: totalEntries },
    { label: "Active designers", value: activeDesigners },
    { label: "Participation", value: participation + "%" },
    { label: "Avg entries / challenge", value: avg },
    { label: "Unique winners", value: uniqueWinners },
  ];
  return (
    <section className="ch-stats">
      {items.map((s) => (
        <div key={s.label} className="ch-stat">
          <div className="ch-stat-num">{s.value}</div>
          <div className="ch-stat-label">{s.label}</div>
        </div>
      ))}
    </section>
  );
}

function DesignerRoster({ designers }) {
  const active = designers.filter((d) => d.status === "active");
  const former = designers.filter((d) => d.status === "former");
  return (
    <section className="ch-section">
      <header className="ch-section-head">
        <h3>Active designers</h3>
        <span className="muted small">{active.length} participants</span>
      </header>
      <div className="ch-roster">
        {active.map((d) => (
          <article key={d.name} className="ch-designer">
            <div className="ch-designer-head">
              <Avatar name={d.name} color={d.avatar} size={44} />
              <div>
                <div className="ch-designer-name">
                  {d.name}
                  {d.trophies && d.trophies.map((y) => (
                    <span key={y} className="ch-trophy" title={"Designer of the year " + y}>🏆 {y}</span>
                  ))}
                </div>
                <div className="ch-designer-meta">{d.location} · Since {d.since}</div>
              </div>
            </div>
            <dl className="ch-designer-stats">
              <div><dt>Entries</dt><dd>{d.entries}</dd></div>
              <div><dt>Wins</dt><dd>{d.wins}</dd></div>
              <div><dt>Participation</dt><dd>{d.participation}%</dd></div>
            </dl>
          </article>
        ))}
      </div>

      {former.length > 0 && (
        <>
          <header className="ch-section-head ch-section-head-sub">
            <h4 className="ch-subhead">Former designers</h4>
          </header>
          <div className="ch-roster">
            {former.map((d) => (
              <article key={d.name} className="ch-designer ch-designer-former">
                <div className="ch-designer-head">
                  <Avatar name={d.name} color={d.avatar} size={44} />
                  <div>
                    <div className="ch-designer-name">{d.name}</div>
                    <div className="ch-designer-meta">{d.location}</div>
                  </div>
                </div>
                <dl className="ch-designer-stats">
                  <div><dt>Entries</dt><dd>{d.entries}</dd></div>
                  <div><dt>Wins</dt><dd>{d.wins}</dd></div>
                  <div><dt>Participation</dt><dd>{d.participation}%</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function Marquee() {
  const phrase = "GLOBAL PRODUCT EXPERIENCE TEAM · ";
  return (
    <div className="ch-marquee" aria-hidden="true">
      <div className="ch-marquee-track">
        {Array(8).fill(0).map((_, i) => <span key={i}>{phrase}</span>)}
      </div>
    </div>
  );
}

export function ChallengesPage() {
  const data = CHALLENGES;
  return (
    <main className="page ch-page">
      <section className="hero compact">
        <div className="hero-eyebrow"><span className="dot-pulse" /> Monthly design challenge</div>
        <h1 className="hero-title">
          A new <span className="hl">creative brief</span> every month.
        </h1>
        <p className="hero-sub">
          Internal design challenges to try new ideas, learn by doing, and explore what
          Figma and other tools have to offer. One challenge a month — submit, vote, repeat.
        </p>
      </section>

      <ActiveChallengeCard challenge={data.active} />
      <PreviousChallenges items={data.previous} />
      <Leaderboard rows={data.leaderboard} scoring={data.scoring} />
      <StatsStrip data={data} />
      <Marquee />
      <DesignerRoster designers={data.designers} />

      <section className="ch-tldr">
        <h4 className="kicker">About</h4>
        <p>
          We started doing internal Figma challenges with our team, and they've grown into
          all kinds of creative projects beyond Figma. It's a fun way for everyone to try
          new ideas, learn by doing, and explore what Figma and other tools have to offer.
        </p>
      </section>
    </main>
  );
}
