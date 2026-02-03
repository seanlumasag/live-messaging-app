function Dashboard() {
  return (
    <div className="dashboard">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <span className="chat-logo">LM</span>
          <div>
            <p className="chat-app">LiveChat</p>
            <span className="chat-subtitle">Rooms</span>
          </div>
        </div>

        <div className="chat-room-list">
          {[
            ['General', '2 new', true],
            ['Product feedback', 'New reply', false],
            ['Billing', '1 new', false],
            ['Bug reports', 'Pending', false],
            ['VIP customers', 'Active', false],
          ].map(([name, note, active]) => (
            <button
              className={`chat-room ${active ? 'active' : ''}`}
              type="button"
              key={name}
            >
              <div>
                <p>{name}</p>
                <span>{note}</span>
              </div>
              <span className="chat-room-pill">●</span>
            </button>
          ))}
        </div>

        <button className="chat-new" type="button">New room</button>
      </aside>

      <main className="chat-panel">
        <header className="chat-panel-header">
          <div>
            <h1>General</h1>
            <span>12 members · 3 online</span>
          </div>
          <button className="btn primary" type="button">Invite</button>
        </header>

        <div className="chat-thread">
          <div className="chat-bubble incoming">
            <p>Morning! Pushing a small hotfix in 10.</p>
            <span>09:12</span>
          </div>
          <div className="chat-bubble incoming">
            <p>Can support watch for any new tickets?</p>
            <span>09:13</span>
          </div>
          <div className="chat-bubble outgoing">
            <p>On it. We’ll keep the queue light and report here.</p>
            <span>09:15</span>
          </div>
        </div>

        <div className="chat-compose">
          <input placeholder="Message #general" />
          <button className="btn primary" type="button">Send</button>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
