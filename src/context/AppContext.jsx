import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { authApi, basketApi, getApiMessage, unwrapApi, unwrapUser } from '../lib/api'
import { numericValue } from '../lib/format'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('captain_user') || 'null'))
  const [basket, setBasket] = useState(() => JSON.parse(localStorage.getItem('captain_basket') || '[]'))
  const [basketError, setBasketError] = useState('')
  const basketVersion = useRef(0)

  useEffect(() => {
    localStorage.setItem('captain_basket', JSON.stringify(basket))
  }, [basket])

  useEffect(() => {
    const version = ++basketVersion.current
    const userId = user?.id || user?._id || user?.userId
    if (!userId) {
      setBasket([])
      return
    }
    basketApi.get(userId).then(({ data }) => {
      if (version !== basketVersion.current) return
      const envelope = unwrapApi(data)
      const items = envelope?.items || envelope?.products || (Array.isArray(envelope) ? envelope : null)
      if (!Array.isArray(items)) return
      setBasket(items.map((item) => ({
        ...item,
        id: item.productId || item.product?.id || item.id,
        basketItemId: item.id,
        name: item.product?.name || item.name,
        price: item.product?.price ?? item.price,
        category: item.product?.category?.name || item.category,
        image: item.product?.image || item.product?.imageUrl || item.image,
        quantity: Number(item.quantity ?? item.count ?? 1),
      })))
    }).catch(() => {
      if (version === basketVersion.current) setBasket([])
    })
    return () => { basketVersion.current += 1 }
  }, [user?.id, user?._id, user?.userId])

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null)
      localStorage.removeItem('captain_user')
      window.location.href = '/auth'
    }
    window.addEventListener('captain:unauthorized', onUnauthorized)
    return () => window.removeEventListener('captain:unauthorized', onUnauthorized)
  }, [])

  const saveSession = async (data, fallbackUser = null) => {
    const envelope = unwrapApi(data)
    const access = envelope?.accessToken || envelope?.access_token
    const refresh = envelope?.refreshToken || envelope?.refresh_token
    if (access) localStorage.setItem('captain_access_token', access)
    if (refresh) localStorage.setItem('captain_refresh_token', refresh)
    let nextUser = envelope?.user || fallbackUser || envelope
    try {
      const meResponse = await authApi.me()
      nextUser = unwrapUser(meResponse.data, nextUser)
    } catch {}
    setUser(nextUser)
    localStorage.setItem('captain_user', JSON.stringify(nextUser))
    return nextUser
  }

  const login = async (payload) => {
    const { data } = await authApi.verifyOtp(payload)
    await saveSession(data)
  }

  const logout = () => {
    authApi.logout().catch(() => {})
    localStorage.removeItem('captain_access_token')
    localStorage.removeItem('captain_refresh_token')
    localStorage.removeItem('captain_user')
    setUser(null)
  }

  const addToBasket = async (product) => {
    try { await basketApi.addItem(product.id, 1); setBasketError('') } catch (error) { setBasketError(getApiMessage(error)); return }
    setBasket((items) => {
      const found = items.find((item) => item.id === product.id)
      return found ? items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return removeFromBasket(id)
    const current = basket.find((entry) => entry.id === id)?.quantity || 0
    try {
      if (quantity > current) await basketApi.addItem(id, quantity - current)
      if (quantity < current) await basketApi.deleteItem(id, current - quantity)
      setBasketError('')
    } catch (error) { setBasketError(getApiMessage(error)); return }
    setBasket((items) => items.map((entry) => entry.id === id ? { ...entry, quantity } : entry))
  }

  const removeFromBasket = async (id) => {
    const item = basket.find((entry) => entry.id === id)
    try { if (item) await basketApi.deleteItem(id, item.quantity); setBasketError('') } catch (error) { setBasketError(getApiMessage(error)); return }
    setBasket((items) => items.filter((entry) => entry.id !== id))
  }

  const clearBasket = () => {
    basketVersion.current += 1
    setBasket([])
    setBasketError('')
    localStorage.setItem('captain_basket', '[]')
  }

  const value = useMemo(() => ({
    user, login, saveSession, logout, basket, basketError, addToBasket, updateQuantity, removeFromBasket, clearBasket,
    basketCount: basket.reduce((sum, item) => sum + item.quantity, 0),
    basketTotal: basket.reduce((sum, item) => sum + numericValue(item.price) * item.quantity, 0),
  }), [user, basket, basketError])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
