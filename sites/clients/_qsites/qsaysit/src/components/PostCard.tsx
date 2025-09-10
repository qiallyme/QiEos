import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

export type Post = {
  slug: string
  title: string
  date: string
  category: string
  tags: string[]
  mood?: string
  summary?: string
  audio?: string
  body: string
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <article id={post.slug} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-6">
      <header className="mb-3">
        <h2 className="text-2xl font-semibold leading-tight">{post.title}</h2>
        <p className="text-sm text-zinc-500">{new Date(post.date).toLocaleDateString()} · {post.category}</p>
      </header>
      {post.summary && <p className="text-zinc-700 mb-4">{post.summary}</p>}
      <ReactMarkdown className="prose prose-zinc max-w-none" remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {post.body}
      </ReactMarkdown>
      {post.tags?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map(t => (
            <span key={t} className="text-xs bg-zinc-100 text-zinc-700 px-2 py-1 rounded-full">#{t}</span>
          ))}
        </div>
      ) : null}
    </article>
  )
}
