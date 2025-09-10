#!/usr/bin/env python3
"""
Site Stamper - QiEOS Template-Based Site Generator

This script stamps sites from the template directory to client directories,
replacing tokens with site-specific content and themes.

Usage:
    python site_stamper.py <site_slug> [--force]
    
Example:
    python site_stamper.py codyricevelasquez
    python site_stamper.py empowerqnow --force
"""

import os
import sys
import shutil
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

# Site configurations
SITE_CONFIGS = {
    "codyricevelasquez": {
        "SITE_TITLE": "Cody Rice-Velasquez",
        "SITE_TAGLINE": "Builder of calm systems in a chaotic world.",
        "SITE_KEYWORDS": "developer, python, cloudflare, supabase, react, tailwind, ai, rag",
        "PRIMARY_HEX": "#0EA5E9",
        "ACCENT_HEX": "#A78BFA", 
        "BG_GRADIENT": "linear-gradient(120deg,#0ea5e91a,#a78bfa1a)",
        "CANONICAL_URL": "https://cody.qially.com",
        "SITE_SLUG": "codyricevelasquez",
        "ABOUT_TEXT": "Full-stack developer specializing in Python, Cloudflare Workers, and modern web technologies. I build scalable systems that just work.",
        "CONTACT_EMAIL": "cody@example.com",
        "CONTACT_PHONE": "+1 (555) 123-4567",
        "CONTACT_ADDRESS": "San Francisco, CA"
    },
    "empowerqnow": {
        "SITE_TITLE": "EmpowerQNow",
        "SITE_TAGLINE": "Shadow + Light = Whole.",
        "SITE_KEYWORDS": "spiritual, book, shadow work, light work, healing, transformation",
        "PRIMARY_HEX": "#7C3AED",
        "ACCENT_HEX": "#22D3EE",
        "BG_GRADIENT": "radial-gradient(circle at 20% 10%,#7c3aed22,transparent 40%), radial-gradient(circle at 80% 80%,#22d3ee22,transparent 40%)",
        "CANONICAL_URL": "https://empowerqnow.qially.com",
        "SITE_SLUG": "empowerqnow",
        "ABOUT_TEXT": "A spiritual journey through shadow and light work, offering transformative insights and practical wisdom for personal growth.",
        "CONTACT_EMAIL": "hello@empowerqnow.com",
        "CONTACT_PHONE": "+1 (555) 987-6543",
        "CONTACT_ADDRESS": "Los Angeles, CA"
    },
    "qsaysit": {
        "SITE_TITLE": "Q Says It",
        "SITE_TAGLINE": "Unfiltered, unapologetic, unusually useful.",
        "SITE_KEYWORDS": "podcast, unfiltered, truth, business, life, advice",
        "PRIMARY_HEX": "#111827",
        "ACCENT_HEX": "#06B6D4",
        "BG_GRADIENT": "linear-gradient(180deg,#000000,#111827)",
        "CANONICAL_URL": "https://qsaysit.qially.com",
        "SITE_SLUG": "qsaysit",
        "ABOUT_TEXT": "Raw conversations about business, life, and everything in between. No filters, no BS, just real talk.",
        "CONTACT_EMAIL": "q@qsaysit.com",
        "CONTACT_PHONE": "+1 (555) 456-7890",
        "CONTACT_ADDRESS": "Austin, TX"
    },
    "tu_angela": {
        "SITE_TITLE": "Tu Angela",
        "SITE_TAGLINE": "Come curious. Leave wanting more.",
        "SITE_KEYWORDS": "adult, exclusive, premium, content, 18+",
        "PRIMARY_HEX": "#8B0000",
        "ACCENT_HEX": "#A855F7",
        "BG_GRADIENT": "linear-gradient(135deg,#0b0b0b 0%,#210c1f 100%)",
        "CANONICAL_URL": "https://tuangela.qially.com",
        "SITE_SLUG": "tu_angela",
        "ABOUT_TEXT": "Exclusive content for discerning adults. Tasteful, elegant, and unforgettable experiences await.",
        "CONTACT_EMAIL": "angela@tuangela.com",
        "CONTACT_PHONE": "+1 (555) 321-0987",
        "CONTACT_ADDRESS": "Miami, FL"
    },
    "casteneda-flooring": {
        "SITE_TITLE": "Casteneda Flooring",
        "SITE_TAGLINE": "Floors you'll love to live on.",
        "SITE_KEYWORDS": "flooring, hardwood, laminate, vinyl, tile, installation, contractor",
        "PRIMARY_HEX": "#3B82F6",
        "ACCENT_HEX": "#F59E0B",
        "BG_GRADIENT": "linear-gradient(120deg,#f8fafc,#eef2ff)",
        "CANONICAL_URL": "https://casteneda.qially.com",
        "SITE_SLUG": "casteneda-flooring",
        "ABOUT_TEXT": "Professional flooring installation and repair services. We transform your space with quality materials and expert craftsmanship.",
        "CONTACT_EMAIL": "info@castenedaflooring.com",
        "CONTACT_PHONE": "+1 (555) 654-3210",
        "CONTACT_ADDRESS": "Phoenix, AZ"
    },
    "zjk-resource": {
        "SITE_TITLE": "Welcome Hub",
        "SITE_TAGLINE": "Practical help for a fresh start.",
        "SITE_KEYWORDS": "immigration, newcomer, resources, housing, jobs, health, education, support",
        "PRIMARY_HEX": "#0EA5E9",
        "ACCENT_HEX": "#10B981",
        "BG_GRADIENT": "linear-gradient(180deg,#ecfeff,#f0fdf4)",
        "CANONICAL_URL": "https://zjk.qially.com",
        "SITE_SLUG": "zjk-resource",
        "ABOUT_TEXT": "Comprehensive resources for newcomers to help with immigration, housing, employment, healthcare, and education.",
        "CONTACT_EMAIL": "help@zjkresource.org",
        "CONTACT_PHONE": "+1 (555) 789-0123",
        "CONTACT_ADDRESS": "New York, NY"
    }
}

