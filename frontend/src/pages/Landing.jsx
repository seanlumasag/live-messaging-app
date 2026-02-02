import '../App.css'

function Landing() {
  return (
    <div className="landing">
      <header className="site-header">
        <div className="logo">LiveChat</div>
        <nav className="nav-links">
          <a href="/auth">Sign in</a>
          <a className="btn primary" href="/auth">Get started</a>
        </nav>
      </header>

      <main className="hero">
        <div className="hero-text">
          <h1>Live messaging, organized in one place.</h1>
          <p>
            Keep group rooms and 1:1s clean, fast, and always live. LiveChat is
            built for teams that need fast, clear communication.
          </p>
          <div className="hero-actions">
            <a className="btn primary" href="/auth">Get started</a>
            <a className="btn outline" href="/auth">Sign in</a>
          </div>
        </div>

        <div className="hero-card">
          <div className="card-header">
            <span># product-launch</span>
            <span className="pill">Live</span>
          </div>
          <div className="card-body">
            <div className="card-row">
              <div className="avatar">AL</div>
              <div>
                <p className="card-name">Alicia</p>
                <p className="card-text">Onboarding copy is ready to review.</p>
              </div>
            </div>
            <div className="card-row">
              <div className="avatar muted">ME</div>
              <div>
                <p className="card-name">You</p>
                <p className="card-text">Perfect, I will publish it today.</p>
              </div>
            </div>
          </div>
          <div className="card-footer">Message #product-launch</div>
        </div>
      </main>
    </div>
  )
}

export default Landing
