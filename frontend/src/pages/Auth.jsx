import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import '../App.css'

function Auth() {
  const location = useLocation()
  const [mode, setMode] = useState('signin')
  const isSignup = mode === 'signup'

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const view = params.get('mode')
    if (view === 'signup' || view === 'signin') {
      setMode(view)
    }
  }, [location.search])

  const toggleMode = (event) => {
    event.preventDefault()
    setMode(isSignup ? 'signin' : 'signup')
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <a className="auth-back" href="/">← Back to home</a>

        <div className="auth-card">
          <div className="auth-brand">
            <span className="auth-logo">LC</span>
            <span>LiveChat</span>
          </div>

          <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p>
            {isSignup
              ? 'Start a workspace in seconds and invite your team.'
              : 'Sign in to keep conversations moving in real time.'}
          </p>

          <form className="auth-form">
            {isSignup && (
              <label>
                Display name
                <input type="text" placeholder="Your name" />
              </label>
            )}
            <label>
              Email
              <input type="email" placeholder="you@company.com" />
            </label>

            <label>
              Password
              <input type="password" placeholder="At least 8 characters" />
            </label>

            <button className="btn primary auth-submit" type="submit">
              {isSignup ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="auth-foot">
            {isSignup ? 'Already have an account?' : 'New to LiveChat?'}{' '}
            <a href="/auth" onClick={toggleMode}>
              {isSignup ? 'Sign in' : 'Create an account'}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth
