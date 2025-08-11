'use client'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { selectShipping, selectTax, BRAND } from '@/config/shopConfig'
import { ShoppingCart, Search, Filter, ChevronRight, X } from 'lucide-react'

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1598899134739-24b6b8443a86?q=80&w=1600&auto=format&fit=crop"

export type Product = {
  id: string
  name: string
  subtitle: string
  price: number
  compareAt?: number
  category: string
  type: string
  tags?: string[]
  stock: number
  image?: string
  description?: string
  care?: { light?: string; water?: string; humidity?: string }
  paymentLink?: string
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Monstera deliciosa",
    subtitle: "Medium plant · Established",
    price: 38,
    compareAt: 46,
    category: "Aroids",
    type: "Medium plant",
    tags: ["Easy", "Low light tolerant"],
    stock: 12,
    image: PLACEHOLDER_IMG,
    description: "Classic split-leaf beauty grown in T&T's airy aroid mix. Expect 2–3 new leaves this season.",
    care: { light: "Bright indirect", water: "When top 2\" is dry", humidity: "40–60%" },
    paymentLink: ""
  },
  {
    id: "p2",
    name: "Hoya kerrii (heart leaf)",
    subtitle: "Starter plant · Rooted cutting",
    price: 16,
    category: "Hoyas",
    type: "Starter plant",
    tags: ["Giftable", "Drought tolerant"],
    stock: 20,
    image: "https://images.unsplash.com/photo-1606041008023-472dfb5e5303?q=80&w=1600&auto=format&fit=crop",
    description: "Adorable heart-shaped leaves. Thrives in chunky mix and bright light. Ships in 2.5\" nursery pot.",
    care: { light: "Bright to bright-indirect", water: "Let dry between waterings", humidity: "40%+" },
    paymentLink: ""
  },
  {
    id: "p3",
    name: "Philodendron 'Pink Princess'",
    subtitle: "Cutting · Variegated",
    price: 68,
    compareAt: 79,
    category: "Aroids",
    type: "Cutting",
    tags: ["Variegated", "Collector"],
    stock: 6,
    image: "https://images.unsplash.com/photo-1605087158074-3f0b4f7b82ec?q=80&w=1600&auto=format&fit=crop",
    description: "Stable pink streaks, one-node cutting with aerial root. Packed with warmth pack as needed.",
    care: { light: "Bright indirect", water: "Keep slightly moist", humidity: "60%+" },
    paymentLink: ""
  },
  {
    id: "p4",
    name: "Alocasia corm mix (3-pack)",
    subtitle: "Corms · Dormant",
    price: 12,
    category: "Alocasia",
    type: "Corms",
    tags: ["Budget", "Fun project"],
    stock: 18,
    image: "https://images.unsplash.com/photo-1598899134374-2e7bade36dd9?q=80&w=1600&auto=format&fit=crop",
    description: "Three healthy corms from mixed cultivars. Plant shallow in warm, humid conditions for best sprout rate.",
    care: { light: "Bright indirect", water: "Evenly moist", humidity: "60%+" },
    paymentLink: ""
  }
]

type CartItem = { id: string; name: string; price: number; qty: number }

const currency = (n: number) => `$${n.toFixed(2)}`

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) setValue(JSON.parse(raw))
    } catch {}
  }, [key])
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value])
  return [value, setValue] as const
}

