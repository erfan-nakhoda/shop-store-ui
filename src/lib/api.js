import axios from 'axios'

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')
export const apiRoutes = {
  products: import.meta.env.VITE_PRODUCTS_ROUTE || '/product',
  categories: import.meta.env.VITE_CATEGORIES_ROUTE || '/category',
  basket: import.meta.env.VITE_BASKET_ROUTE || '/basket',
}

export const getApiMessage = (error) => {
  const message = error?.response?.data?.message || error?.message || 'خطایی رخ داد. لطفاً دوباره تلاش کنید.'
  return Array.isArray(message) ? message.join('، ') : String(message)
}
export const unwrapApi = (payload) => payload?.data ?? payload
export function unwrapUser(payload, fallback = null) {
  let value = payload
  for (let depth = 0; depth < 5; depth += 1) {
    if (!value || typeof value !== 'object') break
    if (value.user && typeof value.user === 'object') { value = value.user; continue }
    if (value.data && typeof value.data === 'object') { value = value.data; continue }
    if (value.role || value.roles || value.id || value._id) return value
    break
  }
  return fallback
}

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

let isRefreshing = false
let waitingRequests = []

const resolveWaiting = (error, token = null) => {
  waitingRequests.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)))
  waitingRequests = []
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('captain_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status !== 401 || original?._retry || original?.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    original._retry = true
    const refreshToken = localStorage.getItem('captain_refresh_token')

    if (isRefreshing) {
      return new Promise((resolve, reject) => waitingRequests.push({ resolve, reject }))
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
    }

    isRefreshing = true
    try {
      const response = await axios.get(`${API_URL}/auth/refresh`, {
        withCredentials: true,
        ...(refreshToken ? { headers: { Authorization: `Bearer ${refreshToken}` } } : {}),
      })
      const envelope = response.data?.data ?? response.data
      const token = envelope?.accessToken || envelope?.access_token
      const newRefresh = envelope?.refreshToken || envelope?.refresh_token
      if (!token) throw new Error('Refresh did not return an access token')
      localStorage.setItem('captain_access_token', token)
      if (newRefresh) localStorage.setItem('captain_refresh_token', newRefresh)
      resolveWaiting(null, token)
      original.headers.Authorization = `Bearer ${token}`
      return api(original)
    } catch (refreshError) {
      refreshError.authRefreshFailed = true
      resolveWaiting(refreshError)
      // NestJS commonly returns 400 (BadRequestException) for an expired/invalid refresh token.
      // Only then clear the session and move the customer to authentication.
      if ([400, 401].includes(refreshError.response?.status)) {
        localStorage.removeItem('captain_access_token')
        localStorage.removeItem('captain_refresh_token')
        window.dispatchEvent(new Event('captain:unauthorized'))
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  requestOtp: (payload) => api.post('/auth/send-otp', payload),
  verifyOtp: (payload) => api.post('/auth/check-otp', payload),
  logout: () => {
    const accessToken = localStorage.getItem('captain_access_token')
    return api.get('/auth/logout', {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
  },
  me: () => api.get(import.meta.env.VITE_ME_ROUTE || '/users/me'),
}

const profileRoute = import.meta.env.VITE_PROFILE_ROUTE || '/profile'
export const profileApi = {
  get: () => api.get(profileRoute),
  update: (payload) => api.patch(import.meta.env.VITE_PROFILE_UPDATE_ROUTE || profileRoute, payload),
}

export const ordersApi = {
  list: (config = {}) => api.get(import.meta.env.VITE_ORDERS_ALL_ROUTE || '/order/all', {
    ...config,
    params: { page: 1, limit: 10, ...(config.params || {}) },
  }),
  get: (id) => api.get(`${import.meta.env.VITE_ORDER_ROUTE || '/order'}/${encodeURIComponent(id)}`),
  set: () => api.post(import.meta.env.VITE_ORDER_SET_ROUTE || '/order/set'),
}

export const productsApi = {
  list: (config = {}) => api.get(`${apiRoutes.products}/all`, {
    ...config,
    params: { page: 1, limit: 10, ...(config.params || {}) },
  }),
  get: (id, config) => api.get(`${apiRoutes.products}/get/${encodeURIComponent(id)}`, config),
  listByCategory: (categoryId, config) => api.get((import.meta.env.VITE_PRODUCTS_BY_CATEGORY_ROUTE || `${apiRoutes.products}/all/:categoryId`).replace(':categoryId', encodeURIComponent(categoryId)), config),
  create: (payload) => api.post(`${apiRoutes.products}/create`, payload),
}

export const categoriesApi = {
  list: () => api.get(`${apiRoutes.categories}/all`),
  get: (slug) => api.get(`${apiRoutes.categories}/${encodeURIComponent(slug)}`),
  create: (payload) => api.post(`${apiRoutes.categories}/create`, payload),
  updateBySlug: (slug, payload) => api.patch(`${apiRoutes.categories}/update/${encodeURIComponent(slug)}`, payload),
  updateById: (id, payload) => api.patch(`${apiRoutes.categories}/update/${encodeURIComponent(id)}`, payload),
  deleteBySlug: (slug) => api.delete(`${apiRoutes.categories}/delete-slug/${encodeURIComponent(slug)}`),
  deleteById: (id) => api.delete(`${apiRoutes.categories}/delete-id/${encodeURIComponent(id)}`),
}

export const basketApi = {
  get: (userId) => api.get(`${apiRoutes.basket}/get/${userId}`),
  addItem: (productId, count = 1) => api.post(`${apiRoutes.basket}/add-item`, { productId: String(productId), count: String(count) }),
  deleteItem: (productId, count = 1) => api.delete(`${apiRoutes.basket}/delete-item`, { data: { productId: String(productId), count: String(count) } }),
}
