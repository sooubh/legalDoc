# LegalEase AI - Theme & Styling Documentation

## Table of Contents

1. [Theme System Overview](#theme-system-overview)
2. [Color System](#color-system)
3. [CSS Custom Properties](#css-custom-properties)
4. [Tailwind Configuration](#tailwind-configuration)
5. [Component Styling Patterns](#component-styling-patterns)
6. [Animation System](#animation-system)
7. [Responsive Design](#responsive-design)
8. [Typography](#typography)
9. [Spacing & Layout](#spacing--layout)
10. [Accessibility](#accessibility)

---

## Theme System Overview

LegalEase AI uses a semantic, token-based theming system built on CSS custom properties (CSS variables) with Tailwind CSS utility classes.

### Key Principles
- **Semantic Naming**: Colors named by purpose, not appearance
- **Theme Consistency**: All colors reference CSS variables
- **No Hardcoded Colors**: Zero `#hex` or `rgb()` values in components
- **Dark Mode Support**: Complete light/dark theme coverage
- **Easy Customization**: Change entire theme by updating CSS variables

### Theme Toggle
Located in the sidebar (desktop) and settings (mobile):
```typescript
const toggleTheme = () => {
  const html = document.documentElement;
  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
};
```

---

## Color System

### Semantic Color Tokens

All colors are defined as HSL (Hue, Saturation, Lightness) values for better control and consistency.

#### Light Mode Palette

```css
:root {
  --background: 0 0% 100%;        /* Pure white */
  --foreground: 222.2 84% 4.9%;   /* Dark blue-gray */
  
  --card: 0 0% 100%;              /* White */
  --card-foreground: 222.2 84% 4.9%;
  
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  
  --primary: 221.2 83.2% 53.3%;   /* Vibrant blue */
  --primary-foreground: 210 40% 98%;
  
  --secondary: 210 40% 96.1%;     /* Light gray-blue */
  --secondary-foreground: 222.2 47.4% 11.2%;
  
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  
  --destructive: 0 84.2% 60.2%;   /* Red for errors */
  --destructive-foreground: 210 40% 98%;
  
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;      /* Focus ring */
  
  --radius: 0.5rem;               /* Border radius */
}
```

#### Dark Mode Palette

```css
.dark {
  --background: 222.2 84% 4.9%;   /* Deep blue-black */
  --foreground: 210 40% 98%;      /* Off-white */
  
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  
  --primary: 217.2 91.2% 59.8%;   /* Lighter blue */
  --primary-foreground: 222.2 47.4% 11.2%;
  
  --secondary: 217.2 32.6% 17.5%; /* Dark blue-gray */
  --secondary-foreground: 210 40% 98%;
  
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  
  --destructive: 0 62.8% 30.6%;   /* Darker red */
  --destructive-foreground: 210 40% 98%;
  
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}
```

### Color Usage Guidelines

#### Background Colors
```tsx
// Main background
className="bg-background"

// Card/panel backgrounds
className="bg-card"

// Popover/dropdown backgrounds
className="bg-popover"

// Secondary backgrounds
className="bg-secondary"

// Muted backgrounds
className="bg-muted"

// Accent backgrounds (hover states)
className="bg-accent"
```

#### Text Colors
```tsx
// Primary text
className="text-foreground"

// Card text
className="text-card-foreground"

// Primary colored text
className="text-primary"

// Secondary text
className="text-secondary-foreground"

// Muted/helper text
className="text-muted-foreground"

// Destructive/error text
className="text-destructive"
```

#### Border Colors
```tsx
// Standard borders
className="border border-border"

// Input borders
className="border border-input"

// Focus ring (outline)
className="focus:ring-2 focus:ring-ring"
```

---

## CSS Custom Properties

### Defining Custom Properties

**Location**: `src/index.css`

```css
@layer base {
  :root {
    /* Light mode colors */
  }
  
  .dark {
    /* Dark mode colors */
  }
}
```

### Using Custom Properties

#### In CSS
```css
.my-component {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  border-color: hsl(var(--border));
}
```

#### In Tailwind Classes
```tsx
className="bg-background text-foreground border-border"
```

#### With Opacity
```tsx
// 90% opacity
className="bg-primary/90"

// In custom CSS
background-color: hsl(var(--primary) / 0.9);
```

---

## Tailwind Configuration

**Location**: `tailwind.config.js`

### Dark Mode Strategy
```javascript
export default {
  darkMode: "class",  // Use class-based dark mode
  // ...
}
```

### Extended Colors
```javascript
theme: {
  extend: {
    colors: {
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      secondary: {
        DEFAULT: "hsl(var(--secondary))",
        foreground: "hsl(var(--secondary-foreground))",
      },
      destructive: {
        DEFAULT: "hsl(var(--destructive))",
        foreground: "hsl(var(--destructive-foreground))",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
      popover: {
        DEFAULT: "hsl(var(--popover))",
        foreground: "hsl(var(--popover-foreground))",
      },
      card: {
        DEFAULT: "hsl(var(--card))",
        foreground: "hsl(var(--card-foreground))",
      },
    },
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
    },
  },
}
```

### Custom Plugins
```javascript
plugins: [
  function ({ addUtilities }) {
    addUtilities({
      '.bg-card': { backgroundColor: 'hsl(var(--card))' },
      '.text-card-foreground': { color: 'hsl(var(--card-foreground))' },
    });
  },
],
```

---

## Component Styling Patterns

### Card Component
```tsx
<div className="bg-card text-card-foreground rounded-2xl shadow border border-border p-4 md:p-6">
  {/* Card content */}
</div>
```

### Button Variants

#### Primary Button
```tsx
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
  Primary Action
</button>
```

#### Secondary Button
```tsx
<button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors">
  Secondary Action
</button>
```

#### Destructive Button
```tsx
<button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors">
  Delete
</button>
```

#### Ghost Button
```tsx
<button className="text-foreground hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md transition-colors">
  Cancel
</button>
```

#### Outline Button
```tsx
<button className="border border-input bg-transparent hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md transition-colors">
  Outline
</button>
```

### Input Fields
```tsx
<input
  className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
  type="text"
  placeholder="Enter text..."
/>
```

### Modal/Popover
```tsx
<div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="bg-card text-card-foreground rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-border">
    {/* Modal content */}
  </div>
</div>
```

---

## Animation System

### Framer Motion Animations

#### Page Transitions
```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
  transition={{ duration: 0.2 }}
>
  {pageContent}
</motion.div>
```

#### Modal Animations
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  {modalContent}
</motion.div>
```

#### Slide Animations
```tsx
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>
```

### CSS Animations

#### Fade In/Out
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

#### Slide Animations
```css
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
```

#### Pulse Animation
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.typing-indicator {
  animation: pulse 1.5s ease-in-out infinite;
}
```

#### Fade In Up (for progressive loading)
```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out forwards;
}
```

### Transition Classes
```tsx
// Color transitions
className="transition-colors duration-200"

// All transitions
className="transition-all duration-300"

// Transform transitions
className="transition-transform duration-200 hover:scale-105"
```

---

## Responsive Design

### Breakpoints
Tailwind default breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Responsive Patterns

#### Mobile-First Approach
```tsx
<div className="flex flex-col md:flex-row lg:grid lg:grid-cols-2">
  {/* Stacked on mobile, row on tablet, grid on desktop */}
</div>
```

#### Responsive Spacing
```tsx
<div className="p-4 md:p-6 lg:p-8">
  {/* More padding on larger screens */}
</div>
```

#### Responsive Typography
```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  {/* Larger text on larger screens */}
</h1>
```

#### Responsive Display
```tsx
<div className="hidden md:block">
  {/* Desktop only */}
</div>

<div className="block md:hidden">
  {/* Mobile only */}
</div>
```

#### Responsive Sidebar
```tsx
// Desktop: Fixed sidebar
// Mobile: Bottom navigation
<aside className="hidden lg:block fixed left-0 top-0 h-full w-64">
  {/* Desktop sidebar */}
</aside>

<nav className="lg:hidden fixed bottom-0 left-0 right-0">
  {/* Mobile bottom nav */}
</nav>
```

---

## Typography

### Font Family
```css
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}
```

### Font Sizes
Tailwind default scale:
- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px)
- `text-lg`: 1.125rem (18px)
- `text-xl`: 1.25rem (20px)
- `text-2xl`: 1.5rem (24px)
- `text-3xl`: 1.875rem (30px)
- `text-4xl`: 2.25rem (36px)

### Font Weights
- `font-normal`: 400
- `font-medium`: 500
- `font-semibold`: 600
- `font-bold`: 700

### Line Heights
- `leading-tight`: 1.25
- `leading-normal`: 1.5
- `leading-relaxed`: 1.625

### Headings
```tsx
<h1 className="text-3xl md:text-4xl font-bold text-foreground">
<h2 className="text-2xl md:text-3xl font-semibold text-foreground">
<h3 className="text-xl md:text-2xl font-semibold text-foreground">
<h4 className="text-lg md:text-xl font-medium text-foreground">
```

### Body Text
```tsx
<p className="text-base text-foreground leading-relaxed">
<p className="text-sm text-muted-foreground">
```

---

## Spacing & Layout

### Container
```tsx
<div className="container mx-auto px-4 md:px-6 lg:px-8">
  {/* Responsive container */}
</div>
```

### Grid Layouts
```tsx
// Two columns on desktop
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

// Three columns with responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Auto-fit grid
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
```

### Flexbox Layouts
```tsx
// Center content
<div className="flex items-center justify-center min-h-screen">

// Space between
<div className="flex items-center justify-between">

// Vertical stack
<div className="flex flex-col space-y-4">

// Horizontal row
<div className="flex flex-row space-x-4">
```

### Spacing Scale
- `space-1`: 0.25rem (4px)
- `space-2`: 0.5rem (8px)
- `space-3`: 0.75rem (12px)
- `space-4`: 1rem (16px)
- `space-6`: 1.5rem (24px)
- `space-8`: 2rem (32px)

---

## Accessibility

### Focus States
All interactive elements have visible focus indicators:
```tsx
<button className="focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none">
  Button
</button>
```

### ARIA Labels
```tsx
<button aria-label="Close modal" onClick={onClose}>
  <XIcon />
</button>
```

### Semantic HTML
```tsx
<nav aria-label="Main navigation">
  <ul>
    <li><a href="#section">Section</a></li>
  </ul>
</nav>
```

### Keyboard Navigation
- All interactive elements keyboard accessible
- Tab order follows visual flow
- Escape key closes modals
- Arrow keys navigate lists

### Color Contrast
- All text meets WCAG AA standards
- Minimum 4.5:1 contrast for normal text
- Minimum 3:1 contrast for large text

### Screen Reader Support
- Meaningful alt text for images
- Hidden labels for icon-only buttons
- Live regions for dynamic content
- Skip links for main content

---

## Custom Styles

### Scrollbar Hiding
```css
/* Hide scrollbar globally */
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

*::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

/* Hide scrollbar utility class */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

### Chat Gradients
```css
.centered-chatbot {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 50%, #faf5ff 100%);
}

.centered-chatbot.dark {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%);
}
```

### Gradient Buttons
```css
.gradient-button {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  transition: all 0.2s ease-in-out;
}

.gradient-button:hover {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}
```

---

_For component-specific styling examples, see [COMPONENTS.md](./COMPONENTS.md). For architecture overview, see [ARCHITECTURE.md](./ARCHITECTURE.md)._