export function Shop() {
  const [catalog, setCatalog] = useLocalStorage<Product[]>('ttb_catalog', INITIAL_PRODUCTS)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [type, setType] = useState('All')
  const [cart, setCart] = useLocalStorage<CartItem[]>('ttb_cart', [])
  const [openCart, setOpenCart] = useState(false)
  const [emailOrderNote, setEmailOrderNote] = useState('')
  const [dest, setDest] = useState({ country: 'US', state: 'WA', city: 'Tacoma', zip: '' })

  const categories = useMemo(() => ['All', ...Array.from(new Set(catalog.map(p => p.category))).sort()], [catalog])
  const types = useMemo(() => ['All', ...Array.from(new Set(catalog.map(p => p.type))).sort()], [catalog])

  const filtered = useMemo(() => catalog.filter(p => {
    const okQ = (p.name + ' ' + p.subtitle + ' ' + (p.tags||[]).join(' ')).toLowerCase().includes(query.toLowerCase())
    const okC = category === 'All' || p.category === category
    const okT = type === 'All' || p.type === type
    return okQ && okC && okT
  }), [catalog, query, category, type])

  const cartSubtotal = useMemo(() => cart.reduce((s,i)=> s + i.price * i.qty, 0), [cart])
  const shippingRule = useMemo(() => selectShipping(cartSubtotal), [cartSubtotal])
  const taxRule = useMemo(() => selectTax(dest), [dest])
  const taxAmount = useMemo(() => (taxRule ? cartSubtotal * taxRule.percent : 0), [cartSubtotal, taxRule])
  const total = useMemo(() => cartSubtotal + shippingRule.rate + taxAmount, [cartSubtotal, shippingRule, taxAmount])

  function addToCart(p: Product, qty = 1) {
    if (p.stock <= 0) return
    setCart(c => {
      const f = c.find(x => x.id === p.id)
      const nextQty = Math.min((f?.qty || 0) + qty, p.stock)
      if (f) return c.map(x => x.id === p.id ? { ...x, qty: nextQty } : x)
      return [...c, { id: p.id, name: p.name, price: p.price, qty: Math.min(qty, p.stock) }]
    })
    setOpenCart(true)
  }

  function updateQty(id: string, delta: number) {
    setCart(c => c.map(x => x.id === id ? { ...x, qty: Math.max(0, x.qty + delta)} : x).filter(x => x.qty > 0))
  }
  function removeFromCart(id: string) { setCart(c => c.filter(x => x.id !== id)) }

  function checkout() {
    // If all items have Payment Links, open each; else email order fallback
    const items = cart.map(i => catalog.find(p => p.id === i.id))
    const allLinked = items.every(p => p?.paymentLink)
    if (allLinked) {
      items.forEach(p => window.open(p!.paymentLink!, "_blank"))
      return
    }
    const lines = cart.map(i => `• ${i.name} x${i.qty} — ${currency(i.price * i.qty)}`).join('%0D%0A')
    const body = `Hello ${BRAND.name},%0D%0A%0D%0AI'd like to place this order:%0D%0A${lines}%0D%0ASubtotal: ${currency(cartSubtotal)}%0D%0AShipping: ${shippingRule.label} ${currency(shippingRule.rate)}%0D%0A${taxRule ? `${taxRule.label} (${(taxRule.percent*100).toFixed(1)}%): ${currency(taxAmount)}` : ''}%0D%0ATotal: ${currency(total)}%0D%0A%0D%0ANotes: ${encodeURIComponent(emailOrderNote)}%0D%0A%0D%0AShip to: ${dest.city}, ${dest.state} ${dest.zip}, ${dest.country}`
    window.location.href = `mailto:${BRAND.email}?subject=Order%20from%20${encodeURIComponent(BRAND.name)}&body=${body}`
  }

  return (
    <section id="shop" className="pb-16">
      <div className="container">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm font-medium"><Filter size={16}/> Filter</div>
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
            <input className="input pl-9" placeholder="Search plants, e.g., Monstera…" value={query} onChange={e=>setQuery(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <select className="input" value={category} onChange={e=>setCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="input" value={type} onChange={e=>setType(e.target.value)}>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button className="btn" onClick={()=>setOpenCart(true)}>
            <ShoppingCart size={16} /> Cart ({cart.reduce((s,i)=>s+i.qty,0)})
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <div key={p.id} className="card overflow-hidden">
              <div className="relative">
                <Image src={p.image || PLACEHOLDER_IMG} alt={p.name} width={800} height={600} className="w-full h-56 object-cover" />
                {p.compareAt && p.compareAt > p.price && (
                  <span className="badge absolute top-3 left-3 bg-rose-600 text-white border-rose-600">Sale</span>
                )}
                {p.stock <= 5 && <span className="badge absolute top-3 right-3 bg-gray-100 border-gray-300">Low stock</span>}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold leading-tight">{p.name}</div>
                    <div className="text-sm text-gray-600">{p.subtitle}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${p.price.toFixed(2)}</div>
                    {!!p.compareAt && p.compareAt > p.price && (
                      <div className="text-xs line-through text-gray-500">${p.compareAt.toFixed(2)}</div>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="badge">{p.category}</span>
                  <span className="badge">{p.type}</span>
                  {(p.tags||[]).slice(0,2).map(t => <span key={t} className="badge bg-gray-50 border-gray-300">{t}</span>)}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button className="btn btn-primary flex-1" onClick={()=>addToCart(p)}>Add to cart</button>
                  {!!p.paymentLink && <a className="btn" href={p.paymentLink} target="_blank">Buy now</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Drawer */}
      {openCart && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={()=>setOpenCart(false)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your cart</h3>
              <button className="btn" onClick={()=>setOpenCart(false)}><X size={16}/></button>
            </div>
            <div className="mt-4 space-y-3 flex-1 overflow-auto">
              {cart.length === 0 && <div className="text-sm text-gray-600">Your cart is empty.</div>}
              {cart.map(item => {
                const p = catalog.find(pp => pp.id === item.id)
                return (
                  <div key={item.id} className="card p-3 flex items-center gap-3">
                    <Image src={p?.image || PLACEHOLDER_IMG} alt="" width={64} height={64} className="h-16 w-16 rounded-xl object-cover" />
                    <div className="flex-1">
                      <div className="font-medium leading-tight">{item.name}</div>
                      <div className="text-sm text-gray-600">${item.price.toFixed(2)} each</div>
                      <div className="mt-2 flex items-center gap-2">
                        <button className="btn" onClick={()=>updateQty(item.id, -1)}>-</button>
                        <div className="w-8 text-center">{item.qty}</div>
                        <button className="btn" onClick={()=>updateQty(item.id, +1)}>+</button>
                        <button className="btn" onClick={()=>removeFromCart(item.id)}>Remove</button>
                      </div>
                    </div>
                    <div className="font-semibold">${(item.qty * item.price).toFixed(2)}</div>
                  </div>
                )
              })}
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input className="input" placeholder="Country" value={dest.country} onChange={e=>setDest({...dest, country: e.target.value})} />
                <input className="input" placeholder="State" value={dest.state} onChange={e=>setDest({...dest, state: e.target.value})} />
                <input className="input" placeholder="City" value={dest.city} onChange={e=>setDest({...dest, city: e.target.value})} />
                <input className="input" placeholder="ZIP (optional)" value={dest.zip} onChange={e=>setDest({...dest, zip: e.target.value})} />
              </div>
              <textarea className="input" placeholder="Order notes (gift message, delivery instructions, etc.)" value={emailOrderNote} onChange={e=>setEmailOrderNote(e.target.value)} />

              <div className="text-sm flex items-center justify-between">
                <span>Subtotal</span><b>{currency(cartSubtotal)}</b>
              </div>
              <div className="text-sm flex items-center justify-between">
                <span>Shipping — {shippingRule.label}</span><b>{currency(shippingRule.rate)}</b>
              </div>
              {taxRule && (
                <div className="text-sm flex items-center justify-between">
                  <span>{taxRule.label} ({(taxRule.percent*100).toFixed(1)}%)</span><b>{currency(taxAmount)}</b>
                </div>
              )}
              <div className="text-base flex items-center justify-between">
                <span>Total</span><b>{currency(total)}</b>
              </div>

              <button className="btn btn-primary w-full" onClick={checkout}>
                Proceed to checkout <ChevronRight size={16} />
              </button>
              <div className="text-xs text-gray-500">
                If an item lacks a Payment Link, your email client opens with a pre-filled order. Otherwise, you'll be taken to secure payment pages.
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
