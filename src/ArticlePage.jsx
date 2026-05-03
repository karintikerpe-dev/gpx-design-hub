import { useState, useEffect, useRef } from 'react';
import { useAuth } from './Shell.jsx';
import { brandFromInitials } from './utils.js';
import { CoverArt } from './Newsletter.jsx';

export function ArticlePage({ article, onBack, onUpdate, onDelete }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(!article.body && article.author === (user?.name || ""));
  const [draft, setDraft] = useState({
    title: article.title,
    dek: article.dek,
    category: article.category,
    body: article.body || "",
    readTime: article.readTime,
    cover: article.cover,
    coverPattern: article.coverPattern,
    images: article.images || [],
  });
  const fileRef = useRef(null);
  const coverFileRef = useRef(null);

  useEffect(() => {
    setDraft({
      title: article.title,
      dek: article.dek,
      category: article.category,
      body: article.body || "",
      readTime: article.readTime,
      cover: article.cover,
      coverPattern: article.coverPattern,
      images: article.images || [],
    });
  }, [article.id]);

  const isAuthor = user && (user.name === article.author || user.initials === article.authorInitials);

  const save = () => {
    onUpdate({ ...article, ...draft });
    setEditing(false);
  };
  const cancel = () => {
    setDraft({
      title: article.title,
      dek: article.dek,
      category: article.category,
      body: article.body || "",
      readTime: article.readTime,
      cover: article.cover,
      coverPattern: article.coverPattern,
      images: article.images || [],
    });
    setEditing(false);
  };

  const readAsDataURL = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImgs = await Promise.all(files.map(async (f) => ({
      src: await readAsDataURL(f),
      caption: "",
    })));
    setDraft({ ...draft, images: [...draft.images, ...newImgs] });
    e.target.value = "";
  };

  const handleCoverUpload = async (e) => {
    const f = (e.target.files || [])[0];
    if (!f) return;
    const src = await readAsDataURL(f);
    setDraft({ ...draft, cover: "image:" + src, coverPattern: "none" });
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setDraft({
      ...draft,
      images: draft.images.filter((_, i) => i !== idx),
    });
  };

  const updateCaption = (idx, caption) => {
    setDraft({
      ...draft,
      images: draft.images.map((img, i) => i === idx ? { ...img, caption } : img),
    });
  };

  const insertImageRef = (idx) => {
    const ref = `\n\n![${draft.images[idx].caption || ""}](img:${idx})\n\n`;
    setDraft({ ...draft, body: (draft.body || "") + ref });
  };

  const colors = [
    {label:"Nortal Green", v:"#3AFF3E"},
    {label:"Deep Green",   v:"linear-gradient(135deg,#3AFF3E 0%,#01963A 70%,#003E18 100%)"},
    {label:"Ink",          v:"#0B0F0C"},
    {label:"Paper",        v:"#FAF6E8"},
    {label:"Sun",          v:"#FFD23F"},
    {label:"Pink",         v:"#FF8AE6"},
    {label:"Violet",       v:"linear-gradient(135deg,#FF8AE6 0%,#7A4CFF 100%)"},
    {label:"Blue",         v:"#0070F3"},
  ];
  const patterns = ["grid","stripes","dots","confetti","blob","ring","code","scribble","lines"];

  const previewArt = editing ? { ...article, ...draft } : article;

  return (
    <main className="page article-page">
      <div className="article-toolbar">
        <button className="btn ghost sm" onClick={onBack}>← All articles</button>
        <div className="article-toolbar-right">
          {isAuthor && !editing && (
            <>
              <button className="btn ghost sm" onClick={() => setEditing(true)}>Edit</button>
              <button className="btn ghost sm danger" onClick={() => {
                if (confirm("Delete this article?")) onDelete(article.id);
              }}>Delete</button>
            </>
          )}
          {editing && (
            <>
              <button className="btn ghost sm" onClick={cancel}>Cancel</button>
              <button className="btn primary sm" onClick={save}>Save</button>
            </>
          )}
        </div>
      </div>

      <article className="article-body">
        <div className="article-cover">
          <CoverArt article={previewArt}/>
        </div>

        {editing ? (
          <div className="article-edit">
            <label className="field">
              <span className="field-label">Title</span>
              <input className="article-title-input" value={draft.title}
                onChange={(e) => setDraft({...draft, title: e.target.value})}/>
            </label>
            <label className="field">
              <span className="field-label">Summary / dek</span>
              <textarea rows={2} value={draft.dek}
                onChange={(e) => setDraft({...draft, dek: e.target.value})}/>
            </label>
            <div className="field-row">
              <label className="field">
                <span className="field-label">Category</span>
                <select value={draft.category}
                  onChange={(e) => setDraft({...draft, category: e.target.value})}>
                  {["Case Study","Tool Experiment","Process","Team News","Learning"].map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="field">
                <span className="field-label">Read time</span>
                <select value={draft.readTime}
                  onChange={(e) => setDraft({...draft, readTime: e.target.value})}>
                  {["2 min","4 min","5 min","7 min","10 min","12 min","15 min"].map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
            </div>
            <label className="field">
              <span className="field-label">
                Body
                <span className="muted xs"> · markdown-lite + image refs like ![caption](img:0) · links: [label](https://…) or paste a URL</span>
              </span>
              <textarea rows={20} className="article-body-input" value={draft.body}
                onChange={(e) => setDraft({...draft, body: e.target.value})}
                placeholder="Start writing…"/>
            </label>

            <div className="field">
              <div className="field-label-row">
                <span className="field-label">Images <span className="muted xs">({draft.images.length})</span></span>
                <button type="button" className="btn ghost xs" onClick={() => fileRef.current?.click()}>+ Add images</button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple
                style={{ display: "none" }} onChange={handleImageUpload}/>
              {draft.images.length > 0 && (
                <div className="image-manager">
                  {draft.images.map((img, i) => (
                    <div key={i} className="image-manager-row">
                      <div className="image-manager-thumb" style={{ backgroundImage: `url(${img.src})` }}>
                        <span className="image-ref-tag">img:{i}</span>
                      </div>
                      <div className="image-manager-meta">
                        <input type="text" placeholder="Caption (optional)" value={img.caption}
                          onChange={(e) => updateCaption(i, e.target.value)}/>
                        <div className="image-manager-actions">
                          <button type="button" className="btn ghost xs"
                            onClick={() => insertImageRef(i)}>Insert in body</button>
                          <button type="button" className="btn ghost xs danger"
                            onClick={() => removeImage(i)}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {draft.images.length === 0 && (
                <p className="muted small" style={{ margin: 0 }}>
                  No images yet. Add some above, then drop them inline with <code>![caption](img:0)</code> or let unreferenced ones sit in a gallery at the end.
                </p>
              )}
            </div>

            <div className="field">
              <div className="field-label-row">
                <span className="field-label">Cover</span>
                <button type="button" className="btn ghost xs" onClick={() => coverFileRef.current?.click()}>Upload cover image</button>
              </div>
              <input ref={coverFileRef} type="file" accept="image/*"
                style={{ display: "none" }} onChange={handleCoverUpload}/>
            </div>
            <div className="field">
              <span className="field-label">Cover color</span>
              <div className="swatch-row">
                {colors.map(c => (
                  <button key={c.label} type="button" title={c.label}
                    className={"swatch" + (draft.cover === c.v ? " active" : "")}
                    style={{background: c.v}}
                    onClick={() => setDraft({...draft, cover: c.v})}/>
                ))}
              </div>
            </div>
            <div className="field">
              <span className="field-label">Cover pattern</span>
              <div className="filter-pills">
                {patterns.map(p => (
                  <button key={p} type="button"
                    className={"chip" + (draft.coverPattern === p ? " active" : "")}
                    onClick={() => setDraft({...draft, coverPattern: p})}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="article-read">
            <div className="article-kicker">{article.category} · {article.readTime}</div>
            <h1 className="article-title">{article.title}</h1>
            <p className="article-dek">{article.dek}</p>
            <div className="article-byline">
              <span className="avatar small" style={{ background: brandFromInitials(article.authorInitials) }}>
                {article.authorInitials}
              </span>
              <div>
                <div className="byline-name">{article.author}</div>
                <div className="muted small">{article.date}</div>
              </div>
            </div>

            <div className="article-prose">
              <RenderProse text={article.body} images={article.images || []}/>
            </div>

            {(() => {
              const imgs = article.images || [];
              const usedRefs = new Set();
              const re = /!\[[^\]]*\]\(img:(\d+)\)/g;
              let m;
              while ((m = re.exec(article.body || "")) !== null) usedRefs.add(Number(m[1]));
              const unused = imgs.map((img, i) => ({...img, i})).filter(x => !usedRefs.has(x.i));
              if (unused.length === 0) return null;
              return (
                <div className="article-gallery">
                  <h2>Gallery</h2>
                  <div className="article-gallery-grid">
                    {unused.map(img => (
                      <figure key={img.i}>
                        <img src={img.src} alt={img.caption || ""}/>
                        {img.caption && <figcaption>{img.caption}</figcaption>}
                      </figure>
                    ))}
                  </div>
                </div>
              );
            })()}

            {article.tags && article.tags.length > 0 && (
              <div className="article-tags">
                {article.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            )}
          </div>
        )}
      </article>
    </main>
  );
}

function RenderProse({ text, images = [] }) {
  if (!text || !text.trim()) {
    return <p className="muted article-empty">This article doesn't have a body yet. {" "}
      <em>Click Edit to start writing.</em>
    </p>;
  }
  const lines = text.replace(/\r/g, "").split("\n");
  const blocks = [];
  let buf = [];
  let kind = "p";
  const flush = () => {
    if (!buf.length) return;
    if (kind === "ul") {
      blocks.push(<ul key={blocks.length}>{buf.map((b,i) => <li key={i}>{inline(b.replace(/^[-*•][\s\t]*/, ""))}</li>)}</ul>);
    } else if (kind === "blockquote") {
      blocks.push(<blockquote key={blocks.length}>{buf.map((b,i) => <p key={i}>{inline(b.replace(/^>\s?/, ""))}</p>)}</blockquote>);
    } else {
      blocks.push(<p key={blocks.length}>{inline(buf.join(" "))}</p>);
    }
    buf = [];
  };
  const imgRe = /^!\[([^\]]*)\]\(img:(\d+)\)\s*$/;
  for (const raw of lines) {
    const line = raw.replace(/^[\s\t]+/, "");
    if (!line.trim()) { flush(); kind = "p"; continue; }
    const im = imgRe.exec(line.trim());
    if (im) {
      flush();
      const idx = Number(im[2]);
      const img = images[idx];
      if (img) {
        blocks.push(
          <figure key={blocks.length} className="article-figure">
            <img src={img.src} alt={im[1] || img.caption || ""}/>
            {(im[1] || img.caption) && <figcaption>{im[1] || img.caption}</figcaption>}
          </figure>
        );
      }
      continue;
    }
    if (/^##\s+/.test(line)) { flush(); blocks.push(<h2 key={blocks.length}>{inline(line.replace(/^##\s+/, ""))}</h2>); continue; }
    if (/^###\s+/.test(line)) { flush(); blocks.push(<h3 key={blocks.length}>{inline(line.replace(/^###\s+/, ""))}</h3>); continue; }
    if (/^>\s?/.test(line)) {
      if (kind !== "blockquote") flush();
      kind = "blockquote"; buf.push(line); continue;
    }
    if (/^[-*•]\s*/.test(line)) {
      if (kind !== "ul") flush();
      kind = "ul"; buf.push(line); continue;
    }
    if (/^[-*•]\s.+\s[-*•]\s/.test(line.trim())) {
      flush();
      const items = line.trim().split(/\s+[-*•]\s+/).filter(Boolean);
      items[0] = items[0].replace(/^[-*•]\s+/, "");
      blocks.push(<ul key={blocks.length}>{items.map((it,i) => <li key={i}>{inline(it)}</li>)}</ul>);
      kind = "p";
      continue;
    }
    if (kind !== "p") flush();
    kind = "p"; buf.push(line);
  }
  flush();
  return <>{blocks}</>;
}

function inline(s) {
  const parts = [];
  let rest = s;
  let key = 0;
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.-]+)/;
  const safeUrl = (u) => {
    const lower = u.toLowerCase().trim();
    if (lower.startsWith("javascript:") || lower.startsWith("data:")) return "#";
    return u;
  };
  while (rest) {
    const m = re.exec(rest);
    if (!m) { parts.push(rest); break; }
    if (m.index > 0) parts.push(rest.slice(0, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      parts.push(<strong key={"k"+(key++)}>{tok.slice(2,-2)}</strong>);
    } else if (tok.startsWith("`")) {
      parts.push(<code key={"k"+(key++)}>{tok.slice(1,-1)}</code>);
    } else if (tok.startsWith("[")) {
      const close = tok.indexOf("](");
      const label = tok.slice(1, close);
      const url = tok.slice(close + 2, -1);
      parts.push(
        <a key={"k"+(key++)} className="prose-link"
           href={safeUrl(url)} target="_blank" rel="noopener noreferrer">
          {inline(label)}
        </a>
      );
    } else if (/^https?:\/\//i.test(tok)) {
      parts.push(
        <a key={"k"+(key++)} className="prose-link"
           href={safeUrl(tok)} target="_blank" rel="noopener noreferrer">
          {tok.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
        </a>
      );
    } else if (tok.includes("@")) {
      parts.push(
        <a key={"k"+(key++)} className="prose-link" href={"mailto:" + tok}>{tok}</a>
      );
    } else if (tok.startsWith("*")) {
      parts.push(<em key={"k"+(key++)}>{tok.slice(1,-1)}</em>);
    } else {
      parts.push(tok);
    }
    rest = rest.slice(m.index + tok.length);
  }
  return parts;
}
