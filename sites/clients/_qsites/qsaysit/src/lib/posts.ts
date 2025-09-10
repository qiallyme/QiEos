import matter from 'gray-matter'

export type RawPostModule = {
  default: string
}

export function loadPosts() {
  // Import all markdown under /content/**.md as raw strings
  const modules = import.meta.glob<RawPostModule>(
    '/content/**/*.md',
    { eager: true, as: 'raw' }
  )

  const posts = Object.entries(modules).map(([path, raw]) => {
    const { data, content } = matter(raw as unknown as string)

    const slug = path
      .replace('/content/', '')
      .replace(/\/*.md$/, '')

    return {
      slug,
      title: data.title ?? slug,
      date: data.date ?? new Date().toISOString(),
      category: data.category ?? 'Post',
      tags: data.tags ?? [],
      mood: data.mood ?? undefined,
      summary: data.summary ?? undefined,
      audio: data.audio ?? undefined,
      body: content.trim(),
    }
  })

  // Sort newest first
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return posts
}
