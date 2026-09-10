import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingState from './LoadingState'
import { roleHome } from '../utils/roleHome'

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingState label="Loading SkillBridge..." />
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={roleHome(user.role)} replace />
  return children
}
