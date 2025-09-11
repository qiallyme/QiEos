#!/bin/bash

# Client Site Setup Script
# Usage: ./setup-client.sh "Client Name" "client-email@example.com" "555-123-4567" "123 Main St, City, State"

if [ $# -ne 4 ]; then
    echo "Usage: $0 \"Client Name\" \"client-email@example.com\" \"555-123-4567\" \"123 Main St, City, State\""
    exit 1
fi

CLIENT_NAME="$1"
CLIENT_EMAIL="$2"
CLIENT_PHONE="$3"
CLIENT_ADDRESS="$4"

# Create URL-friendly slug
CLIENT_NAME_SLUG=$(echo "$CLIENT_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
CLIENT_URL="https://$CLIENT_NAME_SLUG.com"
CLIENT_DESCRIPTION="Professional services by $CLIENT_NAME"
CLIENT_KEYWORDS="$CLIENT_NAME, professional services, business"
CLIENT_ABOUT_TEXT="We are a professional service provider dedicated to delivering exceptional results for our clients. With years of experience and a commitment to excellence, we help businesses achieve their goals."
CURRENT_DATE=$(date +%Y-%m-%d)

echo "Setting up client site for: $CLIENT_NAME"
echo "Slug: $CLIENT_NAME_SLUG"
echo "URL: $CLIENT_URL"

# Replace placeholders in index.html
sed -i.bak \
    -e "s/{{CLIENT_NAME}}/$CLIENT_NAME/g" \
    -e "s/{{CLIENT_DESCRIPTION}}/$CLIENT_DESCRIPTION/g" \
    -e "s/{{CLIENT_KEYWORDS}}/$CLIENT_KEYWORDS/g" \
    -e "s|{{CLIENT_URL}}|$CLIENT_URL|g" \
    -e "s/{{CLIENT_ABOUT_TEXT}}/$CLIENT_ABOUT_TEXT/g" \
    -e "s/{{CLIENT_EMAIL}}/$CLIENT_EMAIL/g" \
    -e "s/{{CLIENT_PHONE}}/$CLIENT_PHONE/g" \
    -e "s/{{CLIENT_ADDRESS}}/$CLIENT_ADDRESS/g" \
    index.html

# Replace placeholders in wrangler.toml
sed -i.bak \
    -e "s/{{CLIENT_NAME_SLUG}}/$CLIENT_NAME_SLUG/g" \
    wrangler.toml

# Replace placeholders in sitemap.xml
sed -i.bak \
    -e "s|{{CLIENT_URL}}|$CLIENT_URL|g" \
    -e "s/{{CURRENT_DATE}}/$CURRENT_DATE/g" \
    sitemap.xml

# Clean up backup files
rm -f *.bak

echo "✅ Client site setup complete!"
echo "📁 Files updated: index.html, wrangler.toml, sitemap.xml"
echo "🚀 Ready for deployment to Cloudflare Pages"
echo ""
echo "Next steps:"
echo "1. Review and customize the content in index.html"
echo "2. Add client logo and images"
echo "3. Update services section with actual offerings"
echo "4. Deploy to Cloudflare Pages"
