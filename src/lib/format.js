export const formatToman = (value) => `${new Intl.NumberFormat('fa-IR').format(Number(value || 0))} تومان`
