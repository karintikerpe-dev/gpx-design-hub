import { useState } from 'react';
import { useAuth } from './Shell.jsx';
import { brandFromInitials } from './utils.js';
import { PROMPTS } from './data.js';

const TOOL_COLORS = {
  "Claude": "#FF6B35",
  "Claude Code": "#FF6B35",
  "ChatGPT": "#01963A",
  "Gemini": "#0070F3",
  "Cursor": "#7A4CFF",
  "Other": "#0B0F0C",
};

function PromptCard({ p, onOpen, onCopy, copied, canDelete, onDelete }) {
  return (
    <article className="prompt-card" onClick={() => onOpen(p)}>
      <div className="prompt-head">
        <span className="tool-tag" style={{ "--c": TOOL_COLORS[p.tool] || "#0B0F0C" }}>{p.tool}</span>
        <span className="prompt-cat">{p.category}</span>
      </div>
      <h3 className="prompt-title">{p.title}</h3>
      <pre className="prompt-snippet">{p.body}</pre>
      <div className="prompt-tags">
        {p.tags.map((t) => <span key={t} className="tag-mini">#{t}</span>)}
      </div>
      <div className="prompt-foot">
        <span className="prompt-author">
          <span className="avatar tiny" style={{ background: brandFromInitials(p.authorInitials) }}>{p.authorInitials}</span>
          {p.author}
        </span>
        <span className="muted xs">★ {p.favorites}</span>
        {canDelete && (
          <button className="btn ghost xs danger" title="Delete prompt"
            onClick={(e) => { e.stopPropagation();
              if (confirm(`Delete "${p.title}"?`)) onDelete(p.id);
            }}>Delete</button>
        )}
        <button className="btn copy-btn sm" onClick={(e) => { e.stopPropagation(); onCopy(p); }}>
          {copied === p.id ? "✓ Copied" : "Copy"}
        </button>
      </div>
    </article>
  );
}

function PromptModal({ p, onClose, onCopy, copied, canDelete, onDelete }) {
  if (!p) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-eyebrow">
              <span className="tool-tag" style={{ "--c": TOOL_COLORS[p.tool] || "#0B0F0C" }}>{p.tool}</span>
              <span className="muted small">{p.category}</span>
            </div>
            <h3>{p.title}</h3>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {canDelete && (
              <button className="btn ghost sm danger"
                onClick={() => {
                  if (confirm(`Delete "${p.title}"?`)) { onDelete(p.id); onClose(); }
                }}>Delete</button>
            )}
            <button className="iconbtn" onClick={onClose} aria-label="Close">×</button>
          </div>
        </div>
        <div className="modal-body">
          <div className="field">
            <div className="field-label-row">
              <span className="field-label">Prompt</span>
              <button className="btn copy-btn sm" onClick={() => onCopy(p)}>
                {copied === p.id ? "✓ Copied" : "Copy prompt"}
              </button>
            </div>
            <pre className="prompt-full">{p.body}</pre>
          </div>
          {p.notes && (
            <div className="field">
              <span className="field-label">Notes from {p.author.split(" ")[0]}</span>
              <p className="notes">{p.notes}</p>
            </div>
          )}
          <div className="field">
            <span className="field-label">Tags</span>
            <div className="prompt-tags">
              {p.tags.map((t) => <span key={t} className="tag-mini">#{t}</span>)}
            </div>
          </div>
          <div className="field-row">
            <div>
              <span className="field-label">Author</span>
              <div className="prompt-author" style={{ marginTop: 6 }}>
                <span className="avatar small" style={{ background: brandFromInitials(p.authorInitials) }}>{p.authorInitials}</span>
                {p.author}
              </div>
            </div>
            <div>
              <span className="field-label">Added</span>
              <p style={{ marginTop: 6 }}>{p.date}</p>
            </div>
            <div>
              <span className="field-label">Saves</span>
              <p style={{ marginTop: 6 }}>★ {p.favorites}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewPromptModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "", body: "", tool: "Claude", category: "Audit", tags: "", notes: "",
  });
  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = form.title.trim() && form.body.trim();
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>Share a prompt</h3>
            <p className="muted small">Add a prompt that's worked well for you.</p>
          </div>
          <button className="iconbtn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <label className="field">
            <span className="field-label">Title</span>
            <input type="text" placeholder="e.g. Generate accessibility audit checklist" value={form.title} onChange={upd("title")}/>
          </label>
          <label className="field">
            <span className="field-label">Prompt</span>
            <textarea rows={7} placeholder="Paste the exact prompt you used…" value={form.body} onChange={upd("body")}/>
          </label>
          <div className="field-row">
            <label className="field">
              <span className="field-label">Tool</span>
              <select value={form.tool} onChange={upd("tool")}>
                {Object.keys(TOOL_COLORS).map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Category</span>
              <select value={form.category} onChange={upd("category")}>
                {["Audit","Storytelling","Copy","Exploration","Engineering","Facilitation","Research"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
          </div>
          <label className="field">
            <span className="field-label">Tags <span className="muted xs">(comma separated)</span></span>
            <input type="text" placeholder="accessibility, wcag, review" value={form.tags} onChange={upd("tags")}/>
          </label>
          <label className="field">
            <span className="field-label">Notes <span className="muted xs">(optional — tips for using it)</span></span>
            <textarea rows={3} placeholder="What works best, gotchas, etc." value={form.notes} onChange={upd("notes")}/>
          </label>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={!valid} onClick={() => onSubmit(form)}>Share prompt</button>
        </div>
      </div>
    </div>
  );
}

export function PromptsPage() {
  const { user, setLoginOpen } = useAuth();
  const [prompts, setPrompts] = useState(() => {
    try {
      const stored = localStorage.getItem("gpx_prompts");
      if (stored) return JSON.parse(stored);
    } catch {}
    return PROMPTS;
  });

  const [q, setQ] = useState("");
  const [tool, setTool] = useState("All");
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState(null);
  const [composing, setComposing] = useState(false);
  const [copied, setCopied] = useState(null);

  // Persist prompts whenever they change
  const persistPrompts = (next) => {
    setPrompts(next);
    try { localStorage.setItem("gpx_prompts", JSON.stringify(next)); }
    catch (err) { console.warn("Could not persist prompts:", err); }
  };

  const tools = ["All", ...new Set(prompts.map((p) => p.tool))];
  const cats = ["All", ...new Set(prompts.map((p) => p.category))];

  const filtered = prompts.filter((p) => {
    if (tool !== "All" && p.tool !== tool) return false;
    if (cat !== "All" && p.category !== cat) return false;
    if (q) {
      const ql = q.toLowerCase();
      const blob = (p.title + " " + p.body + " " + p.tags.join(" ") + " " + p.author).toLowerCase();
      if (!blob.includes(ql)) return false;
    }
    return true;
  });

  const handleCopy = (p) => {
    navigator.clipboard?.writeText(p.body);
    setCopied(p.id);
    setTimeout(() => setCopied((c) => c === p.id ? null : c), 1600);
  };

  const canDelete = user?.name === "Karin Tikerpe";
  const handleDelete = (id) => {
    persistPrompts(prompts.filter((p) => p.id !== id));
  };

  const handleSubmit = (form) => {
    const newP = {
      id: "p" + (Date.now()),
      title: form.title,
      body: form.body,
      tool: form.tool,
      category: form.category,
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      author: user?.name || "You",
      authorInitials: user?.initials || "YOU",
      date: new Date().toLocaleDateString("en-US",{month:"short", day:"2-digit", year:"numeric"}),
      notes: form.notes,
      favorites: 0,
    };
    persistPrompts([newP, ...prompts]);
    setComposing(false);
  };

  return (
    <main className="page">
      <section className="hero compact">
        <div className="hero-eyebrow"><span className="dot-pulse"/> {prompts.length} prompts shared by the team</div>
        <h1 className="hero-title">Prompts that <span className="hl">actually work.</span></h1>
        <p className="hero-sub">
          A growing library of prompts the team has battle-tested. Steal them. Share yours.
        </p>
      </section>

      <div className="prompt-toolbar">
        <div className="search">
          <span className="search-icon">⌕</span>
          <input type="text" placeholder="Search prompts, tags, authors…" value={q} onChange={(e) => setQ(e.target.value)}/>
          {q && <button className="iconbtn" onClick={() => setQ("")}>×</button>}
        </div>
        <div className="filter-group">
          <span className="filter-label">Tool</span>
          <div className="filter-pills">
            {tools.map((t) => (
              <button key={t} className={"chip" + (tool === t ? " active" : "")} onClick={() => setTool(t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">Category</span>
          <div className="filter-pills">
            {cats.map((c) => (
              <button key={c} className={"chip" + (cat === c ? " active" : "")} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        </div>
        <button className="btn primary" onClick={() => user ? setComposing(true) : setLoginOpen(true)}>
          + Share a prompt
        </button>
      </div>

      <div className="prompt-results-meta">
        <span className="muted small">{filtered.length} {filtered.length === 1 ? "prompt" : "prompts"}</span>
        {(q || tool !== "All" || cat !== "All") && (
          <button className="btn ghost xs" onClick={() => { setQ(""); setTool("All"); setCat("All"); }}>Clear filters</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <p>No prompts match. Try clearing filters.</p>
        </div>
      ) : (
        <div className="prompt-grid">
          {filtered.map((p) => (
            <PromptCard key={p.id} p={p} onOpen={setOpen} onCopy={handleCopy} copied={copied}
              canDelete={canDelete} onDelete={handleDelete}/>
          ))}
        </div>
      )}

      {open && <PromptModal p={open} onClose={() => setOpen(null)} onCopy={handleCopy} copied={copied}
        canDelete={canDelete} onDelete={handleDelete}/>}
      {composing && <NewPromptModal onClose={() => setComposing(false)} onSubmit={handleSubmit}/>}
    </main>
  );
}
