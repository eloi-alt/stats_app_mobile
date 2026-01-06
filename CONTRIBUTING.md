# Contributing Guidelines

Welcome to STATS App! This document provides guidelines for contributing to the project.

---

## 📋 Table of Contents

- [Project Architecture](#project-architecture)
- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Git Workflow](#git-workflow)
- [iOS Implementation Guidelines](#ios-implementation-guidelines)
- [Accessibility Standards](#accessibility-standards)

---

## 🏗️ Project Architecture

### Prototype vs. Production

| Aspect | Prototype (Current) | Production (Target) |
|--------|---------------------|---------------------|
| **Stack** | Next.js 14 / React | Native iOS / Swift |
| **Purpose** | Design validation, feature specs | App Store release |
| **Database** | Supabase PostgreSQL | Supabase PostgreSQL |
| **3D Engine** | Three.js / React Three Fiber | Metal / SceneKit |

### Dual-Mode Architecture

The app operates in two modes:
- **🌐 Visitor Mode**: Demo data from `/data/` folder
- **🔐 Authenticated Mode**: Real data from Supabase

**Always test both modes when implementing features!**

For detailed architecture documentation, see:
- [`docs/architecture/ARCHITECTURE.md`](./docs/architecture/ARCHITECTURE.md)
- [`docs/architecture/MODES.md`](./docs/architecture/MODES.md)

---

## 🛠️ Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/stats-app.git
cd stats-app

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

Create `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

---

## 📝 Code Standards

### TypeScript

- Use strict TypeScript (`strict: true` in tsconfig.json)
- Define interfaces for all component props
- Export types from `/types/` folder

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// ❌ Bad
function Button(props: any) { ... }
```

### React Components

- Use functional components with hooks
- Place components in `/components/` following the folder structure
- One component per file

```typescript
// ✅ Good - Named export, typed props
export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

### Styling

- **Layout**: Use Tailwind CSS utility classes
- **Complex effects**: Use vanilla CSS in `/app/globals.css`
- **Animations**: Prefer Framer Motion for declarative animations

### Dual-Mode Data Hooks

When creating data hooks, always implement the dual-mode pattern:

```typescript
export function useMyData() {
  const { user } = useAuth();
  
  if (!user) {
    // VISITOR MODE: Return demo data
    return { data: DEMO_DATA, isDemo: true };
  }
  
  // AUTHENTICATED MODE: Fetch from Supabase
  // ...
}
```

---

## 🔄 Git Workflow

### Branch Naming

```
feature/short-description
fix/issue-number-description
refactor/component-name
docs/update-type
```

### Commit Messages

Use conventional commits:

```
feat: add sleep tracking modal
fix: correct avatar display in visitor mode
docs: update architecture documentation
refactor: improve hook performance
style: format code with prettier
```

### Pull Request Checklist

- [ ] Code compiles without errors (`npm run build`)
- [ ] All linting passes (`npm run lint`)
- [ ] Tested in Visitor Mode (no login)
- [ ] Tested in Authenticated Mode (with login)
- [ ] Responsive on mobile viewport (390x844)
- [ ] No console errors or warnings
- [ ] Documentation updated if needed

---

## 📱 iOS Implementation Guidelines

**Important:** The production app will be built in Swift for iOS.

When porting features from the React prototype to Swift:

### Visual Fidelity

- Match visual design exactly (colors, spacing, borders)
- Match animation curves (spring physics: stiffness 170, damping 15)
- Use SF Pro font (iOS system font)

### Performance

- Use Metal shaders for 3D (Social Sphere, globe)
- Implement SwiftUI's native gestures
- Target 120fps on ProMotion displays

### Data Types

Ensure Swift types match TypeScript interfaces:

```swift
// Match types/UserProfile.ts
struct UserProfile: Codable {
    let id: UUID
    let username: String?
    let fullName: String
    let email: String
    let avatarUrl: String?
    let harmonyScore: Double
}
```

### Supabase Integration

- Use official Supabase Swift SDK
- Implement the same RLS policies
- Keep the same table structure

---

## ♿ Accessibility Standards

Both prototype and Swift app must meet WCAG 2.1 AA:

### Required for All Components

| Criterion | Requirement |
|-----------|-------------|
| **Color Contrast** | Minimum 4.5:1 for normal text, 3:1 for large text |
| **Focus States** | Visible focus indicators for keyboard navigation |
| **ARIA Labels** | All interactive elements must have accessible names |
| **Touch Targets** | Minimum 44x44pt tap targets |

### Testing

- Test with keyboard navigation (Tab, Enter, Escape)
- Test with VoiceOver enabled
- Test with Reduce Motion enabled
- Test with larger text sizes

### Example

```tsx
<button
  aria-label="Close modal"
  onClick={onClose}
  className="focus:ring-2 focus:ring-blue-500"
>
  <XIcon aria-hidden="true" />
</button>
```

---

## 📚 Additional Resources

- [Architecture Documentation](./docs/architecture/ARCHITECTURE.md)
- [Visual Guide](./docs/guides/VISUAL_GUIDE.md)
- [Documentation Index](./docs/DOCUMENTATION_INDEX.md)

---

**Thank you for contributing! 🎉**
