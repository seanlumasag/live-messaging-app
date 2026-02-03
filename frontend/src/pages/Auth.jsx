import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../App.css'

function Auth() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSignup = mode === 'signup'
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const view = params.get('mode')
    if (view === 'signup' || view === 'signin') {
      setMode(view)
      setError('')
    }
  }, [location.search])

  const toggleMode = (event) => {
    event.preventDefault()
    setError('')
    setMode(isSignup ? 'signin' : 'signup')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim() || (isSignup && !displayName.trim())) {
      setError('Please fill out all required fields.')
      return
    }

    setIsSubmitting(true)
    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login'
      const url = `${apiBaseUrl}${endpoint}`
      const payload = {
        email: email.trim(),
        password,
        ...(isSignup ? { displayName: displayName.trim() } : {}),
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const message = response.status === 401
          ? 'Incorrect email or password.'
          : 'Unable to authenticate. Please try again.'
        throw new Error(message)
      }

      const data = await response.json()
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify({
        id: data.userId,
        email: data.email,
        displayName: data.displayName,
      }))

      navigate('/app')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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

          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && (
              <label>
                Display name
                <input
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error && <div className="auth-error">{error}</div>}

            <button className="btn primary auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
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
