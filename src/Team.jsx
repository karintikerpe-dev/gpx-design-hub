import { useState, useEffect } from 'react';
import { useAuth } from './Shell.jsx';
import { TEAM as TEAM_DATA } from './data.js';
import { supabase } from './supabase.js';

function formatTenure(joinedDate, fallback) {
  if (!joinedDate) return fallback || "—";
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(joinedDate);
  let start;
  if (m) {
    start = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3] || 1));
  } else {
    start = new Date(joinedDate);
  }
  if (isNaN(start)) return fallback || "—";
  const now = new Date();
  if (start > now) return "Starts " + start.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  if (now.getDate() < start.getDate()) months -= 1;
  if (months < 0) { years -= 1; months += 12; }
  const y = years + " " + (years === 1 ? "year" : "years");
  const mo = months + " " + (months === 1 ? "month" : "months");
  return y + " " + mo;
}

function PhotoArt({ seed }) {
  let h = 0;
  for (const c of seed) h = h * 131 + c.charCodeAt(0) >>> 0;
  const shapes = h % 3;
  return (
    <svg className="tc-photo-art" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {shapes === 0 && <>
        <circle cx="100" cy="220" r="120" fill="rgba(11,15,12,.18)" />
        <circle cx="60" cy="50" r="30" fill="rgba(255,255,255,.35)" />
      </>}
      {shapes === 1 && <>
        <path d="M0 200 Q 100 100 200 200 Z" fill="rgba(11,15,12,.18)" />
        <circle cx="155" cy="50" r="22" fill="rgba(255,255,255,.4)" />
      </>}
      {shapes === 2 && <>
        <rect x="30" y="120" width="140" height="200" rx="60" fill="rgba(11,15,12,.18)" />
        <circle cx="40" cy="160" r="14" fill="rgba(255,255,255,.4)" />
      </>}
    </svg>
  );
}

function TeamCard({ member, style, isMe, onEdit }) {
  const introExtra = member.introExtra;
  const introLabel = introExtra < 35 ? "More introvert" : introExtra > 65 ? "More extravert" : "Ambivert";
  return (
    <article className={"team-card style-" + style + (isMe ? " is-me" : "")}>
      {isMe && <button className="edit-pill" onClick={() => onEdit(member)}>✎ Edit my card</button>}
      <div className="tc-photo" style={{ background: member.avatar }}>
        {member.photo
          ? <img src={member.photo} alt={member.name} className="tc-photo-img" />
          : <><span className="tc-monogram">{member.initials}</span><PhotoArt seed={member.id} /></>
        }
      </div>
      <div className="tc-body">
        <div className="tc-head">
          <h3>{member.name}</h3>
          <p className="tc-role">{member.role}</p>
        </div>
        <dl className="tc-facts">
          <div>
            <dt>Office</dt>
            <dd>{member.office} · {member.officeFreq}%</dd>
          </div>
          <div>
            <dt>At Nortal</dt>
            <dd>{formatTenure(member.joinedDate, member.joined)}</dd>
          </div>
          <div>
            <dt>Hobbies</dt>
            <dd>{member.hobbies.join(" · ")}</dd>
          </div>
          <div>
            <dt>Fun fact</dt>
            <dd>{member.funFact}</dd>
          </div>
          <div>
            <dt>Reach me</dt>
            <dd>{member.contact}</dd>
          </div>
        </dl>
        <div className="tc-slider">
          <div className="tc-slider-labels">
            <span>Introvert</span>
            <span className="tc-slider-state">{introLabel}</span>
            <span>Extravert</span>
          </div>
          <div className="tc-slider-track">
            <div className="tc-slider-fill" style={{ width: introExtra + "%" }} />
            <div className="tc-slider-thumb" style={{ left: introExtra + "%" }} />
          </div>
        </div>
      </div>
    </article>
  );
}

