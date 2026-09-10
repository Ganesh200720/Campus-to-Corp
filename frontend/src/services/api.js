import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sb_access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let queue = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response && error.response.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('sb_refresh')
      if (!refresh) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }
      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push(() => resolve(api(original)))
        })
      }
      isRefreshing = true
      try {
        const res = await axios.post(`${API_URL}/auth/login/refresh/`, { refresh })
        localStorage.setItem('sb_access', res.data.access)
        queue.forEach((cb) => cb())
        queue = []
        isRefreshing = false
        return api(original)
      } catch (e) {
        isRefreshing = false
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(e)
      }
    }
    return Promise.reject(error)
  }
)

export default api

export { API_URL }

export const collaborationApi = {
  getOpportunities: (params = {}) =>
    api.get('/collaborations/', { params }),

  getOpportunity: (id) =>
    api.get(`/collaborations/${id}/`),

  createOpportunity: (data) =>
    api.post('/collaborations/', data),

  getMyOpportunities: () =>
    api.get('/collaborations/industry/my-opportunities/'),

  sendRequest: (opportunityId, message) =>
    api.post(`/collaborations/${opportunityId}/request/`, {
      message,
    }),

  getMyRequests: () =>
    api.get('/collaborations/my-requests/'),

  getIndustryRequests: () =>
    api.get('/collaborations/industry/requests/'),

  updateRequestStatus: (requestId, status) =>
    api.patch(`/collaborations/requests/${requestId}/status/`, {
      status,
    }),
}