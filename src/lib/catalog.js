// Accept the API's { data: { count, products } } and plain collection responses.
export function readCollection(payload, key = 'products') {
  let value = payload
  for (let depth = 0; depth < 5; depth++) {
    if (Array.isArray(value)) return { items: value, count: value.length }
    if (!value || typeof value !== 'object') break
    const items = value[key] ?? value.items
    if (Array.isArray(items)) return { items, count: Number.isFinite(Number(value.count)) ? Number(value.count) : items.length }
    value = value.data
  }
  throw new Error('The API returned an unexpected collection format.')
}

export function readProduct(payload, id) {
  let value = payload
  for (let depth = 0; depth < 5; depth++) {
    if (value && !Array.isArray(value) && String(value.id ?? value._id) === String(id)) return value
    value = value?.product ?? value?.data
  }
  throw new Error('Product not found or the API returned an unexpected product format.')
}

export const entityId = (item) => item.id ?? item._id
export const productImage = (product) => [product.image, product.imageUrl, product.thumbnail].find(value => typeof value === 'string' && value.trim())
export const validHex = (value) => typeof value === 'string' && /^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i.test(value)

export function getRoleName(user) {
  const role = user?.role || user?.user?.role
  const value = typeof role === 'object' ? role?.name : role
  return typeof value === 'string' ? value.trim().toUpperCase() : ''
}

export function hasRole(user, allowed) {
  const roles = [getRoleName(user), ...(Array.isArray(user?.roles) ? user.roles : [])]
  return roles.some(role => {
    const value = typeof role === 'object' ? role?.name : role
    return typeof value === 'string' && allowed.map(item => item.toUpperCase()).includes(value.toUpperCase())
  })
}

export function getPostLoginPath(user) {
  switch (getRoleName(user)) {
    case 'ADMIN':
    case 'SUPERADMIN': return '/admin'
    case 'SUPPORT': return '/support'
    case 'CUSTOMER': return '/'
    default: return '/profile'
  }
}
