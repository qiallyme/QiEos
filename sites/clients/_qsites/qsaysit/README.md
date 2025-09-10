# Qsaysit · Empower Q Now — Blog/Podcast Starter

A minimal, beautiful blog fed by Markdown. Write in Obsidian, deploy on Cloudflare.

## Commands
- Dev: `pnpm dev`
- Build: `pnpm build`
- Preview: `pnpm preview`

## Content
Add Markdown files under `content/qsaysit` or `content/empowerq`. Include YAML front matter:

```yaml
---
date: 2025-09-10
title: Post Title
category: Qsaysit  # or Empower Q
tags: [tag1, tag2]
summary: One sentence hook.
audio: /audio/episode-1.mp3 # optional
---
```

## Deploy to Cloudflare Pages

* Build command: `pnpm build`
* Output dir: `dist`

## Customize

* Edit colors/spacing in Tailwind.
* Swap the header copy.
* Add analytics or a tip jar (Buy Me a Coffee/Ko-fi) in the footer.

## Notes
- This starter intentionally avoids heavy frameworks (no routing needed for a simple feed). If you want multiple pages or SEO-friendly routes later, we can add file-based routing (React Router or switch to Astro/Eleventy) while keeping your content.
- Drop audio files under `public/audio/*` and reference with `audio:` in front matter.