export const numericValue = (value) => {
  const normalized = String(value ?? '').replace(/,/g, '').trim()
  const number = Number(normalized)
  return Number.isFinite(number) ? number : 0
}

export const formatToman = (value) => `${new Intl.NumberFormat('fa-IR').format(numericValue(value))} تومان`
