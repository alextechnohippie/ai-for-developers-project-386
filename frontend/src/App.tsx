import { useEffect, useState } from 'react'
import { getHealth } from './api/generated'
import './App.css'

function App() {
  const [status, setStatus] = useState('…')

  useEffect(() => {
    getHealth()
      .then(({ data, error }) => {
        setStatus(error ? 'error' : (data?.status ?? 'unknown'))
      })
      .catch(() => {
        setStatus('error')
      })
  }, [])

  return (
    <main>
      <h1>Календарь звонков</h1>
      <p>
        Backend health: <strong data-testid="health-status">{status}</strong>
      </p>
    </main>
  )
}

export default App
