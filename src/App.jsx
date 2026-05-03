import { useState, useEffect } from 'react';
import { AuthProvider, TopNav, Footer } from './Shell.jsx';
import {
  useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakSelect, TweakRadio,
} from './TweaksPanel.jsx';
import { NewsletterPage } from './Newsletter.jsx';
import { ArticlePage } from './ArticlePage.jsx';
import { PromptsPage } from './Prompts.jsx';
import { TeamPage } from './Team.jsx';
import { ChallengesPage } from './Challenges.jsx';
import { ARTICLES } from './data.js';

const TWEAK_DEFAULTS = {
  newsletterLayout: "magazine",
  teamCardStyle: "default",
  dark: false,
};

function parseHash() {
  const raw = (location.hash || "").replace(/^#/, "");
  if (raw.startsWith("article/")) return { page: "article", articleId: raw.slice("article/".length) };
  if (["newsletter","prompts","team","challenges"].includes(raw)) return { page: raw, articleId: null };
  return { page: "newsletter", articleId: null };
}

export default function App() {
  const [route, setRoute] = useState(parseHash);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [articles, setArticles] = useState(() => {
    try {
      const stored = localStorage.getItem("gpx_articles");
      if (stored) return JSON.parse(stored);
    } catch {}
    return ARTICLES;
  });

  useEffect(() => {
    try { localStorage.setItem("gpx_articles", JSON.stringify(articles)); }
    catch (err) {
      console.warn("Could not persist articles (likely quota exceeded — images can be large):", err);
    }
  }, [articles]);

  const navTo = (page, articleId = null) => {
    if (page === "article" && articleId) {
      location.hash = "article/" + articleId;
    } else {
      location.hash = page;
    }
  };

  useEffect(() => {
    const onHash = () => { setRoute(parseHash()); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.dark ? "dark" : "light");
  }, [t.dark]);

  const { page, articleId } = route;
  const currentArticle = articleId ? articles.find(a => a.id === articleId) : null;
  const navPage = page === "article" ? "newsletter" : page;

  const updateArticle = (updated) => {
    setArticles(articles.map(a => a.id === updated.id ? updated : a));
  };
  const deleteArticle = (id) => {
    setArticles(articles.filter(a => a.id !== id));
    navTo("newsletter");
  };
  const addArticle = (newA) => {
    setArticles([newA, ...articles]);
  };

  return (
    <AuthProvider>
      <TopNav page={navPage} onNav={(p) => navTo(p)}/>
      {page === "article" && currentArticle && (
        <ArticlePage article={currentArticle}
          onBack={() => navTo("newsletter")}
          onUpdate={updateArticle}
          onDelete={deleteArticle}/>
      )}
      {page === "article" && !currentArticle && (
        <main className="page"><div className="empty-state">
          <h2>Article not found</h2>
          <button className="btn primary" onClick={() => navTo("newsletter")}>Back to newsletter</button>
        </div></main>
      )}
      {page === "newsletter" && <NewsletterPage layout={t.newsletterLayout}
        articles={articles} onAdd={addArticle}
        onOpen={(id) => navTo("article", id)}/>}
      {page === "prompts" && <PromptsPage/>}
      {page === "team" && <TeamPage cardStyle={t.teamCardStyle}/>}
      {page === "challenges" && <ChallengesPage/>}
      <Footer/>

      <TweaksPanel>
        <TweakSection label="Theme"/>
        <TweakToggle label="Dark mode" value={t.dark}
          onChange={(v) => setTweak("dark", v)}/>

        <TweakSection label="Newsletter"/>
        <TweakSelect label="Layout" value={t.newsletterLayout}
          options={[
            { value: "magazine", label: "Magazine — feature + grid" },
            { value: "bento",    label: "Bento — varied sizes" },
            { value: "uniform",  label: "Uniform — clean grid" },
            { value: "feed",     label: "Feed — vertical list" },
          ]}
          onChange={(v) => setTweak("newsletterLayout", v)}/>

        <TweakSection label="Team cards"/>
        <TweakRadio label="Card style" value={t.teamCardStyle}
          options={["default","bold","minimal","zine"]}
          onChange={(v) => setTweak("teamCardStyle", v)}/>
      </TweaksPanel>
    </AuthProvider>
  );
}