function EditCardModal({ member, onClose, onSave }) {
  const [form, setForm] = useState({ ...member, hobbies: member.hobbies.join(", ") });
  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = () => onSave({
    ...form,
    hobbies: form.hobbies.split(",").map((s) => s.trim()).filter(Boolean),
    officeFreq: Number(form.officeFreq),
    introExtra: Number(form.introExtra)
  });
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>Edit your card</h3>
            <p className="muted small">Changes save instantly to your card.</p>
          </div>
          <button className="iconbtn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <div className="field-row">
            <label className="field"><span className="field-label">Name</span>
              <input value={form.name} onChange={upd("name")} /></label>
            <label className="field"><span className="field-label">Role</span>
              <input value={form.role} onChange={upd("role")} /></label>
          </div>
          <div className="field-row">
            <label className="field"><span className="field-label">Office</span>
              <input value={form.office} onChange={upd("office")} /></label>
            <label className="field"><span className="field-label">Office frequency: {form.officeFreq}%</span>
              <input type="range" min="0" max="100" step="5" value={form.officeFreq} onChange={upd("officeFreq")} /></label>
          </div>
          <label className="field"><span className="field-label">Joined Nortal</span>
            <input type="month" value={form.joinedDate ? form.joinedDate.slice(0, 7) : ""} onChange={upd("joinedDate")} />
            <span className="muted xs" style={{ marginTop: 4 }}>
              {form.joinedDate ? "Shows as \"" + formatTenure(form.joinedDate) + "\" on your card" : "Pick a date — your card will show how long you've been at Nortal"}
            </span>
          </label>
          <label className="field"><span className="field-label">Hobbies <span className="muted xs">(comma separated)</span></span>
            <input value={form.hobbies} onChange={upd("hobbies")} /></label>
          <label className="field"><span className="field-label">Fun fact</span>
            <textarea rows={2} value={form.funFact} onChange={upd("funFact")} /></label>
          <label className="field"><span className="field-label">Reach me</span>
            <input value={form.contact} onChange={upd("contact")} /></label>
          <label className="field">
            <span className="field-label">Personality: {form.introExtra < 35 ? "More introvert" : form.introExtra > 65 ? "More extravert" : "Ambivert"} ({form.introExtra})</span>
            <input type="range" min="0" max="100" value={form.introExtra} onChange={upd("introExtra")} />
            <div className="range-tags"><span>Introvert</span><span>Extravert</span></div>
          </label>
          <label className="field">
            <span className="field-label">Card color</span>
            <div className="swatch-row">
              {["#3AFF3E", "#01963A", "#FFD23F", "#FF8AE6", "#7A4CFF", "#0070F3", "#FF6B35", "#003E18"].map((c) =>
                <button key={c} type="button"
                  className={"swatch" + (form.avatar === c ? " active" : "")}
                  style={{ background: c }}
                  onClick={() => setForm({ ...form, avatar: c })} />
              )}
            </div>
          </label>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={save}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

export function TeamPage({ cardStyle }) {
  const { user } = useAuth();
  const [team, setTeam] = useState(TEAM_DATA);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    supabase.from('team_members').select('id, section, data')
      .then(({ data, error }) => {
        if (error) return;
        if (data.length === 0) {
          const rows = Object.entries(TEAM_DATA).flatMap(([section, members]) =>
            members.map(m => ({ id: m.id, section, data: m }))
          );
          supabase.from('team_members').upsert(rows);
        } else {
          const grouped = {};
          for (const section of Object.keys(TEAM_DATA)) {
            const members = data.filter(r => r.section === section).map(r => r.data);
            if (members.length) grouped[section] = members;
          }
          setTeam(grouped);
        }
      });
  }, []);

  const handleSave = async (updated) => {
    let section = null;
    for (const [s, members] of Object.entries(team)) {
      if (members.find(m => m.id === updated.id)) { section = s; break; }
    }
    await supabase.from('team_members').upsert({ id: updated.id, section, data: updated });
    const next = {};
    for (const [s, members] of Object.entries(team)) {
      next[s] = members.map((m) => m.id === updated.id ? updated : m);
    }
    setTeam(next);
    setEditing(null);
  };

  const total = Object.values(team).flat().length;

  return (
    <main className="page">
      <section className="hero compact">
        <div className="hero-eyebrow"><span className="dot-pulse" /> {total} designers · {Object.keys(team).length} disciplines</div>
        <h1 className="hero-title">The <span className="hl">people</span> behind it all.</h1>
        <p className="hero-sub">Service designers, product designers, UI engineers</p>
      </section>

      {Object.entries(team).map(([section, members]) => (
        <section key={section} className="team-section">
          <header className="team-section-head">
            <h2>{section}</h2>
            <span className="muted">{members.length} {members.length === 1 ? "person" : "people"}</span>
          </header>
          <div className="team-grid">
            {members.map((m) => (
              <TeamCard key={m.id} member={m} style={cardStyle}
                isMe={user?.id === m.id}
                onEdit={setEditing} />
            ))}
          </div>
        </section>
      ))}

      {editing && <EditCardModal member={editing} onClose={() => setEditing(null)} onSave={handleSave} />}
    </main>
  );
}
