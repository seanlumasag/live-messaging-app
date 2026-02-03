import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'

const initialMessages = []

function buildWsUrl(baseUrl) {
  if (!baseUrl) {
    return 'ws://localhost:8080/ws'
  }

  if (baseUrl.startsWith('https://')) {
    return baseUrl.replace('https://', 'wss://') + '/ws'
  }

  if (baseUrl.startsWith('http://')) {
    return baseUrl.replace('http://', 'ws://') + '/ws'
  }

  return baseUrl.replace(/\/$/, '') + '/ws'
}

function Dashboard() {
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const [rooms, setRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [roomsError, setRoomsError] = useState('')
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState('')
  const [sendError, setSendError] = useState('')
  const [wsConnected, setWsConnected] = useState(false)
  const clientRef = useRef(null)
  const authToken = localStorage.getItem('auth_token')
  const authUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('auth_user') || 'null')
    } catch (error) {
      return null
    }
  })()
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

  useEffect(() => {
    const loadRooms = async () => {
      if (!authToken) {
        return
      }

      setRoomsLoading(true)
      setRoomsError('')
      try {
        const response = await fetch(`${apiBaseUrl}/api/rooms`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })

        if (!response.ok) {
          throw new Error('Unable to load rooms')
        }

        let data = await response.json()

        if (data.length === 0) {
          const defaultName = 'general'
          const joinResponse = await fetch(`${apiBaseUrl}/api/rooms/join`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: defaultName }),
          })

          if (!joinResponse.ok) {
            const createResponse = await fetch(`${apiBaseUrl}/api/rooms`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: defaultName }),
            })

            if (createResponse.ok) {
              const created = await createResponse.json()
              data = [created]
            } else {
              const refresh = await fetch(`${apiBaseUrl}/api/rooms`, {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              })
              if (refresh.ok) {
                data = await refresh.json()
              }
            }
          } else {
            const refresh = await fetch(`${apiBaseUrl}/api/rooms`, {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            })
            if (refresh.ok) {
              data = await refresh.json()
            }
          }
        }

        setRooms(data)
        setActiveRoom((current) => current || data[0] || null)
      } catch (error) {
        setRoomsError(error.message || 'Unable to load rooms')
      } finally {
        setRoomsLoading(false)
      }
    }

    loadRooms()
  }, [apiBaseUrl, authToken])

  useEffect(() => {
    const wsUrl = buildWsUrl(import.meta.env.VITE_API_BASE_URL)
    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 4000,
      connectHeaders: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      onConnect: () => {
        setWsConnected(true)
      },
      onDisconnect: () => {
        setWsConnected(false)
      },
      onStompError: () => {
        setWsConnected(false)
        setMessagesError('Realtime connection failed')
      },
    })

    client.activate()
    clientRef.current = client

    return () => client.deactivate()
  }, [])

  useEffect(() => {
    if (!wsConnected || !clientRef.current || !activeRoom?.name) {
      return
    }

    const subscription = clientRef.current.subscribe(
      `/topic/rooms/${encodeURIComponent(activeRoom.name)}`,
      (frame) => {
        const payload = JSON.parse(frame.body)
        setMessages((prev) => [...prev, payload])
      }
    )

    return () => subscription.unsubscribe()
  }, [activeRoom, wsConnected])

  useEffect(() => {
    const loadMessages = async () => {
      if (!authToken || !activeRoom?.id) {
        return
      }

      setMessagesLoading(true)
      setMessagesError('')
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/rooms/${activeRoom.id}/messages?limit=50`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error('Unable to load messages')
        }

        const data = await response.json()
        setMessages(data)
      } catch (error) {
        setMessagesError(error.message || 'Unable to load messages')
        setMessages([])
      } finally {
        setMessagesLoading(false)
      }
    }

    loadMessages()
  }, [activeRoom, apiBaseUrl, authToken])

  const sendMessage = () => {
    const content = draft.trim()
    const senderEmail = authUser?.email
    setSendError('')
    if (!senderEmail) {
      setSendError('Sign in to send messages.')
      return
    }
    if (!activeRoom?.name || !activeRoom?.id) {
      setSendError('Select or create a room first.')
      return
    }
    if (!content) {
      return
    }

    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: `/app/rooms/${encodeURIComponent(activeRoom.name)}/send`,
        body: JSON.stringify({
          roomId: activeRoom.name,
          sender: senderEmail,
          content,
        }),
      })
    } else if (authToken) {
      fetch(`${apiBaseUrl}/api/rooms/${activeRoom.id}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('Unable to send message')
          }
          const saved = await response.json()
          setMessages((prev) => [...prev, saved])
          setSendError('Realtime disconnected. Message saved.')
        })
        .catch((error) => {
          setSendError(error.message || 'Unable to send message')
        })
    } else {
      setSendError('Realtime not connected.')
      return
    }

    setDraft('')
  }

  const createRoom = async () => {
    if (!authToken) {
      return
    }

    const name = window.prompt('Room name?')
    if (!name || !name.trim()) {
      return
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/rooms`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (!response.ok) {
        throw new Error('Unable to create room')
      }

      const created = await response.json()
      setRooms((prev) => [...prev, created])
      setActiveRoom(created)
    } catch (error) {
      setRoomsError(error.message || 'Unable to create room')
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage()
    }
  }

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
          {roomsLoading && <span className="chat-room-pill">Loading...</span>}
          {roomsError && <span className="chat-room-pill">{roomsError}</span>}
          {rooms.map((room) => (
            <button
              className={`chat-room ${activeRoom?.id === room.id ? 'active' : ''}`}
              type="button"
              key={room.id}
              onClick={() => setActiveRoom(room)}
            >
              <div>
                <p>{room.name}</p>
              </div>
              <span className="chat-room-pill">●</span>
            </button>
          ))}
        </div>

        <button className="chat-new" type="button" onClick={createRoom}>New room</button>
      </aside>

      <main className="chat-panel">
        <header className="chat-panel-header">
          <div>
            <h1>{activeRoom?.name || 'Room'}</h1>
          </div>
          <button className="btn primary" type="button">Invite</button>
        </header>

        <div className="chat-thread">
          {messagesLoading && <span className="chat-room-pill">Loading...</span>}
          {messagesError && <span className="chat-room-pill">{messagesError}</span>}
          {sendError && <span className="chat-room-pill">{sendError}</span>}
          {messages.map((message, index) => {
            const isOutgoing = message.sender === authUser?.displayName
            const timestamp = message.timestamp
              ? new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''

            return (
              <div
                className={`chat-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`}
                key={`${message.timestamp || index}-${index}`}
              >
                <p>{message.content}</p>
                <span>{timestamp}</span>
              </div>
            )
          })}
        </div>

        <div className="chat-compose">
          <input
            placeholder="Message #general"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="btn primary" type="button" onClick={sendMessage}>
            Send
          </button>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
