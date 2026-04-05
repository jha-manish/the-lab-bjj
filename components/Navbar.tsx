'use client'

import Link from 'next/link'
import { useState } from 'react'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/programs', label: 'Programs' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/pricing', label: 'Pricing' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-white">THE <span className="text-teal-400">JIU-JITSU LAB</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="text-sm text-gray-300 hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
          <Link href="/book" className="bg-teal-500 hover:bg-teal-400 text-black font-bold text-sm px-4 py-2 rounded transition-colors">
            Book Free Trial
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-white p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
          <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${open ? 'opacity-0' : ''}`} />
          <div className={`w-5 h-0.5 bg-white transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-black border-t border-white/10 px-4 py-4 flex flex-col gap-4">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="text-gray-300 hover:text-white transition-colors" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/book" className="bg-teal-500 text-black font-bold px-4 py-2 rounded text-center" onClick={() => setOpen(false)}>
            Book Free Trial
          </Link>
        </div>
      )}
    </nav>
  )
}