def get_current_date():
    """Get current date in YYYY-MM-DD format."""
    return datetime.now().strftime("%Y-%m-%d")

def backup_existing_site(site_path: Path) -> Path:
    """Backup existing site to .trash directory."""
    if not site_path.exists():
        return None
        
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    trash_dir = Path(".trash") / "sites" / site_path.name / timestamp
    trash_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy existing site to trash
    shutil.copytree(site_path, trash_dir / site_path.name)
    print(f"✅ Backed up existing site to {trash_dir}")
    return trash_dir

def copy_template_files(template_dir: Path, site_dir: Path):
    """Copy all template files to site directory."""
    site_dir.mkdir(parents=True, exist_ok=True)
    
    for file_path in template_dir.iterdir():
        if file_path.is_file():
            shutil.copy2(file_path, site_dir / file_path.name)
            print(f"📄 Copied {file_path.name}")

def replace_tokens_in_file(file_path: Path, tokens: Dict[str, str]):
    """Replace tokens in a file with actual values."""
    if not file_path.exists():
        return
        
    content = file_path.read_text(encoding='utf-8')
    
    # Add current date token
    tokens["CURRENT_DATE"] = get_current_date()
    
    # Replace all tokens
    for token, value in tokens.items():
        content = content.replace(f"{{{{{token}}}}}", str(value))
    
    file_path.write_text(content, encoding='utf-8')
    print(f"🔄 Updated tokens in {file_path.name}")

def create_readme(site_dir: Path, site_slug: str, config: Dict[str, Any]):
    """Create a README file for the stamped site."""
    readme_content = f"""# {config['SITE_TITLE']}

**Site Slug:** {site_slug}  
**URL:** {config['CANONICAL_URL']}  
**Generated:** {get_current_date()}

## What Changed
- Stamped from template with {config['SITE_TITLE']} branding
- Applied {config['PRIMARY_HEX']} primary color theme
- Updated all content tokens and metadata
- Configured for Cloudflare Pages deployment

## Next Steps
1. Review and customize content in `index.html`
2. Add custom favicon if needed
3. Deploy to Cloudflare Pages with root directory: `sites/clients/_qsites/{site_slug}`
4. Configure custom domain: {config['CANONICAL_URL']}

## Files Generated
- `index.html` - Main site content
- `_headers` - Security and caching headers
- `_redirects` - URL redirects
- `sitemap.xml` - SEO sitemap
- `robots.txt` - Search engine directives
- `wrangler.toml` - Cloudflare Pages configuration
- `favicon.ico` - Site icon
- `setup-client.sh` / `setup-client.bat` - Deployment scripts
"""
    
    readme_path = site_dir / "README.md"
    readme_path.write_text(readme_content, encoding='utf-8')
    print(f"📝 Created README.md")

def stamp_site(site_slug: str, force: bool = False):
    """Main function to stamp a site from template."""
    if site_slug not in SITE_CONFIGS:
        print(f"❌ Error: Unknown site slug '{site_slug}'")
        print(f"Available sites: {', '.join(SITE_CONFIGS.keys())}")
        return False
    
    # Set up paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    template_dir = project_root / "sites" / "_templatesites"
    site_dir = project_root / "sites" / "clients" / "_qsites" / site_slug
    
    print(f"🏗️  Stamping site: {site_slug}")
    print(f"📁 Template: {template_dir}")
    print(f"📁 Target: {site_dir}")
    
    # Check if site already exists
    if site_dir.exists() and not force:
        print(f"⚠️  Site directory already exists: {site_dir}")
        print("Use --force to overwrite existing site")
        return False
    
    # Backup existing site if it exists
    if site_dir.exists():
        backup_existing_site(site_dir)
        shutil.rmtree(site_dir)
    
    # Copy template files
    copy_template_files(template_dir, site_dir)
    
    # Get site configuration
    config = SITE_CONFIGS[site_slug]
    
    # Replace tokens in all files
    for file_path in site_dir.iterdir():
        if file_path.is_file() and file_path.suffix in ['.html', '.xml', '.txt', '.toml']:
            replace_tokens_in_file(file_path, config)
    
    # Create README
    create_readme(site_dir, site_slug, config)
    
    print(f"✅ Successfully stamped site: {site_slug}")
    print(f"🌐 Site URL: {config['CANONICAL_URL']}")
    print(f"📂 Site directory: {site_dir}")
    
    return True

def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python site_stamper.py <site_slug> [--force]")
        print(f"Available sites: {', '.join(SITE_CONFIGS.keys())}")
        return
    
    site_slug = sys.argv[1]
    force = "--force" in sys.argv
    
    success = stamp_site(site_slug, force)
    if success:
        print("\n🎉 Site stamping completed successfully!")
    else:
        print("\n❌ Site stamping failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
