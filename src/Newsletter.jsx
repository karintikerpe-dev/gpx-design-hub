import { useState } from 'react';
import { useAuth } from './Shell.jsx';
import { brandFromInitials } from './utils.js';

export function CoverPattern({ kind, dark }) {
  const stroke = dark ? "rgba(255,255,255,.55)" : "rgba(11,15,12,.45)";
  const fill = dark ? "rgba(255,255,255,.18)" : "rgba(11,15,12,.12)";
  switch (kind) {
    case "grid":
      return (
        <svg className="pat" viewBox="0 0 200 120" preserveAspectRatio="none">
          <defs>
            <pattern id="g1" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0 H0 V20" fill="none" stroke={stroke} strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="200" height="120" fill="url(#g1)"/>
          <circle cx="160" cy="90" r="42" fill="none" stroke={stroke} strokeWidth="1.2"/>
          <circle cx="160" cy="90" r="22" fill={fill}/>
        </svg>
      );
    case "stripes":
      return (
        <svg className="pat" viewBox="0 0 200 120" preserveAspectRatio="none">
          {[0,1,2,3,4,5,6].map((i) => (
            <rect key={i} x={i*30 - 10} y="-20" width="14" height="180" fill={fill} transform={`rotate(18 ${i*30} 60)`}/>
          ))}
        </svg>
      );
    case "dots":
      return (
        <svg className="pat" viewBox="0 0 200 120" preserveAspectRatio="none">
          <defs>
            <pattern id="d1" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.4" fill={stroke}/>
            </pattern>
          </defs>
          <rect width="200" height="120" fill="url(#d1)"/>
        </svg>
      );
    case "confetti":
      return (
        <svg className="pat" viewBox="0 0 200 120" preserveAspectRatio="none">
          {Array.from({length: 22}).map((_,i) => {
            const x = (i*73) % 200, y = (i*49) % 120, r = (i*31)%360;
            const colors = ["#0B0F0C","#FF8AE6","#7A4CFF","#FFD23F","#0070F3"];
            return <rect key={i} x={x} y={y} width="14" height="4" fill={colors[i%colors.length]} transform={`rotate(${r} ${x+7} ${y+2})`}/>;
          })}
        </svg>
      );
    case "blob":
      return (
        <svg className="pat" viewBox="0 0 200 120" preserveAspectRatio="none">
          <ellipse cx="60" cy="40" rx="80" ry="50" fill="rgba(255,255,255,.3)"/>
          <ellipse cx="160" cy="90" rx="50" ry="40" fill="rgba(255,255,255,.2)"/>
        </svg>
      );
    case "ring":
      return (
        <svg className="pat" viewBox="0 0 200 120" preserveAspectRatio="none">
          <circle cx="100" cy="60" r="50" fill="none" stroke={stroke} strokeWidth="1"/>
          <circle cx="100" cy="60" r="35" fill="none" stroke={stroke} strokeWidth="1"/>
          <circle cx="100" cy="60" r="20" fill="none" stroke={stroke} strokeWidth="1"/>
          <circle cx="100" cy="60" r="6" fill={stroke}/>
        </svg>
      );
    case "code":
      return (
        <svg className="pat" viewBox="0 0 200 120" preserveAspectRatio="none">
          {Array.from({length: 10}).map((_,i) => (
            <rect key={i} x="20" y={10 + i*10} width={40 + (i*37)%120} height="3" fill={fill}/>
          ))}
        </svg>
      );
    case "scribble":
      return (
        <svg className="pat" viewBox="0 0 200 120" preserveAspectRatio="none">
          <path d="M10 90 Q 40 40, 70 70 T 130 60 T 190 80" fill="none" stroke={stroke} strokeWidth="2"/>
          <path d="M10 30 Q 40 10, 70 30 T 130 20 T 190 40" fill="none" stroke={stroke} strokeWidth="2"/>
        </svg>
      );
    case "lines":
      return (
        <svg className="pat" viewBox="0 0 200 120" preserveAspectRatio="none">
          {[0,1,2,3,4].map((i) => (
            <line key={i} x1="-10" y1={i*30} x2="210" y2={i*30 - 60} stroke="rgba(255,255,255,.35)" strokeWidth="1"/>
          ))}
        </svg>
      );
    default:
      return null;
  }
}

export function CoverArt({ article }) {
  const { cover, coverPattern, category } = article;
  if (cover && cover.startsWith("image:")) {
    const src = cover.slice("image:".length);
    return (
      <div className="cover-art cover-image">
        <img src={src} alt=""/>
        <span className="cover-cat">{category}</span>
      </div>
    );
  }
  const isGradient = cover && cover.startsWith("linear-gradient");
  const bg = cover || "#3AFF3E";
  const isDark = !isGradient && (() => {
    if (!bg.startsWith("#")) return false;
    const c = bg.slice(1);
    const v = c.length === 3
      ? [c[0]+c[0], c[1]+c[1], c[2]+c[2]]
      : [c.slice(0,2), c.slice(2,4), c.slice(4,6)];
    const [r,g,b] = v.map((x) => parseInt(x, 16));
    return (0.299*r + 0.587*g + 0.114*b) < 128;
  })();
  const isGreenSrc = bg === "#3AFF3E" || (isGradient && bg.includes("#3AFF3E"));
  return (
    <div className={"cover-art p-" + coverPattern + (isDark ? " dark" : "") + (isGreenSrc ? " green" : "")}
         style={{ background: bg }}>
      <span className="cover-cat">{category}</span>
      <CoverPattern kind={coverPattern} dark={isDark}/>
    </div>
  );
}

export function ArticleCard({ a, size, onOpen }) {
  const handle = (e) => { if (onOpen) { e.preventDefault(); onOpen(a.id); } };
  return (
    <a href={"#article/" + a.id} className={"art-card size-" + size} onClick={handle}>
      <CoverArt article={a}/>
      <div className="art-body">
        <h3 className="art-title">{a.title}</h3>
        {size !== "xs" && <p className="art-dek">{a.dek}</p>}
        <div className="art-meta">
          <span className="avatar tiny" style={{ background: brandFromInitials(a.authorInitials) }}>{a.authorInitials}</span>
          <span className="meta-name">{a.author}</span>
          <span className="meta-dot">·</span>
          <span className="muted">{a.date}</span>
          <span className="meta-dot">·</span>
          <span className="muted">{a.readTime}</span>
        </div>
      </div>
    </a>
  );
}

function NewArticleModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "", dek: "", category: "Case Study", body: "", readTime: "5 min",
    cover: "#3AFF3E", coverPattern: "grid",
  });
  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = form.title.trim() && form.dek.trim();
  const colors = [
    {label:"Nortal Green", v:"#3AFF3E"},
    {label:"Deep Green", v:"linear-gradient(135deg,#3AFF3E 0%,#01963A 70%,#003E18 100%)"},
    {label:"Ink", v:"#0B0F0C"},
    {label:"Paper", v:"#FAF6E8"},
    {label:"Sun", v:"#FFD23F"},
    {label:"Pink", v:"#FF8AE6"},
    {label:"Violet", v:"linear-gradient(135deg,#FF8AE6 0%,#7A4CFF 100%)"},
    {label:"Blue", v:"#0070F3"},
  ];
  const patterns = ["grid","stripes","dots","confetti","blob","ring","code","scribble","lines"];
  const preview = {
    category: form.category, cover: form.cover, coverPattern: form.coverPattern,
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>Write an article</h3>
            <p className="muted small">Share what you've been working on with the team.</p>
          </div>
          <button className="iconbtn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <div style={{borderRadius:14, overflow:"hidden"}}>
            <CoverArt article={preview}/>
          </div>
          <label className="field"><span className="field-label">Title</span>
            <input value={form.title} onChange={upd("title")} placeholder="e.g. How we cut onboarding from 14 steps to 4"/></label>
          <label className="field"><span className="field-label">Summary</span>
            <textarea rows={2} value={form.dek} onChange={upd("dek")} placeholder="One or two sentences — the hook."/></label>
          <div className="field-row">
            <label className="field"><span className="field-label">Category</span>
              <select value={form.category} onChange={upd("category")}>
                {["Case Study","Tool Experiment","Process","Team News","Learning"].map(c => <option key={c}>{c}</option>)}
              </select></label>
            <label className="field"><span className="field-label">Read time</span>
              <select value={form.readTime} onChange={upd("readTime")}>
                {["2 min","4 min","5 min","7 min","10 min","12 min"].map(c => <option key={c}>{c}</option>)}
              </select></label>
          </div>
          <label className="field"><span className="field-label">Body <span className="muted xs">(optional draft)</span></span>
            <textarea rows={6} value={form.body} onChange={upd("body")} placeholder="Write your article here… you can save and finish later."/></label>
          <div className="field">
            <span className="field-label">Cover color</span>
            <div className="swatch-row">
              {colors.map(c => (
                <button key={c.label} type="button" title={c.label}
                  className={"swatch" + (form.cover === c.v ? " active" : "")}
                  style={{background: c.v}}
                  onClick={() => setForm({...form, cover: c.v})}/>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="field-label">Cover pattern</span>
            <div className="filter-pills">
              {patterns.map(p => (
                <button key={p} type="button"
                  className={"chip" + (form.coverPattern === p ? " active" : "")}
                  onClick={() => setForm({...form, coverPattern: p})}>{p}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!valid} onClick={() => onSubmit(form)}>Publish</button>
        </div>
      </div>
    </div>
  );
}

export function NewsletterPage({ layout, articles, onAdd, onOpen }) {
  const { user, setLoginOpen } = useAuth();
  const [filter, setFilter] = useState("All");
  const [composing, setComposing] = useState(false);
  const cats = ["All", ...new Set(articles.map((a) => a.category))];
  const filtered = filter === "All" ? articles : articles.filter((a) => a.category === filter);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  const handlePublish = (form) => {
    const newA = {
      id: "a" + Date.now(),
      kind: "standard",
      category: form.category,
      title: form.title,
      dek: form.dek,
      author: user?.name || "You",
      authorInitials: user?.initials || "YOU",
      date: new Date().toLocaleDateString("en-US",{month:"short", day:"2-digit", year:"numeric"}),
      readTime: form.readTime,
      cover: form.cover,
      coverPattern: form.coverPattern,
      tags: [form.category],
      body: form.body,
    };
    onAdd(newA);
    setComposing(false);
    onOpen && onOpen(newA.id);
  };

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="dot-pulse"/> Issue 14 · April 2026
        </div>
        <h1 className="hero-title">
          What the <span className="hl">design team</span> has been up to.
        </h1>
        <p className="hero-sub">
          Case studies, experiments, recaps, and the occasional half-baked thought.
          Internal-only — share inside Nortal freely.
        </p>
        <div className="hero-actions">
          {user ? (
            <button className="btn primary" onClick={() => setComposing(true)}>+ Write an article</button>
          ) : (
            <button className="btn primary" onClick={() => setLoginOpen(true)}>Sign in to contribute</button>
          )}
          <button className="btn ghost">Subscribe to digest</button>
        </div>
      </section>

      <div className="filters">
        {cats.map((c) => (
          <button key={c} className={"chip" + (filter === c ? " active" : "")} onClick={() => setFilter(c)}>
            {c} {c !== "All" && <span className="chip-count">{articles.filter((a) => a.category === c).length}</span>}
          </button>
        ))}
      </div>

      {layout === "magazine" && (
        <div className="layout-magazine">
          {featured && (
            <a href={"#article/" + featured.id} className="feat"
               onClick={(e) => { e.preventDefault(); onOpen(featured.id); }}>
              <CoverArt article={featured}/>
              <div className="feat-body">
                <span className="kicker">Featured · {featured.category}</span>
                <h2>{featured.title}</h2>
                <p>{featured.dek}</p>
                <div className="art-meta">
                  <span className="avatar small" style={{ background: brandFromInitials(featured.authorInitials) }}>{featured.authorInitials}</span>
                  <span className="meta-name">{featured.author}</span>
                  <span className="meta-dot">·</span>
                  <span className="muted">{featured.date} · {featured.readTime}</span>
                </div>
              </div>
            </a>
          )}
          <div className="grid-3">
            {rest.map((a) => <ArticleCard key={a.id} a={a} size="md" onOpen={onOpen}/>)}
          </div>
        </div>
      )}

      {layout === "bento" && (
        <div className="layout-bento">
          {filtered.map((a, i) => {
            const sizes = ["xl","md","md","sm","sm","md","sm","md","sm","sm"];
            return <ArticleCard key={a.id} a={a} size={sizes[i] || "sm"} onOpen={onOpen}/>;
          })}
        </div>
      )}

      {layout === "uniform" && (
        <div className="grid-3">
          {filtered.map((a) => <ArticleCard key={a.id} a={a} size="md" onOpen={onOpen}/>)}
        </div>
      )}

      {layout === "feed" && (
        <div className="layout-feed">
          {filtered.map((a) => (
            <a key={a.id} href={"#article/" + a.id} className="feed-item"
               onClick={(e) => { e.preventDefault(); onOpen(a.id); }}>
              <CoverArt article={a}/>
              <div className="feed-body">
                <span className="kicker">{a.category}</span>
                <h3>{a.title}</h3>
                <p>{a.dek}</p>
                <div className="art-meta">
                  <span className="avatar tiny" style={{ background: brandFromInitials(a.authorInitials) }}>{a.authorInitials}</span>
                  <span className="meta-name">{a.author}</span>
                  <span className="meta-dot">·</span>
                  <span className="muted">{a.date} · {a.readTime}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
      {composing && <NewArticleModal onClose={() => setComposing(false)} onSubmit={handlePublish}/>}
    </main>
  );
}
