"""
Glassmorphism UI System for QiLife-Eos
Frosted glass cards, glowing interactive buttons, and modern glass aesthetic
"""

from __future__ import annotations

import json
import logging
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)

class GlassEffect(Enum):
    """Glass effect types"""
    FROSTED = "frosted"
    CRYSTAL = "crystal"
    SMOKED = "smoked"
    MIRROR = "mirror"
    TRANSLUCENT = "translucent"

class GlowEffect(Enum):
    """Glow effect types"""
    NEON = "neon"
    SOFT = "soft"
    PULSE = "pulse"
    RADIANT = "radiant"
    AURORA = "aurora"

@dataclass
class GlassmorphismTheme:
    """Glassmorphism theme configuration"""
    name: str
    background: str = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    glass_background: str = "rgba(255, 255, 255, 0.1)"
    glass_border: str = "rgba(255, 255, 255, 0.2)"
    glass_shadow: str = "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
    backdrop_blur: str = "blur(16px)"
    text_primary: str = "#ffffff"
    text_secondary: str = "rgba(255, 255, 255, 0.8)"
    accent_color: str = "#00d4ff"
    glow_color: str = "#00d4ff"
    border_radius: str = "16px"
    transition: str = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"

class GlassmorphismUI:
    """Glassmorphism UI component system"""
    
    def __init__(self):
        self.themes = {
            "default": GlassmorphismTheme("default"),
            "ocean": GlassmorphismTheme(
                "ocean",
                background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                accent_color="#00d4ff",
                glow_color="#00d4ff"
            ),
            "sunset": GlassmorphismTheme(
                "sunset",
                background="linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)",
                accent_color="#ff6b6b",
                glow_color="#ff6b6b"
            ),
            "aurora": GlassmorphismTheme(
                "aurora",
                background="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                accent_color="#00d4ff",
                glow_color="#00d4ff"
            ),
            "midnight": GlassmorphismTheme(
                "midnight",
                background="linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
                glass_background="rgba(255, 255, 255, 0.05)",
                accent_color="#3498db",
                glow_color="#3498db"
            )
        }
        self.current_theme = "default"
    
    def get_theme(self, theme_name: str = None) -> GlassmorphismTheme:
        """Get theme configuration"""
        theme_name = theme_name or self.current_theme
        return self.themes.get(theme_name, self.themes["default"])
    
    def generate_card_styles(self, theme_name: str = None, effect: GlassEffect = GlassEffect.FROSTED) -> Dict[str, str]:
        """Generate glassmorphism card styles"""
        theme = self.get_theme(theme_name)
        
        base_styles = {
            "background": theme.glass_background,
            "backdrop-filter": theme.backdrop_blur,
            "border": f"1px solid {theme.glass_border}",
            "border-radius": theme.border_radius,
            "box-shadow": theme.glass_shadow,
            "padding": "24px",
            "transition": theme.transition,
            "position": "relative",
            "overflow": "hidden"
        }
        
        # Add effect-specific styles
        if effect == GlassEffect.CRYSTAL:
            base_styles.update({
                "background": "rgba(255, 255, 255, 0.15)",
                "backdrop-filter": "blur(20px)",
                "border": "1px solid rgba(255, 255, 255, 0.3)"
            })
        elif effect == GlassEffect.SMOKED:
            base_styles.update({
                "background": "rgba(0, 0, 0, 0.1)",
                "backdrop-filter": "blur(12px)",
                "border": "1px solid rgba(255, 255, 255, 0.1)"
            })
        elif effect == GlassEffect.MIRROR:
            base_styles.update({
                "background": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                "backdrop-filter": "blur(24px)",
                "border": "1px solid rgba(255, 255, 255, 0.4)"
            })
        
        return base_styles
    
    def generate_button_styles(self, theme_name: str = None, glow_effect: GlowEffect = GlowEffect.NEON) -> Dict[str, str]:
        """Generate glowing button styles"""
        theme = self.get_theme(theme_name)
        
        base_styles = {
            "background": "rgba(255, 255, 255, 0.1)",
            "backdrop-filter": "blur(10px)",
            "border": f"1px solid {theme.glass_border}",
            "border-radius": "12px",
            "padding": "12px 24px",
            "color": theme.text_primary,
            "font-weight": "600",
            "cursor": "pointer",
            "transition": theme.transition,
            "position": "relative",
            "overflow": "hidden"
        }
        
        # Add glow effect styles
        if glow_effect == GlowEffect.NEON:
            base_styles.update({
                "box-shadow": f"0 0 20px {theme.glow_color}, inset 0 0 20px rgba(0, 212, 255, 0.1)",
                "text-shadow": f"0 0 10px {theme.glow_color}"
            })
        elif glow_effect == GlowEffect.SOFT:
            base_styles.update({
                "box-shadow": f"0 4px 15px rgba(0, 212, 255, 0.3)"
            })
        elif glow_effect == GlowEffect.PULSE:
            base_styles.update({
                "animation": "pulse-glow 2s infinite",
                "box-shadow": f"0 0 20px {theme.glow_color}"
            })
        elif glow_effect == GlowEffect.RADIANT:
            base_styles.update({
                "box-shadow": f"0 0 30px {theme.glow_color}, 0 0 60px rgba(0, 212, 255, 0.3)"
            })
        elif glow_effect == GlowEffect.AURORA:
            base_styles.update({
                "background": "linear-gradient(45deg, rgba(0,212,255,0.2), rgba(255,255,255,0.1))",
                "box-shadow": f"0 0 25px {theme.glow_color}"
            })
        
        return base_styles
    
    def generate_dashboard_styles(self, theme_name: str = None) -> Dict[str, str]:
        """Generate dashboard container styles"""
        theme = self.get_theme(theme_name)
        
        return {
            "background": theme.background,
            "min-height": "100vh",
            "padding": "24px",
            "font-family": "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            "color": theme.text_primary
        }
    
    def generate_navigation_styles(self, theme_name: str = None) -> Dict[str, str]:
        """Generate navigation bar styles"""
        theme = self.get_theme(theme_name)
        
        return {
            "background": "rgba(255, 255, 255, 0.1)",
            "backdrop-filter": "blur(20px)",
            "border-bottom": f"1px solid {theme.glass_border}",
            "padding": "16px 24px",
            "position": "sticky",
            "top": "0",
            "z-index": "1000"
        }
    
    def generate_modal_styles(self, theme_name: str = None) -> Dict[str, str]:
        """Generate modal overlay and content styles"""
        theme = self.get_theme(theme_name)
        
        overlay_styles = {
            "background": "rgba(0, 0, 0, 0.5)",
            "backdrop-filter": "blur(8px)",
            "position": "fixed",
            "top": "0",
            "left": "0",
            "right": "0",
            "bottom": "0",
            "display": "flex",
            "align-items": "center",
            "justify-content": "center",
            "z-index": "10000"
        }
        
        content_styles = {
            "background": "rgba(255, 255, 255, 0.15)",
            "backdrop-filter": "blur(24px)",
            "border": f"1px solid {theme.glass_border}",
            "border-radius": "20px",
            "padding": "32px",
            "max-width": "500px",
            "width": "90%",
            "box-shadow": "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        }
        
        return {
            "overlay": overlay_styles,
            "content": content_styles
        }
    
    def generate_form_styles(self, theme_name: str = None) -> Dict[str, str]:
        """Generate form input styles"""
        theme = self.get_theme(theme_name)
        
        return {
            "background": "rgba(255, 255, 255, 0.1)",
            "backdrop-filter": "blur(10px)",
            "border": f"1px solid {theme.glass_border}",
            "border-radius": "12px",
            "padding": "12px 16px",
            "color": theme.text_primary,
            "font-size": "16px",
            "transition": theme.transition,
            "outline": "none"
        }
    
    def generate_animation_css(self) -> str:
        """Generate CSS animations for glassmorphism effects"""
        return """
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px var(--glow-color); }
            50% { box-shadow: 0 0 30px var(--glow-color), 0 0 40px rgba(0, 212, 255, 0.5); }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        .glass-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(31, 38, 135, 0.5);
        }
        
        .glow-button {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glow-button:hover {
            transform: scale(1.05);
            box-shadow: 0 0 30px var(--glow-color);
        }
        
        .glass-input:focus {
            border-color: var(--accent-color);
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
        }
        """
    
    def generate_react_components(self) -> Dict[str, str]:
        """Generate React component templates"""
        return {
            "GlassCard": """
import React from 'react';
import './Glassmorphism.css';

interface GlassCardProps {
  children: React.ReactNode;
  theme?: string;
  effect?: 'frosted' | 'crystal' | 'smoked' | 'mirror';
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  theme = 'default',
  effect = 'frosted',
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`glass-card glass-${effect} theme-${theme} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
""",
            "GlowButton": """
import React from 'react';
import './Glassmorphism.css';

interface GlowButtonProps {
  children: React.ReactNode;
  theme?: string;
  glowEffect?: 'neon' | 'soft' | 'pulse' | 'radiant' | 'aurora';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  theme = 'default',
  glowEffect = 'neon',
  className = '',
  onClick,
  disabled = false
}) => {
  return (
    <button 
      className={`glow-button glow-${glowEffect} theme-${theme} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
""",
            "GlassInput": """
import React from 'react';
import './Glassmorphism.css';

interface GlassInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  theme?: string;
  className?: string;
  type?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  placeholder,
  value,
  onChange,
  theme = 'default',
  className = '',
  type = 'text'
}) => {
  return (
    <input
      type={type}
      className={`glass-input theme-${theme} ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
};
""",
            "GlassModal": """
import React from 'react';
import './Glassmorphism.css';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  theme?: string;
  className?: string;
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  children,
  theme = 'default',
  className = ''
}) => {
  if (!isOpen) return null;

  return (
    <div className={`glass-modal-overlay theme-${theme}`} onClick={onClose}>
      <div 
        className={`glass-modal-content theme-${theme} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
"""
        }
    
    def generate_css_styles(self, theme_name: str = None) -> str:
        """Generate complete CSS styles for glassmorphism"""
        theme = self.get_theme(theme_name)
        
        return f"""
        :root {{
            --background: {theme.background};
            --glass-background: {theme.glass_background};
            --glass-border: {theme.glass_border};
            --glass-shadow: {theme.glass_shadow};
            --backdrop-blur: {theme.backdrop_blur};
            --text-primary: {theme.text_primary};
            --text-secondary: {theme.text_secondary};
            --accent-color: {theme.accent_color};
            --glow-color: {theme.glow_color};
            --border-radius: {theme.border_radius};
            --transition: {theme.transition};
        }}
        
        * {{
            box-sizing: border-box;
        }}
        
        body {{
            margin: 0;
            padding: 0;
            background: var(--background);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: var(--text-primary);
            min-height: 100vh;
        }}
        
        /* Glass Card Styles */
        .glass-card {{
            background: var(--glass-background);
            backdrop-filter: var(--backdrop-blur);
            border: 1px solid var(--glass-border);
            border-radius: var(--border-radius);
            box-shadow: var(--glass-shadow);
            padding: 24px;
            transition: var(--transition);
            position: relative;
            overflow: hidden;
        }}
        
        .glass-card::before {{
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            transition: left 0.5s;
        }}
        
        .glass-card:hover::before {{
            left: 100%;
        }}
        
        /* Glow Button Styles */
        .glow-button {{
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 12px 24px;
            color: var(--text-primary);
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            position: relative;
            overflow: hidden;
            font-size: 16px;
        }}
        
        .glow-button:hover {{
            transform: scale(1.05);
            box-shadow: 0 0 30px var(--glow-color);
        }}
        
        .glow-button:active {{
            transform: scale(0.95);
        }}
        
        /* Glow Effects */
        .glow-neon {{
            box-shadow: 0 0 20px var(--glow-color), inset 0 0 20px rgba(0, 212, 255, 0.1);
            text-shadow: 0 0 10px var(--glow-color);
        }}
        
        .glow-soft {{
            box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
        }}
        
        .glow-pulse {{
            animation: pulse-glow 2s infinite;
            box-shadow: 0 0 20px var(--glow-color);
        }}
        
        .glow-radiant {{
            box-shadow: 0 0 30px var(--glow-color), 0 0 60px rgba(0, 212, 255, 0.3);
        }}
        
        .glow-aurora {{
            background: linear-gradient(45deg, rgba(0,212,255,0.2), rgba(255,255,255,0.1));
            box-shadow: 0 0 25px var(--glow-color);
        }}
        
        /* Glass Input Styles */
        .glass-input {{
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 12px 16px;
            color: var(--text-primary);
            font-size: 16px;
            transition: var(--transition);
            outline: none;
            width: 100%;
        }}
        
        .glass-input::placeholder {{
            color: var(--text-secondary);
        }}
        
        .glass-input:focus {{
            border-color: var(--accent-color);
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
        }}
        
        /* Modal Styles */
        .glass-modal-overlay {{
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(8px);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }}
        
        .glass-modal-content {{
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(24px);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 32px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }}
        
        /* Navigation Styles */
        .glass-nav {{
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--glass-border);
            padding: 16px 24px;
            position: sticky;
            top: 0;
            z-index: 1000;
        }}
        
        /* Dashboard Grid */
        .glass-dashboard {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
            padding: 24px;
            max-width: 1200px;
            margin: 0 auto;
        }}
        
        /* Responsive Design */
        @media (max-width: 768px) {{
            .glass-dashboard {{
                grid-template-columns: 1fr;
                padding: 16px;
            }}
            
            .glass-card {{
                padding: 16px;
            }}
            
            .glass-modal-content {{
                padding: 24px;
                margin: 16px;
            }}
        }}
        
        /* Animations */
        {self.generate_animation_css()}
        """
    
    def generate_dashboard_template(self, theme_name: str = None) -> str:
        """Generate a complete dashboard template"""
        theme = self.get_theme(theme_name)
        
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QiLife-Eos Glassmorphism Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        {self.generate_css_styles(theme_name)}
    </style>
</head>
<body>
    <nav class="glass-nav">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">QiLife-Eos</h1>
            <div style="display: flex; gap: 16px;">
                <button class="glow-button glow-neon">Dashboard</button>
                <button class="glow-button glow-soft">Apps</button>
                <button class="glow-button glow-pulse">Settings</button>
            </div>
        </div>
    </nav>
    
    <div class="glass-dashboard">
        <div class="glass-card">
            <h2 style="margin-top: 0; color: var(--accent-color);">RAG System</h2>
            <p style="color: var(--text-secondary);">Advanced retrieval-augmented generation with multimodal capabilities.</p>
            <button class="glow-button glow-neon" style="margin-top: 16px;">Launch RAG</button>
        </div>
        
        <div class="glass-card">
            <h2 style="margin-top: 0; color: var(--accent-color);">Document Sync</h2>
            <p style="color: var(--text-secondary);">Seamless Dropbox integration for document management.</p>
            <button class="glow-button glow-soft" style="margin-top: 16px;">Sync Files</button>
        </div>
        
        <div class="glass-card">
            <h2 style="margin-top: 0; color: var(--accent-color);">3D Visualization</h2>
            <p style="color: var(--text-secondary);">Interactive 3D document embeddings visualization.</p>
            <button class="glow-button glow-radiant" style="margin-top: 16px;">View 3D</button>
        </div>
        
        <div class="glass-card">
            <h2 style="margin-top: 0; color: var(--accent-color);">AR Experience</h2>
            <p style="color: var(--text-secondary);">Augmented reality document exploration.</p>
            <button class="glow-button glow-aurora" style="margin-top: 16px;">Start AR</button>
        </div>
    </div>
    
    <script>
        // Add interactive effects
        document.querySelectorAll('.glass-card').forEach(card => {{
            card.addEventListener('mouseenter', () => {{
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 20px 40px rgba(31, 38, 135, 0.5)';
            }});
            
            card.addEventListener('mouseleave', () => {{
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = 'var(--glass-shadow)';
            }});
        }});
        
        document.querySelectorAll('.glow-button').forEach(button => {{
            button.addEventListener('click', () => {{
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {{
                    button.style.transform = 'scale(1.05)';
                }}, 150);
            }});
        }});
    </script>
</body>
</html>
"""

# Global glassmorphism UI instance
glassmorphism_ui = GlassmorphismUI()
