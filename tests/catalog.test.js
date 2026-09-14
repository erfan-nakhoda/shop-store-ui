import test from 'node:test'
import assert from 'node:assert/strict'
import { readCollection, readProduct, validHex, hasRole, productImage } from '../src/lib/catalog.js'

test('reads the live Nest product response and keeps the server count', () => {
  const products = [{ id: 2, name: 'product#1', total_count: 5, color: 'Yellow', image: null }]
  assert.deepEqual(readCollection({ status: 200, data: { count: 12, products } }), { items: products, count: 12 })
})
test('accepts category arrays, items envelopes, and empty lists', () => {
  assert.deepEqual(readCollection({ data: [{ id: 1 }] }, 'categories'), { items: [{ id: 1 }], count: 1 })
  assert.deepEqual(readCollection({ data: { items: [], count: 0 } }), { items: [], count: 0 })
})
test('rejects a product object returned by a conflicting category route', () => {
  assert.throws(() => readCollection({ data: { id: 2, name: 'Wrong route' } }), /unexpected collection/)
})
test('detail responses must match the requested product, never a category list', () => {
  assert.equal(readProduct({ data: { id: 2, name: 'Product' } }, '2').name, 'Product')
  assert.throws(() => readProduct({ data: { id: 3 } }, '2'), /Product not found/)
  assert.throws(() => readProduct({ data: { products: [{ id: 2 }] } }, '2'), /Product not found/)
})
test('uses only valid hex values for swatches and string image sources', () => {
  assert.equal(validHex('#facc15'), true)
  assert.equal(validHex('#fff'), true)
  assert.equal(validHex('yellow'), false)
  assert.equal(validHex('url(example)'), false)
  assert.equal(productImage({ image: null }), undefined)
  assert.equal(productImage({ image: {}, imageUrl: '/photo.png' }), '/photo.png')
})
test('recognizes role arrays and casing without granting ordinary users access', () => {
  assert.equal(hasRole({ roles: ['ADMIN'] }, ['admin']), true)
  assert.equal(hasRole({ role: 'support' }, ['admin']), false)
  assert.equal(hasRole(null, ['admin']), false)
})
