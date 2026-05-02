import { useState } from 'react'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Demo login: ' + username)
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2>Sign in to Glasshouse</h2>
      <form onSubmit={handleLogin}>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ width: '100%', marginBottom: 12, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 16, padding: 8 }}
        />
        <button type="submit" style={{ width: '100%', padding: 10, background: '#1B5E20', color: '#fff', border: 'none', borderRadius: 4 }}>
          Log in
        </button>
      </form>
      <p style={{ marginTop: 12 }}>No account? <a href="/register">Register</a></p>
    </div>
  )
}

export default App