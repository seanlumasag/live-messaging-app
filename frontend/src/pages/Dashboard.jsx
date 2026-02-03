function Dashboard() {
  return (
    <div className="dashboard">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <span className="dash-logo">LM</span>
          <div>
            <p className="dash-title">Live Messaging</p>
            <span className="dash-subtitle">Customer HQ</span>
          </div>
        </div>

        <nav className="dash-nav">
          <button className="dash-nav-item active" type="button">
            Inbox
            <span className="dash-badge">14</span>
          </button>
          <button className="dash-nav-item" type="button">Priority</button>
          <button className="dash-nav-item" type="button">Team spaces</button>
          <button className="dash-nav-item" type="button">Saved replies</button>
          <button className="dash-nav-item" type="button">Reports</button>
        </nav>

        <div className="dash-team">
          <p className="dash-section">Assigned today</p>
          <div className="dash-people">
            <div className="dash-person">
              <span className="dash-avatar">AL</span>
              <div>
                <p>Alex Lee</p>
                <span>5 open</span>
              </div>
            </div>
            <div className="dash-person">
              <span className="dash-avatar alt">MG</span>
              <div>
                <p>Mira Gomez</p>
                <span>2 escalations</span>
              </div>
            </div>
          </div>
        </div>

        <button className="dash-compose" type="button">Start new thread</button>

        <div className="dash-account">
          <span className="dash-avatar">SL</span>
          <div>
            <p>Sean L.</p>
            <span>Support Lead</span>
          </div>
        </div>
      </aside>

      <main className="dash-main">
        <header className="dash-header">
          <div>
            <p className="dash-kicker">Today, Feb 3</p>
            <h1>Inbox pulse</h1>
          </div>
          <div className="dash-actions">
            <label className="dash-search">
              <span>Search</span>
              <input placeholder="Customer name or keyword" />
            </label>
            <button className="btn primary" type="button">Create broadcast</button>
          </div>
        </header>

        <section className="dash-stats">
          <article>
            <p>Active conversations</p>
            <h2>32</h2>
            <span className="dash-trend up">+8% this week</span>
          </article>
          <article>
            <p>First response</p>
            <h2>3m 12s</h2>
            <span className="dash-trend down">-20s from yesterday</span>
          </article>
          <article>
            <p>CSAT</p>
            <h2>4.8</h2>
            <span className="dash-trend up">+0.3 since Jan</span>
          </article>
        </section>

        <section className="dash-grid">
          <div className="dash-inbox">
            <div className="dash-panel-head">
              <h3>Priority queue</h3>
              <button className="ghost" type="button">View all</button>
            </div>
            <div className="dash-threads">
              {[
                ['Nova Labs', 'Billing issue · 3 attachments', '2m ago', 'NL'],
                ['Dune Health', 'Integration error on webhook', '8m ago', 'DH'],
                ['Loop Studio', 'Refund request', '22m ago', 'LS'],
                ['Velvet Co.', 'Feature question: routing', '40m ago', 'VC'],
              ].map(([name, note, time, initials], index) => (
                <button className={`dash-thread ${index === 1 ? 'active' : ''}`} type="button" key={name}>
                  <span className="dash-avatar">{initials}</span>
                  <div>
                    <p>{name}</p>
                    <span>{note}</span>
                  </div>
                  <time>{time}</time>
                </button>
              ))}
            </div>
          </div>

          <div className="dash-convo">
            <div className="dash-panel-head">
              <div>
                <h3>Dune Health</h3>
                <span>Enterprise · 14 seats</span>
              </div>
              <button className="ghost" type="button">Assign</button>
            </div>
            <div className="dash-messages">
              <div className="dash-message incoming">
                <p>Hey team, our webhook is returning a 403 after the latest deploy.</p>
                <span>Mon 4:12 PM</span>
              </div>
              <div className="dash-message outgoing">
                <p>Thanks for the heads-up. Can you share the request ID from your logs?</p>
                <span>Mon 4:13 PM</span>
              </div>
              <div className="dash-message incoming">
                <p>Sure. Request ID `req_8f9c` and we see it across two environments.</p>
                <span>Mon 4:14 PM</span>
              </div>
            </div>
            <div className="dash-reply">
              <input placeholder="Write a reply, use / for shortcuts" />
              <button className="btn primary" type="button">Send</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Dashboard
