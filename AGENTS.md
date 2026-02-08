# Agent Development Guidelines

## Project Overview

This is a Next.js 16 spiritual platform for Islamic prayers and devotion to Imam Mahdi, built with TypeScript, Tailwind CSS, and shadcn/ui components. The application supports Persian (Farsi), Arabic, and English languages with RTL support.

## Development Commands

### Core Commands
```bash
# Development server (runs on port 3000)
bun run dev

# Production build
bun run build

# Start production server
bun run start

# Linting
bun run lint
```

### Environment Setup Notes
```bash
# Remove lock files if environment setup is blocked
rm prisma/migrations/migration_lock.toml
rm bun.lock
rm package-lock.json

# Install dependencies
bun install

# If bun run dev fails with --hostname because of tee piping, run:
bunx next dev -p 3000 --hostname 0.0.0.0
```

### Database Commands (Prisma)
```bash
# Push schema to database
bun run db:push

# Generate Prisma client
bun run db:generate

# Run migrations
bun run db:migrate

# Reset database
bun run db:reset
```

### Testing
No test framework is currently configured. To add testing:
1. Choose a framework (Jest, Vitest, etc.)
2. Add test scripts to package.json
3. Single test command pattern: `bun test -- --testNamePattern="SpecificTest"`

## Code Style Guidelines

### Import Organization
```typescript
// 1. React and Next.js imports
import React, { useState, useEffect } from 'react'
import { NextResponse } from 'next/server'
import type { Metadata } from 'next'

// 2. Third-party libraries
import { Button } from '@/components/ui/button'
import { cva, type VariantProps } from 'class-variance-authority'

// 3. Internal imports (use @/ alias)
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
```

### TypeScript Configuration
- Strict mode enabled but `noImplicitAny` is set to `false`
- Path alias `@/*` maps to `./src/*`
- JSX: `react-jsx` transform
- Target: ES2017

### Component Patterns

#### Functional Components
```typescript
'use client' // For client components

interface ComponentProps {
  // Define props with TypeScript
}

export default function ComponentName({ prop }: ComponentProps) {
  // Component logic
  return <div>JSX</div>
}
```

#### shadcn/ui Components
- Use class-variance-authority (cva) for variants
- Export both component and variants
- Use `cn()` utility for className merging
- Follow Radix UI patterns for accessibility

#### Custom Hooks
```typescript
interface HookReturn {
  // Return type interface
}

export const useCustomHook = (): HookReturn => {
  // Hook logic
  return { /* return values */ }
}
```

### Styling Guidelines

#### Tailwind CSS
- Use CSS variables for theme colors (defined in tailwind.config.ts)
- Follow component-driven styling approach
- Use `cn()` utility for conditional classes
- Responsive design: mobile-first approach (`md:`, `lg:` prefixes)

#### Typography
- Persian/Arabic text: `fontFamily: 'var(--font-vazirmatn)'`
- Religious Arabic text: `fontFamily: 'var(--font-kitab)'`
- English/Latin text: `fontFamily: 'var(--font-inter)'`

#### Color Scheme
- Primary: teal/cyan gradient palette
- Use semantic color tokens: `primary`, `secondary`, `muted`, `destructive`
- Background/foreground colors for dark/light mode support

### Internationalization
- Use `useLanguage` hook for translations
- Support Persian (fa), Arabic (ar), English (en)
- RTL support: use `dir` attribute from language context
- Translation keys follow dot notation: `t.home.salawat.title`

### File Structure
```
src/
├── app/                 # Next.js app router pages
├── components/
│   ├── ui/             # shadcn/ui components
│   └── [feature]/      # Feature-specific components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/
│   ├── translations/   # i18n files
│   ├── utils.ts        # Utility functions
│   └── db.ts          # Database configuration
```

### ESLint Configuration
- TypeScript and React rules are heavily relaxed
- Most linting rules are disabled (`prefer-const`, `no-unused-vars`, etc.)
- Focus on Next.js specific rules when applicable
- Custom rules can be added as needed

### Naming Conventions
- Components: PascalCase with descriptive names
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case or PascalCase for components
- Interfaces: Prefix with `I` or use descriptive names

### Error Handling
- Use try-catch blocks for async operations
- Implement proper error boundaries for React components
- Use toast notifications (Sonner) for user feedback
- API routes should return appropriate HTTP status codes

### Performance Considerations
- Use `useMemo` and `useCallback` for expensive computations
- Implement proper loading states
- Optimize images with Next.js Image component
- Use React.lazy() for code splitting when appropriate

### Git Workflow
- No automatic commits - only commit when explicitly requested
- Use conventional commit messages
- Run lint before committing: `bun run lint`
- Ensure build passes before deployment: `bun run build`

### Security Best Practices
- Never commit secrets or API keys
- Use environment variables for configuration
- Validate user inputs with Zod schemas
- Implement proper authentication/authorization for protected routes

### Development Tips
- Use the `cn()` utility for conditional styling
- Leverage TypeScript for better type safety
- Follow existing component patterns before creating new ones
- Test RTL functionality when working with internationalization
- Use the language context for any text that needs translation
