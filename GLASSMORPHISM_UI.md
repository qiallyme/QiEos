# Glassmorphism UI System for QiLife-Eos

A stunning glassmorphism design system featuring frosted glass cards, glowing interactive buttons, and modern glass aesthetic components.

## 🎨 **Features**

- **Frosted Glass Cards**: Beautiful translucent cards with backdrop blur effects
- **Glowing Interactive Buttons**: Multiple glow effects (neon, soft, pulse, radiant, aurora)
- **Multiple Themes**: Ocean, sunset, aurora, midnight, and custom themes
- **Responsive Design**: Works perfectly on all devices
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **React Components**: Ready-to-use React component templates

## 🌈 **Available Themes**

### 1. **Default Theme**
- Background: Purple gradient
- Accent: Cyan blue (#00d4ff)
- Perfect for modern applications

### 2. **Ocean Theme**
- Background: Blue to purple gradient
- Accent: Cyan blue (#00d4ff)
- Calm and professional

### 3. **Sunset Theme**
- Background: Red to yellow to blue gradient
- Accent: Coral red (#ff6b6b)
- Warm and energetic

### 4. **Aurora Theme**
- Background: Mint to pink gradient
- Accent: Cyan blue (#00d4ff)
- Soft and dreamy

### 5. **Midnight Theme**
- Background: Dark blue gradient
- Accent: Blue (#3498db)
- Dark and sophisticated

## 🎯 **Glass Effects**

### 1. **Frosted Glass** (Default)
- Semi-transparent background
- Medium backdrop blur
- Subtle borders

### 2. **Crystal Glass**
- Higher transparency
- Strong backdrop blur
- Bright borders

### 3. **Smoked Glass**
- Darker background
- Light backdrop blur
- Subtle borders

### 4. **Mirror Glass**
- Gradient background
- Strong backdrop blur
- Reflective borders

## ✨ **Glow Effects**

### 1. **Neon Glow**
- Bright, intense glow
- Text shadow effects
- Perfect for primary actions

### 2. **Soft Glow**
- Subtle, gentle glow
- Soft shadows
- Great for secondary actions

### 3. **Pulse Glow**
- Animated pulsing effect
- Continuous glow animation
- Attention-grabbing

### 4. **Radiant Glow**
- Multi-layered glow
- Intense light effects
- Premium feel

### 5. **Aurora Glow**
- Gradient background
- Colorful glow effects
- Unique and modern

## 🚀 **Quick Start**

### 1. **Basic HTML Usage**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Glassmorphism Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* Include the generated CSS styles */
        /* You can get this from /ui/styles endpoint */
    </style>
</head>
<body>
    <nav class="glass-nav">
        <h1>QiLife-Eos</h1>
        <button class="glow-button glow-neon">Dashboard</button>
    </nav>
    
    <div class="glass-dashboard">
        <div class="glass-card">
            <h2>RAG System</h2>
            <p>Advanced AI-powered document processing</p>
            <button class="glow-button glow-neon">Launch</button>
        </div>
    </div>
</body>
</html>
```

### 2. **React Components**

```jsx
import React from 'react';
import { GlassCard, GlowButton, GlassInput, GlassModal } from './components';

const Dashboard = () => {
  return (
    <div className="glass-dashboard">
      <GlassCard theme="ocean" effect="frosted">
        <h2>RAG System</h2>
        <p>Advanced AI-powered document processing</p>
        <GlowButton glowEffect="neon" onClick={() => console.log('Clicked!')}>
          Launch RAG
        </GlowButton>
      </GlassCard>
      
      <GlassCard theme="sunset" effect="crystal">
        <h2>Document Sync</h2>
        <p>Seamless file synchronization</p>
        <GlowButton glowEffect="pulse" onClick={() => console.log('Sync!')}>
          Sync Files
        </GlowButton>
      </GlassCard>
    </div>
  );
};
```

## 📡 **API Endpoints**

### 1. **Get Dashboard HTML**
```http
GET /ui/dashboard?theme=ocean
Authorization: Bearer <token>
```

### 2. **Get CSS Styles**
```http
GET /ui/styles?theme=default
```

### 3. **Get React Components**
```http
GET /ui/components
```

### 4. **Get Available Themes**
```http
GET /ui/themes
```

### 5. **Get Card Styles**
```http
GET /ui/card-styles?theme=ocean&effect=frosted
```

### 6. **Get Button Styles**
```http
GET /ui/button-styles?theme=ocean&glow_effect=neon
```

## 🎨 **CSS Classes**

### **Glass Cards**
```css
.glass-card              /* Base glass card */
.glass-card.glass-frosted /* Frosted glass effect */
.glass-card.glass-crystal /* Crystal glass effect */
.glass-card.glass-smoked  /* Smoked glass effect */
.glass-card.glass-mirror  /* Mirror glass effect */
```

### **Glow Buttons**
```css
.glow-button              /* Base glow button */
.glow-button.glow-neon    /* Neon glow effect */
.glow-button.glow-soft    /* Soft glow effect */
.glow-button.glow-pulse   /* Pulse glow effect */
.glow-button.glow-radiant /* Radiant glow effect */
.glow-button.glow-aurora  /* Aurora glow effect */
```

### **Form Elements**
```css
.glass-input              /* Glass input field */
.glass-modal-overlay      /* Modal overlay */
.glass-modal-content      /* Modal content */
.glass-nav                /* Navigation bar */
```

## 🎯 **Usage Examples**

### 1. **Dashboard Layout**

```html
<div class="glass-dashboard">
    <!-- RAG System Card -->
    <div class="glass-card">
        <h2 style="color: var(--accent-color);">RAG System</h2>
        <p style="color: var(--text-secondary);">
            Advanced retrieval-augmented generation with multimodal capabilities.
        </p>
        <button class="glow-button glow-neon">Launch RAG</button>
    </div>
    
    <!-- Document Sync Card -->
    <div class="glass-card">
        <h2 style="color: var(--accent-color);">Document Sync</h2>
        <p style="color: var(--text-secondary);">
            Seamless Dropbox integration for document management.
        </p>
        <button class="glow-button glow-soft">Sync Files</button>
    </div>
    
    <!-- 3D Visualization Card -->
    <div class="glass-card">
        <h2 style="color: var(--accent-color);">3D Visualization</h2>
        <p style="color: var(--text-secondary);">
            Interactive 3D document embeddings visualization.
        </p>
        <button class="glow-button glow-radiant">View 3D</button>
    </div>
</div>
```

### 2. **Form with Glassmorphism**

```html
<div class="glass-card">
    <h2>Login</h2>
    <form>
        <input 
            type="email" 
            class="glass-input" 
            placeholder="Email address"
        />
        <input 
            type="password" 
            class="glass-input" 
            placeholder="Password"
        />
        <button class="glow-button glow-neon" type="submit">
            Sign In
        </button>
    </form>
</div>
```

### 3. **Modal with Glassmorphism**

```html
<div class="glass-modal-overlay">
    <div class="glass-modal-content">
        <h2>Settings</h2>
        <p>Configure your application preferences.</p>
        <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button class="glow-button glow-soft">Cancel</button>
            <button class="glow-button glow-neon">Save</button>
        </div>
    </div>
</div>
```

## 🎨 **Customization**

### 1. **Custom Theme**

```python
from glassmorphism_ui import GlassmorphismTheme

custom_theme = GlassmorphismTheme(
    name="custom",
    background="linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)",
    accent_color="#ff6b6b",
    glow_color="#ff6b6b"
)

glassmorphism_ui.themes["custom"] = custom_theme
```

### 2. **Custom CSS Variables**

```css
:root {
    --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --glass-background: rgba(255, 255, 255, 0.1);
    --glass-border: rgba(255, 255, 255, 0.2);
    --accent-color: #00d4ff;
    --glow-color: #00d4ff;
    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.8);
}
```

## 📱 **Responsive Design**

The glassmorphism system is fully responsive:

- **Desktop**: Full grid layout with multiple columns
- **Tablet**: Adjusted grid with fewer columns
- **Mobile**: Single column layout with optimized spacing

```css
@media (max-width: 768px) {
    .glass-dashboard {
        grid-template-columns: 1fr;
        padding: 16px;
    }
    
    .glass-card {
        padding: 16px;
    }
}
```

## 🎭 **Animations**

### 1. **Hover Effects**
- Cards lift up on hover
- Buttons scale and glow
- Smooth transitions

### 2. **Click Effects**
- Buttons scale down on click
- Ripple effects
- Immediate feedback

### 3. **Loading States**
- Pulse animations
- Shimmer effects
- Smooth transitions

## 🔧 **Integration with Modular Architecture**

The glassmorphism UI system integrates seamlessly with the modular architecture:

```python
# Generate UI configuration for orchestrated mode
ui_config = modular_arch.get_orchestrated_ui_config("tenant-123")

# Apply glassmorphism styling
for component in ui_config:
    component["styles"] = glassmorphism_ui.generate_card_styles(
        theme="ocean",
        effect=GlassEffect.FROSTED
    )
```

## 🎨 **Best Practices**

### 1. **Theme Consistency**
- Use the same theme across all components
- Maintain consistent accent colors
- Ensure proper contrast ratios

### 2. **Performance**
- Use CSS transforms for animations
- Minimize backdrop-filter usage on mobile
- Optimize for 60fps animations

### 3. **Accessibility**
- Ensure sufficient color contrast
- Provide focus indicators
- Support keyboard navigation

### 4. **Browser Support**
- Modern browsers with backdrop-filter support
- Graceful fallbacks for older browsers
- Progressive enhancement

## 🚀 **Getting Started**

1. **Install Dependencies**
   ```bash
   pip install fastapi uvicorn
   ```

2. **Start the Server**
   ```bash
   python -m uvicorn app.main:app --reload
   ```

3. **Access the Dashboard**
   ```
   http://localhost:8000/ui/dashboard?theme=ocean
   ```

4. **Get CSS Styles**
   ```
   http://localhost:8000/ui/styles?theme=ocean
   ```

## 🎯 **Examples**

### **Complete Dashboard Example**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QiLife-Eos Glassmorphism Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* Include the generated CSS from /ui/styles endpoint */
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
</body>
</html>
```

This glassmorphism UI system provides a stunning, modern interface for your QiLife-Eos modular architecture with beautiful frosted glass effects, glowing interactive buttons, and smooth animations! ✨
