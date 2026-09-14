import { useState } from 'react'

export function ProductImage({ src, name, className = '' }) {
  const [failed, setFailed] = useState(null)
  return src && failed !== src
    ? <img src={src} alt={name || 'Product'} onError={() => setFailed(src)} className={`h-full w-full object-contain ${className}`} />
    : <div className="grid h-full min-h-48 w-full place-items-center bg-slate-100 text-slate-500">No image</div>
}
