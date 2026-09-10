// The Institution role is still stored/sent by the backend as 'admin',
// but its section of the app lives under /institution, not /admin.
export function roleHome(role) {
  if (role === 'admin') return '/institution'
  return `/${role}`
}
