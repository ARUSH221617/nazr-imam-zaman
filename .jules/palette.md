## 2025-02-19 - Standardizing Dropdown Interaction
**Learning:** Custom `div`-based dropdowns often miss critical accessibility features (keyboard nav, focus management). Refactoring to use Radix/Shadcn primitives provides these "for free" and ensures a consistent experience.
**Action:** Always prefer `DropdownMenu` or `Select` components from the design system over custom toggle implementations for menu-like interactions.
