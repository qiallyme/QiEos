import { useAuth as useAuthContext } from '../context/AuthContext'

// Re-export the auth hook for convenience
export { useAuthContext as useAuth }

// Helper hook to check if user has specific feature
export function useFeature(feature: string): boolean {
  const { claims } = useAuthContext()
  return claims?.features?.[feature] ?? false
}

// Helper hook to check if user has specific role
export function useRole(role: string): boolean {
  const { claims } = useAuthContext()
  return claims?.role === role
}

// Helper hook to check if user can access company
export function useCompanyAccess(companyId: string): boolean {
  const { claims } = useAuthContext()
  return claims?.company_ids?.includes(companyId) ?? false
}
