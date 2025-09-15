# QiAlly Marketing Site

A modern, interactive marketing website built with Vite + React, TailwindCSS, and Framer Motion.

## Features

- 🎨 **Modern Design**: Glassmorphism, rounded corners, soft shadows
- 🌙 **Dark/Light Theme**: Automatic theme detection with manual toggle
- 📱 **Mobile-First**: Responsive design that works on all devices
- ⚡ **Performance**: Optimized for Lighthouse scores ≥ 90
- 🎭 **Animations**: Tasteful Framer Motion animations
- 📧 **Contact Form**: Working contact form with spam protection
- 📅 **Calendly Integration**: Embedded booking system

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS with custom design tokens
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Calendly URL for booking integration
VITE_CALENDLY_URL=https://calendly.com/qially/qimoment

# Contact form endpoint (optional)
VITE_CONTACT_API_URL=/api/contact
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI primitives
│   ├── Nav.tsx         # Navigation component
│   ├── Footer.tsx      # Footer component
│   └── ThemeToggle.tsx # Theme switcher
├── pages/              # Page components
│   ├── index.tsx       # Home page
│   ├── about.tsx       # About page
│   ├── services.tsx    # Services page
│   ├── contact.tsx     # Contact page
│   └── 404.tsx         # 404 page
├── sections/           # Home page sections
│   ├── Hero.tsx        # Hero section
│   ├── Trust.tsx       # Trust indicators
│   ├── ServicesGrid.tsx # Services showcase
│   ├── Process.tsx     # Process timeline
│   ├── Testimonials.tsx # Client testimonials
│   └── CtaBanner.tsx   # Call-to-action
└── styles/             # Global styles
    └── index.css       # Tailwind + CSS variables
```

## Design System

### Colors

The site uses a comprehensive color system with CSS variables:

- **Primary**: Blue gradient (indigo → violet → fuchsia)
- **Background**: Light/dark mode support
- **Cards**: Glassmorphism with backdrop blur
- **Text**: High contrast for accessibility

### Typography

- **Headings**: `text-3xl md:text-5xl font-semibold tracking-tight`
- **Body**: `text-slate-600 dark:text-slate-300`
- **Spacing**: `py-20` sections, `max-w-7xl mx-auto px-6 md:px-8`

### Components

- **Glass Cards**: `bg-white/10 backdrop-blur-md rounded-2xl`
- **Shadows**: `shadow-xl`, `shadow-2xl/20`
- **Buttons**: Multiple variants with hover states

## Contact Form

The contact form includes:

- ✅ **Validation**: Client-side and server-side validation
- 🛡️ **Spam Protection**: Honeypot field and rate limiting
- 📧 **Email Integration**: Ready for email service integration
- 🎯 **Success/Error States**: User feedback with toast notifications

## Calendly Integration

The Calendly component:

- 📅 **Responsive**: Works on all screen sizes
- 🔗 **Configurable**: URL from environment variables
- ♿ **Accessible**: Proper ARIA labels and keyboard navigation

## Performance

The site is optimized for:

- ⚡ **Core Web Vitals**: LCP, FID, CLS
- 🖼️ **Images**: Optimized and lazy-loaded
- 📦 **Bundle Size**: Tree-shaking and code splitting
- 🚀 **Lighthouse**: Target scores ≥ 90

## Deployment

### Cloudflare Pages

1. Connect your repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set build output directory: `dist`
4. Add environment variables in dashboard

### Environment Variables

```env
VITE_CALENDLY_URL=https://calendly.com/qially/qimoment
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

© 2024 QiAlly. All rights reserved.
