import React from "react";
import { useState } from 'react';
import {
  ArrowRight, ArrowUpRight, BrainCircuit, Check, ChevronDown, Clock3,
  Code2, Compass, Cpu, Layers3, Lightbulb, LoaderCircle, Rocket,
  Sparkles, Target, WandSparkles, Zap
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const domains = [
  'Artificial Intelligence', 'Data Science', 'Web Development',
  'Cloud Computing', 'Cybersecurity', 'Internet of Things',
  'Mobile App Development', 'Blockchain', 'Computer Vision', 'Other'
];

const timeOptions = ['1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months'];

function Header({ onHome, onGenerate }) {
  return (
    <header className="site-header">
      <button className="brand" onClick={onHome} aria-label="IdeaForge home">
        <span className="brand-mark"><WandSparkles size={19} /></span>
        <span>idea<span className="brand-accent">forge</span></span>
      </button>
      <nav className="nav-links">
        <button onClick={onHome}>Home</button>
        <a href="#how-it-works">How it works</a>
        <button className="nav-cta" onClick={onGenerate}>Create ideas <ArrowUpRight size={15} /></button>
      </nav>
    </header>
  );
}

function IdeaCard({ idea, index }) {
  const [expanded, setExpanded] = useState(false);
  const difficultyClass = idea.difficulty.toLowerCase();
  return (
    <article className="idea-card">
      <div className="idea-card-top">
        <span className="idea-number">0{index + 1}</span>
        <span className={`difficulty ${difficultyClass}`}>{idea.difficulty}</span>
      </div>
      <h3>{idea.title}</h3>
      <p className="idea-description">{idea.description}</p>
      <div className="idea-meta"><Clock3 size={15} /> Estimated duration: {idea.estimated_duration}</div>
      <div className="card-section">
        <h4><Code2 size={15} /> Technologies</h4>
        <div className="tag-list">{idea.technologies.map((item) => <span className="tag" key={item}>{item}</span>)}</div>
      </div>
      {expanded && <div className="expanded-details">
        <div className="card-section">
          <h4><Target size={15} /> Problem statement</h4>
          <p>{idea.problem_statement}</p>
        </div>
        <div className="card-section">
          <h4><Layers3 size={15} /> Main modules</h4>
          <ul>{idea.modules.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="card-section">
          <h4><Zap size={15} /> Key features</h4>
          <ul>{idea.key_features.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </div>}
      <button className="details-button" onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Show less' : 'View project details'} <ChevronDown className={expanded ? 'rotate' : ''} size={16} />
      </button>
    </article>
  );
}

export default function App() {
  const [page, setPage] = useState('home');
  const [domain, setDomain] = useState('Artificial Intelligence');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [availableTime, setAvailableTime] = useState('1 month');
  const [interests, setInterests] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openGenerator = () => {
    setPage('generator');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function generateIdeas(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setIdeas([]);
    try {
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, skillLevel, availableTime, interests })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to generate ideas. Please try again.');
      setIdeas(data.ideas || []);
      setPage('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Could not connect to the backend. Make sure Flask is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <Header onHome={goHome} onGenerate={openGenerator} />
      <main>
        {page === 'home' && <>
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow"><span className="pulse-dot" /> YOUR NEXT BIG IDEA STARTS HERE</div>
              <h1>Turn your skills into<br /><span className="gradient-text">something brilliant.</span></h1>
              <p className="hero-subtitle">Stop staring at a blank page. Get project ideas tailored to your interests, skill level, and timeline — powered by AI.</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={openGenerator}>Generate project ideas <ArrowRight size={18} /></button>
                <a className="text-link" href="#how-it-works">See how it works <ArrowUpRight size={16} /></a>
              </div>
              <div className="hero-proof"><div className="proof-icon"><Sparkles size={15} /></div><span>Personalised ideas</span><span className="proof-divider" /><span>Built for students</span></div>
            </div>
            <div className="hero-visual" aria-label="AI project idea illustration">
              <div className="orbit orbit-one" /><div className="orbit orbit-two" />
              <div className="visual-glow" />
              <div className="floating-chip chip-top"><BrainCircuit size={16} /> AI-powered</div>
              <div className="visual-core"><div className="core-inner"><Lightbulb size={53} strokeWidth={1.35} /></div></div>
              <div className="floating-chip chip-bottom"><Sparkles size={15} /> Ideas, made for you</div>
              <span className="spark spark-a">✳</span><span className="spark spark-b">✦</span><span className="spark spark-c">✧</span>
            </div>
          </section>

          <section className="feature-strip" aria-label="Website benefits">
            <div className="feature-item"><span className="feature-icon purple"><Target size={19} /></span><div><strong>Made for your goals</strong><small>Ideas that fit your direction</small></div></div>
            <div className="feature-item"><span className="feature-icon blue"><Cpu size={19} /></span><div><strong>AI-powered suggestions</strong><small>Fresh ideas in seconds</small></div></div>
            <div className="feature-item"><span className="feature-icon pink"><Rocket size={19} /></span><div><strong>Clear starting points</strong><small>Tools, modules and features</small></div></div>
          </section>

          <section className="how-section" id="how-it-works">
            <div className="section-heading"><span className="section-kicker">SIMPLE BY DESIGN</span><h2>From “what should I build?”<br /><span className="muted-gradient">to “let's build this.”</span></h2><p>Three quick steps to find a project worth working on.</p></div>
            <div className="steps-grid">
              <div className="step-card"><span className="step-index">01</span><div className="step-icon"><Compass size={23} /></div><h3>Tell us about you</h3><p>Choose your domain, current skill level, and how much time you have.</p></div>
              <div className="step-card"><span className="step-index">02</span><div className="step-icon"><BrainCircuit size={23} /></div><h3>Let AI brainstorm</h3><p>Our AI uses your preferences to create five relevant project concepts.</p></div>
              <div className="step-card"><span className="step-index">03</span><div className="step-icon"><Rocket size={23} /></div><h3>Pick your next build</h3><p>Explore the tools, modules, features, and difficulty for every idea.</p></div>
            </div>
            <div className="bottom-cta"><div><span className="section-kicker">READY WHEN YOU ARE</span><h3>Your next project is one click away.</h3></div><button className="primary-button" onClick={openGenerator}>Find my project <ArrowRight size={17} /></button></div>
          </section>
        </>}

        {page === 'generator' && <section className="form-page">
          <button className="back-link" onClick={goHome}>← Back to home</button>
          <div className="form-heading"><span className="section-kicker"><Sparkles size={13} /> PERSONALISE YOUR SEARCH</span><h1>Let's find your <span className="gradient-text">next project.</span></h1><p>A few details help us generate ideas that actually fit you.</p></div>
          <form className="generator-form" onSubmit={generateIdeas}>
            <div className="form-group"><label htmlFor="domain">What domain interests you?</label><select id="domain" value={domain} onChange={(e) => setDomain(e.target.value)}>{domains.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div className="form-group"><label>What's your current skill level?</label><div className="choice-grid">{['Beginner', 'Intermediate', 'Advanced'].map((level) => <button type="button" key={level} className={`choice-card ${skillLevel === level ? 'selected' : ''}`} onClick={() => setSkillLevel(level)}><span className="choice-check">{skillLevel === level && <Check size={13} />}</span><strong>{level}</strong><small>{level === 'Beginner' ? 'I am learning the basics' : level === 'Intermediate' ? 'I can build projects already' : 'I am ready for a challenge'}</small></button>)}</div></div>
            <div className="form-group"><label htmlFor="time">How much time can you spend?</label><select id="time" value={availableTime} onChange={(e) => setAvailableTime(e.target.value)}>{timeOptions.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div className="form-group"><label htmlFor="interests">Any interests or preferred tools? <span className="optional">OPTIONAL</span></label><textarea id="interests" rows="3" maxLength="500" placeholder="e.g. Python, React, healthcare, solving campus problems..." value={interests} onChange={(e) => setInterests(e.target.value)} /></div>
            {error && <div className="error-message" role="alert">{error}</div>}
            <button className="primary-button submit-button" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={18} /> Generating your ideas...</> : <>Generate 5 project ideas <Sparkles size={17} /></>}</button>
            <p className="form-note">Your preferences are sent to the AI service to generate suggestions.</p>
          </form>
        </section>}

        {page === 'results' && <section className="results-page">
          <button className="back-link" onClick={openGenerator}>← Edit preferences</button>
          <div className="results-heading"><span className="section-kicker"><Sparkles size={13} /> YOUR AI-GENERATED SHORTLIST</span><h1>Ideas worth <span className="gradient-text">bringing to life.</span></h1><p>Five concepts based on your preferences. Pick one and make it yours.</p></div>
          <div className="results-toolbar"><span><strong>{ideas.length} ideas</strong> generated for you</span><button className="outline-button" onClick={openGenerator}>Change preferences</button></div>
          <div className="ideas-grid">{ideas.map((idea, index) => <IdeaCard idea={idea} index={index} key={`${idea.title}-${index}`} />)}</div>
          <div className="results-footer"><div><Sparkles size={18} /><span>Not quite what you had in mind?</span></div><button className="primary-button" onClick={openGenerator}>Try different preferences <ArrowRight size={16} /></button></div>
        </section>}
      </main>
      <footer className="site-footer"><button className="brand footer-brand" onClick={goHome}><span className="brand-mark"><WandSparkles size={16} /></span><span>idea<span className="brand-accent">forge</span></span></button><span>Built to turn curiosity into projects.</span><span>© 2026 IdeaForge</span></footer>
    </div>
  );
}
