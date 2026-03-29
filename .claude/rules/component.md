---
description: Guidelines for creating and modifying Vue components.
paths: ["**/*.{vue}"]
---

# Vue Components

## Reuse

Most native HTML elements (`<table>`, `<input>`, `<button>`, `<textarea>`, etc.) have shadcn-vue replacements. Always use the shadcn-vue equivalents instead of raw HTML elements; only fall back to native elements when absolutely necessary.

When creating a new component (especially a reusable one), always check shadcn-vue first for an equivalent component (install it via tooling if needed). If shadcn-vue does not provide one, check reka-ui next and apply custom styles on top. Only build a component from scratch (placed in `components/`) as a last resort.

## Modification

Never modify the source code of components under `components/ui/` (i.e. shadcn-vue components). Override styles at the usage site with `:deep` selectors. For behavioral changes, prefer creating a wrapper component.

## Placement

- **Page-specific components**: Components with no reuse value should NOT be placed in `components/`. Instead, co-locate them alongside the `+Page.vue` or `+Layout.vue` that uses them inside the `pages/` directory.
- **`components/ui/` is reserved for shadcn-vue**: Never place custom components in `components/ui/`. Only shadcn-vue generated components belong there.
