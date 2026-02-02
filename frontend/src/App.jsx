import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [backendStatus, setBackendStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8080/api/health')
      .then(response => response.json())
      .then(data => {
        setBackendStatus(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching backend status:', error)
        setBackendStatus({ status: 'DOWN', message: 'Backend not reachable' })
        setLoading(false)
      })
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Live Messaging App</h1>
      <h2>React + Vite + Spring Boot</h2>
      
      <div className="card">
        <h3>Backend Status</h3>
        {loading ? (
          <p>Checking backend...</p>
        ) : (
          <div>
            <p>Status: <strong>{backendStatus?.status}</strong></p>
            <p>{backendStatus?.message}</p>
          </div>
        )}
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
    </>
  )
}

export default App
