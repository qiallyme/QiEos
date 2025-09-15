# QiAlly Website

A modern, responsive website for QiAlly professional services, featuring systems optimization, process improvement, and strategic guidance.

## 🚀 Features

- **Modern Design**: Clean, professional design with animated backgrounds and glass-morphism effects
- **Mobile-First**: Fully responsive design optimized for all devices
- **Performance**: Fast loading with optimized assets and minimal dependencies
- **SEO Optimized**: Proper meta tags, structured data, and semantic HTML
- **Accessibility**: WCAG compliant with proper contrast ratios and keyboard navigation
- **Cross-Browser**: Compatible with all modern browsers including Safari

## 📁 File Structure

```
qially.com/
├── index.html              # Homepage with hero section and services overview
├── about-me.html           # About page with Cody's background and resume
├── services.html           # Services page with detailed offerings
├── contact.html            # Contact page with form and information
├── knowledge-base.html     # Public knowledge base and documentation
├── privacy-policy.html     # Privacy policy page
├── terms-of-use.html       # Terms of use page
├── 404.html               # Custom 404 error page
├── cody_rice_velasquez_resume.pdf  # Cody's resume (PDF)
├── scripts/
│   └── obsidian-sync.js   # Obsidian integration helper
└── README.md              # This file
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Accent**: Purple (#9333EA)
- **Background**: Dark blue (#0F172A)
- **Panel**: Slate (#1E293B)
- **Text**: Light gray (#F8FAFC)
- **Subtext**: Gray (#94A3B8)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components
- Glass-morphism cards with backdrop blur
- Animated star background
- Floating blob animations
- Gradient text effects
- Hover animations and transitions

## 🔧 Setup & Deployment

### Local Development
1. Clone the repository
2. Navigate to the `qially.com` directory
3. Start a local server:
   ```bash
   python -m http.server 8000
   ```
4. Open `http://localhost:8000` in your browser

### Cloudflare Pages Deployment
1. Connect your repository to Cloudflare Pages
2. Set build settings:
   - **Framework Preset**: None
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Root Directory**: qially.com
3. Deploy

## 📝 Content Management

### Adding New Pages
1. Create a new HTML file following the existing structure
2. Include the standard navigation and footer
3. Use the established CSS variables and classes
4. Add proper meta tags and SEO elements

### Updating Content
- **Homepage**: Edit `index.html` hero section and main content
- **Services**: Update `services.html` with new service offerings
- **About**: Modify `about-me.html` for personal information
- **Contact**: Update `contact.html` with new contact details

### Knowledge Base Integration
The knowledge base is designed for easy integration with Obsidian:
1. Use the `obsidian-sync.js` script for markdown conversion
2. Articles are stored as JSON and can be imported/exported
3. Categories and tags are supported for organization
4. Search functionality is built-in

## 🔗 Navigation Structure

### Main Navigation
- **Home** (`/`) - Landing page with services overview
- **Services** (`/services.html`) - Detailed service offerings
- **About** (`/about-me.html`) - Cody's background and resume
- **Contact** (`/contact.html`) - Contact form and information
- **Knowledge Base** (`/knowledge-base.html`) - Public documentation
- **Client Portal** (`https://portal.qially.com/client`) - External client portal

### Footer Links
- Quick links to all main pages
- Social media links (Facebook, X, YouTube)
- Contact information
- Legal pages (Privacy Policy, Terms of Use)

## 📱 Mobile Optimization

The website is fully responsive with:
- Mobile-first CSS approach
- Flexible grid layouts
- Touch-friendly navigation
- Optimized typography scaling
- Reduced animations on mobile devices

## 🔍 SEO Features

- Semantic HTML structure
- Proper heading hierarchy
- Meta descriptions and keywords
- Open Graph and Twitter Card tags
- Canonical URLs
- Structured data markup
- Fast loading times

## 🛠️ Maintenance

### Regular Tasks
1. **Content Updates**: Keep service offerings and contact information current
2. **Security**: Regularly update dependencies and check for vulnerabilities
3. **Performance**: Monitor loading times and optimize images
4. **Analytics**: Track user engagement and page performance

### Browser Testing
Test regularly on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📞 Contact Information

- **Email**: Info@qially.me
- **Phone**: +1 (765) 443-4769
- **Location**: Indianapolis, IN - Available Worldwide
- **Social Media**: 
  - Facebook: https://www.facebook.com/qially1/
  - X: https://x.com/QiAlly
  - YouTube: https://www.youtube.com/@qiallyme

## 📄 Legal Pages

- **Privacy Policy**: `/privacy-policy.html`
- **Terms of Use**: `/terms-of-use.html`

## 🚀 Performance Tips

1. **Image Optimization**: Use WebP format when possible
2. **Minification**: Minify CSS and JavaScript for production
3. **Caching**: Implement proper cache headers
4. **CDN**: Use Cloudflare CDN for global distribution
5. **Compression**: Enable GZIP compression

## 🔧 Troubleshooting

### Common Issues
1. **Backdrop Filter**: Ensure `-webkit-backdrop-filter` is included for Safari
2. **Font Loading**: Check Google Fonts connection
3. **Mobile Navigation**: Test touch interactions
4. **Form Submission**: Verify contact form functionality

### Browser Compatibility
- All modern browsers supported
- Graceful degradation for older browsers
- Polyfills included where necessary

## 📈 Analytics & Monitoring

Consider implementing:
- Google Analytics 4
- Google Search Console
- Page speed monitoring
- Uptime monitoring
- Error tracking

## 🤝 Contributing

1. Follow the existing code style
2. Test on multiple devices and browsers
3. Update documentation as needed
4. Ensure accessibility compliance
5. Optimize for performance

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: QiAlly Team
