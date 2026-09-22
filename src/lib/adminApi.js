import { api, categoriesApi, ordersApi, productsApi } from './api'

// No guessed mutation routes: enable these after implementing the backend contract.
const routes = {
  productUpdate: import.meta.env.VITE_PRODUCT_UPDATE_ROUTE,
  productDelete: import.meta.env.VITE_PRODUCT_DELETE_ROUTE,
  supportList: import.meta.env.VITE_SUPPORT_LIST_ROUTE,
  supportCreate: import.meta.env.VITE_SUPPORT_CREATE_ROUTE,
  supportUpdate: import.meta.env.VITE_SUPPORT_UPDATE_ROUTE,
  supportDelete: import.meta.env.VITE_SUPPORT_DELETE_ROUTE,
  sitesList: import.meta.env.VITE_SITES_LIST_ROUTE,
}
const request = (route, method, data, id) => {
  if (!route) return Promise.reject(new Error('This action needs a backend endpoint.'))
  return api.request({ url: route.replace(':id', encodeURIComponent(id)), method, data })
}
export const adminCapabilities = Object.fromEntries(Object.entries(routes).map(([key, value]) => [key, Boolean(value)]))
export const adminApi = {
  orders: { list: (config) => ordersApi.list(config), get: ordersApi.get },
  products: { list: (config) => productsApi.list(config), create: productsApi.create, update: (id, data) => request(routes.productUpdate, 'patch', data, id), remove: id => request(routes.productDelete, 'delete', undefined, id) },
  categories: { list: categoriesApi.list, create: categoriesApi.create, update: categoriesApi.updateBySlug, remove: categoriesApi.deleteBySlug },
  support: { list: () => request(routes.supportList, 'get'), create: data => request(routes.supportCreate, 'post', data), update: (id, data) => request(routes.supportUpdate, 'patch', data, id), remove: id => request(routes.supportDelete, 'delete', undefined, id) },
  sites: { list: () => request(routes.sitesList, 'get') },
}
