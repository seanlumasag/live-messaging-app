import './App.css'

function App() {
  return (
    <div className="landing">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark">Pulse</span>
          <span className="brand-sub">Live Messaging</span>
        </div>
        <nav className="nav-actions">
          <a className="nav-link" href="/auth">Sign in</a>
          <a className="btn primary" href="/auth">Get started</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Realtime chat for focused teams</p>
            <h1>Keep every conversation moving at the speed of your work.</h1>
            <p className="lead">
              Pulse is a lightweight group and 1:1 messaging space designed for
              shipping fast. Simple onboarding, crisp threads, and instant delivery.
            </p>
            <div className="cta-row">
              <a className="btn primary" href="/auth">Start chatting</a>
              <button className="btn ghost" type="button">View demo</button>
            </div>
            <div className="hero-stats">
              <div>
                <p className="stat-value">&lt;200ms</p>
                <p className="stat-label">Message delivery</p>
              </div>
              <div>
                <p className="stat-value">Zero noise</p>
                <p className="stat-label">Curated rooms</p>
              </div>
              <div>
                <p className="stat-value">Built for MVPs</p>
                <p className="stat-label">Fast setup</p>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-header">
              <span className="panel-pill"># launch-room</span>
              <span className="panel-pill muted">4 members</span>
            </div>
            <div className="panel-body">
              <div className="message incoming">
                <p className="message-author">Ari</p>
                <p>We need a clean onboarding flow by Friday.</p>
                <span className="message-time">9:41 AM</span>
              </div>
              <div className="message outgoing">
                <p className="message-author">You</p>
                <p>Copy. I will ship the new auth screens tonight.</p>
                <span className="message-time">9:42 AM</span>
              </div>
              <div className="message incoming">
                <p className="message-author">Jordan</p>
                <p>Room updates are live. Want a review link?</p>
                <span className="message-time">9:43 AM</span>
              </div>
              <div className="composer">
                <span>Message #launch-room</span>
                <div className="composer-actions">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="section-header">
            <h2>Everything you need for a tight MVP</h2>
            <p>Focused features that show real-time collaboration without the bloat.</p>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Group rooms</h3>
              <p>Create channels for launches, handoffs, or support loops in seconds.</p>
            </div>
            <div className="feature-card">
              <h3>Direct messages</h3>
              <p>Spin up 1:1 threads for quick decisions and approvals.</p>
            </div>
            <div className="feature-card">
              <h3>Instant delivery</h3>
              <p>Live WebSocket events keep the timeline updated across devices.</p>
            </div>
          </div>
        </section>

        <section className="steps">
          <div className="section-header">
            <h2>Launch-ready in three steps</h2>
            <p>Designed so your portfolio demo is clear and fast.</p>
          </div>
          <div className="step-grid">
            <div className="step">
              <span className="step-index">01</span>
              <h3>Create your account</h3>
              <p>Sign up with email and set your display name.</p>
            </div>
            <div className="step">
              <span className="step-index">02</span>
              <h3>Start a room</h3>
              <p>Invite teammates and organize chats instantly.</p>
            </div>
            <div className="step">
              <span className="step-index">03</span>
              <h3>Ship faster</h3>
              <p>Stay in sync with live updates and structured history.</p>
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div>
            <h2>Showcase real-time collaboration</h2>
            <p>Deploy in minutes on your stack and share a polished demo.</p>
          </div>
          <a className="btn secondary" href="/auth">Create your workspace</a>
        </section>
      </main>

      <footer className="site-footer">
        <p>Pulse MVP · React + Spring Boot · WebSockets</p>
      </footer>
    </div>
  )
}

export default App
