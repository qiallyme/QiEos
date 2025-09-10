import React from 'react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b border-zinc-200">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="text-xl font-semibold">Qsaysit · Empower Q Now</a>
        <nav className="flex gap-4 text-sm">
          <a href="#qsaysit" className="hover:underline">Qsaysit</a>
          <a href="#empowerq" className="hover:underline">Empower Q</a>
          <a href="#about" className="hover:underline">About</a>
        </nav>
      </div>
    </header>
  )
}
