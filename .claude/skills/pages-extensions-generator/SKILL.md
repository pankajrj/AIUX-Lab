---
name: pages-extensions-generator
description: Creates AIUX extension pages that overlay a host application using Karuna's nested layouts framework (STRY64337616). Use when building extension pages in src/extensions/ — for standalone application pages in applications/*/pages/, use aiux-build instead.
metadata:
  author: servicenow
  version: '1.0.0'
  relatedStory: STRY64337616
compatibility: Works with Claude Code, Cursor, VS Code Copilot, Windsurf
license: MIT
---

# Creating AIUX Extension Pages

Extend an existing AIUX application with overlay pages using nested layouts (STRY64337616 — Lorenzo Mendes), without modifying host application code. To scaffold a standalone application page under `applications/*/pages/` instead, use the **aiux-build** skill.

## Quick Start

### Extension Pages (Convention 1: scope + basename)

```bash
mkdir -p src/extensions/<host-scope>/<host-basename>/pages/<route>
# Example:
mkdir -p src/extensions/sn_app_aict_ui/aict/pages/home

# Copy template
cp assets/application-page-template.js src/extensions/sn_app_aict_ui/aict/pages/home/page.js
```

**Key:** Extension pages use `page.js` (not `index.js`). Route derived from directory path.

## Path Conventions

### Extension Pages: Two Formats

**Convention 1** (scope + basename — familiar):

```
src/extensions/<host-scope>/<host-basename>/pages/<route>/page.js
src/extensions/sn_app_aict_ui/aict/pages/home/page.js
```

**Convention 2** (direct sys_id — explicit):

```
src/extensions/<experience-sys_id>/pages/<route>/page.js
src/extensions/2f86ed94fdab96a806bbbb5b8573c5d5/pages/home/page.js
```

Both formats are discovered identically. A single project can target multiple hosts by mixing conventions.

## Full Documentation

For comprehensive guides, see:

- **docs/arch-pages.md** — Page architecture, routing, SSR patterns
- **docs/arch-header-config.md** — Toolbar, L3 tabs, metadata configuration
- **docs/adr/application-extensions.md** — Extension framework design rationale
- **docs/onboarding/10-application-development/08-extensibility/** — Extension developer guide

## Templates

Use the templates in `assets/`:

- **application-page-template.js** — Page component with loader
- **loader-template.js** — Data fetching module
- **layout-override-template.js** — Custom layout for extensions

Replace placeholders and implement your logic.

## Key Concepts

- **Pages = Lit web components** extending `AIUXElement`
- **Loaders = SSR data fetching** via `static async loader(ctx)`
- **Layouts = nested inheritance** with per-level most-specific-wins precedence
- **Extensions = overlay pages** on host applications without modifying host code

## Related Horizon Design Knowledge Skills

| Skill                | Relationship                                                                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| accessibility        | Required: extension pages render real UI (HTML structure, CSS, interactive elements) and must comply with WCAG 2.2 AA — ARIA labeling, keyboard navigation, and SSR-safe focus management |
| internationalization | Required: all user-visible strings in page/loader templates must use `i18n.getMessage()` — never hardcoded English                                                                        |

## When to Use This Skill

- Building extension pages in `src/extensions/`
- Implementing page loaders for SSR
- Setting up custom layouts for extensions
- When user mentions "create extension page", "add extension page", "extend page", "extension page layout"
- Not for standalone application pages in `applications/*/pages/` — use the **aiux-build** skill for that
