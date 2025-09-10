# Client Site Template

This is a generic template for creating client websites that can be deployed to Cloudflare Pages.

## Files Included

- `index.html` - Main website file with placeholder variables
- `wrangler.toml` - Cloudflare Pages configuration
- `_headers` - Custom headers for security and performance
- `_redirects` - URL redirects and SPA routing
- `robots.txt` - SEO robots file
- `sitemap.xml` - SEO sitemap
- `favicon.ico` - Placeholder favicon (replace with actual file)
- `README.md` - This file

## How to Use This Template

1. **Copy the template folder** to create a new client site
2. **Replace placeholder variables** in all files with actual client information
3. **Customize the content** as needed for the specific client
4. **Deploy to Cloudflare Pages**

## Placeholder Variables to Replace

Replace these placeholders with actual client information:

### In `index.html`:
- `{{CLIENT_NAME}}` - Client's business name
- `{{CLIENT_DESCRIPTION}}` - Brief description of the client's business
- `{{CLIENT_KEYWORDS}}` - SEO keywords (comma-separated)
- `{{CLIENT_URL}}` - Client's website URL
- `{{CLIENT_ABOUT_TEXT}}` - About section text
- `{{CLIENT_EMAIL}}` - Client's email address
- `{{CLIENT_PHONE}}` - Client's phone number
- `{{CLIENT_ADDRESS}}` - Client's address

### In `wrangler.toml`:
- `{{CLIENT_NAME_SLUG}}` - URL-friendly version of client name (lowercase, hyphens)

### In `sitemap.xml`:
- `{{CLIENT_URL}}` - Client's website URL
- `{{CURRENT_DATE}}` - Current date in YYYY-MM-DD format

## Customization Tips

1. **Colors**: Update the CSS variables in the `<style>` section to match client branding
2. **Services**: Modify the services section to reflect the client's actual offerings
3. **Images**: Add client logos and images to the appropriate sections
4. **Content**: Update all text content to be specific to the client
5. **Contact Form**: Connect the contact form to a backend service or email handler

## Deployment to Cloudflare Pages

1. **Connect to Git**: Link your repository to Cloudflare Pages
2. **Build Settings**: 
   - Build command: (leave empty for static sites)
   - Build output directory: `/` (root)
3. **Environment Variables**: Add any needed environment variables
4. **Custom Domain**: Configure the client's custom domain

## Features Included

- ✅ Responsive design (mobile-first)
- ✅ Modern CSS with Tailwind CSS
- ✅ Smooth scrolling navigation
- ✅ Contact form
- ✅ SEO optimization
- ✅ Security headers
- ✅ Performance optimization
- ✅ Accessibility features
- ✅ Social media meta tags

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Performance

- Optimized for Core Web Vitals
- Lazy loading for images
- Minimal JavaScript
- Efficient CSS
- CDN-ready static assets
