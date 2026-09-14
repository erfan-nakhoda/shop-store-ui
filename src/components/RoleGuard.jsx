import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { authApi, getApiMessage, unwrapUser } from '../lib/api'
import { hasRole } from '../lib/catalog'
import { useApp } from '../context/AppContext'

export function RoleGuard({ roles, children }) {
  const { user } = useApp()
  const [session, setSession] = useState({ loading: true })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setSession({ loading: true })
    authApi.me().then(({ data }) => {
      const value = unwrapUser(data)
      if (active) setSession({ user: value })
    }).catch(error => { if (active) setSession({ error: getApiMessage(error), unauthorized: error.response?.status === 401, refreshFailed: Boolean(error.authRefreshFailed) }) })
    return () => { active = false }
  }, [user, attempt])
  if (session.loading) return <p role="status" className="p-10">Checking access…</p>
  if (session.unauthorized && session.refreshFailed) return <Navigate to="/auth" replace />
  if (session.error) return <div className="mx-auto max-w-xl p-10" role="alert"><h1 className="text-xl font-bold">Unable to verify access</h1><p className="my-3">{session.error}</p><button className="rounded-xl bg-ink px-4 py-2 text-white" onClick={() => setAttempt(value => value + 1)}>Retry</button></div>
  if (!hasRole(session.user, roles)) return <div className="p-10" role="alert"><h1 className="text-xl font-bold">Access denied</h1><p>Your account does not have permission to open this panel.</p></div>
  return children
}
