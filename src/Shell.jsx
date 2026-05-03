import { createContext, useContext, useState } from 'react';
import { TEAM } from './data.js';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("gpx_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loginOpen, setLoginOpen] = useState(false);

  const signIn = (memberId) => {
    const allMembers = Object.values(TEAM).flat();
    const m = allMembers.find((x) => x.id === memberId) || allMembers[0];
    const next = { id: m.id, name: m.name, initials: m.initials, avatar: m.avatar };
    localStorage.setItem("gpx_user", JSON.stringify(next));
    setUser(next);
    setLoginOpen(false);
  };
  const signOut = () => {
    localStorage.removeItem("gpx_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loginOpen, setLoginOpen }}>
      {children}
      {loginOpen && <LoginModal />}
    </AuthContext.Provider>
  );
}

function LoginModal() {
  const { signIn, setLoginOpen } = useAuth();
  const allMembers = Object.values(TEAM).flat();
  const [picked, setPicked] = useState(allMembers[0].id);
  return (
    <div className="modal-backdrop" onClick={() => setLoginOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>Sign in</h3>
            <p className="muted small">Internal demo — pick a teammate to sign in as.</p>
          </div>
          <button className="iconbtn" onClick={() => setLoginOpen(false)} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <label className="field">
            <span className="field-label">Sign in as</span>
            <select value={picked} onChange={(e) => setPicked(e.target.value)}>
              {Object.entries(TEAM).map(([section, members]) => (
                <optgroup key={section} label={section}>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <p className="muted xs">In production this would be Microsoft SSO via your nortal.com account.</p>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={() => setLoginOpen(false)}>Cancel</button>
          <button className="btn primary" onClick={() => signIn(picked)}>Sign in</button>
        </div>
      </div>
    </div>
  );
}

export function Logo({ size = 28 }) {
  return (
    <span className="logo" style={{ fontSize: size }}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect x="2" y="2" width="28" height="28" rx="6" fill="var(--brand)"/>
        <path d="M9 23 V9 H13 L19 18 V9 H23 V23 H19 L13 14 V23 Z" fill="#0B0F0C"/>
      </svg>
      <span className="logo-text">
        <b>GPX</b><span className="muted">/ Design</span>
      </span>
    </span>
  );
}

export function TopNav({ page, onNav }) {
  const { user, signOut, setLoginOpen } = useAuth();
  return (
    <header className="topnav">
      <div className="topnav-inner">
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); onNav("newsletter"); }}>
          <Logo />
        </a>
        <nav className="nav-links">
          {[
            { id: "newsletter", label: "Newsletter" },
            { id: "challenges", label: "Design Challenge" },
            { id: "prompts", label: "Prompt Library" },
            { id: "team", label: "Team" },
          ].map((n) => (
            <a key={n.id} href="#" className={"nav-link" + (page === n.id ? " active" : "")}
               onClick={(e) => { e.preventDefault(); onNav(n.id); }}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="nav-right">
          {user ? (
            <div className="user-chip">
              <span className="avatar small" style={{ background: user.avatar }}>{user.initials}</span>
              <span className="user-name">{user.name.split(" ")[0]}</span>
              <button className="iconbtn" onClick={signOut} title="Sign out">⎋</button>
            </div>
          ) : (
            <button className="btn primary sm" onClick={() => setLoginOpen(true)}>Sign in</button>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <Logo size={22}/>
          <p className="muted small" style={{ marginTop: 8 }}>
            Internal hub for Nortal's Global Product Experience design team.
          </p>
        </div>
        <div className="footer-cols">
          <div>
            <h5>Hub</h5>
            <a href="#">Newsletter</a>
            <a href="#">Prompt library</a>
            <a href="#">Team</a>
          </div>
          <div>
            <h5>Resources</h5>
            <a href="#">Brand guidelines</a>
            <a href="#">Design system</a>
            <a href="#">Templates</a>
          </div>
          <div>
            <h5>Get in touch</h5>
            <a href="#">#design-team on Slack</a>
            <a href="#">design@nortal.com</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="muted small">© 2026 Nortal · Made by the design team, for the design team.</span>
      </div>
    </footer>
  );
}
