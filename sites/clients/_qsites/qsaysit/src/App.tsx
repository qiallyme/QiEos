import React from 'react'
import Header from './components/Header'
import PostCard from './components/PostCard'
import AudioPlayer from './components/AudioPlayer'
import { loadPosts } from './lib/posts'

export default function App() {
  const posts = loadPosts()
  const qsaysit = posts.filter(p => (p.category || '').toLowerCase().includes('qsaysit'))
  const empower = posts.filter(p => (p.category || '').toLowerCase().includes('empower'))

  return (
    <div>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <section id="qsaysit" className="mb-12">
          <h1 className="text-3xl font-bold mb-4">Qsaysit</h1>
          <p className="text-zinc-600 mb-6">Playful, real, timeline-bending dispatches.</p>
          {(qsaysit.length ? qsaysit : posts).map(p => (
            <div key={p.slug}>
              <PostCard post={p} />
              <AudioPlayer src={p.audio} />
            </div>
          ))}
        </section>
        <section id="empowerq" className="mb-12">
          <h1 className="text-3xl font-bold mb-4">Empower Q Now</h1>
          <p className="text-zinc-600 mb-6">Reflective, spiritual essays & insights.</p>
          {empower.map(p => (
            <div key={p.slug}>
              <PostCard post={p} />
              <AudioPlayer src={p.audio} />
            </div>
          ))}
        </section>
        <section id="about" className="mb-12">
          <h2 className="text-2xl font-semibold mb-2">About</h2>
          <p className="text-zinc-700">Stories at the edge of memory, identity, and quantum weirdness. Real? Fiction? You decide.</p>
        </section>
      </main>
      <footer className="border-t border-zinc-200 py-6 text-center text-sm text-zinc-600">© {new Date().getFullYear()} Q</footer>
    </div>
  )
}
