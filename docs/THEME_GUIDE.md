# Theme System Guide

This guide documents the multi-theme + mode system: body classes, CSS variables, and integration rules.

## Overview

- Themes: `default`, `verdant`
- Modes: `dark`, `light`
- Body classes: `theme-<name>` and `mode-<mode>` applied by `ThemeProvider`
- Scope rules: Only colors and fonts change. Do NOT change layout, spacing, radii, or animations.

## Runtime API

- Context: `src/context/ThemeContext.tsx`
  - `theme: 'default' | 'verdant'`
  - `mode: 'dark' | 'light'`
  - `setTheme(name)` and `setMode(mode)`
  - `toggleMode()`
- Persistence: LocalStorage key `ao_theme_pref`; pre-hydration script in `index.html` prevents FOUC.

## CSS Variables

Variables are defined in token files and overridden per theme/mode in `src/styles/themes.css` using `body.theme-<name>.mode-<mode>` scopes.

Key groups (overridable per theme/mode):
- Chart palette: `--chart-color-1..6`, `--chart-grid`, `--chart-axis`, `--chart-tick`
- Sliders: `--slider-track`, `--slider-progress-academic`, `--slider-progress-budget`
- Ambient/decor: `--ambient-color-1..4`
- Heatmap/status: `--heatmap-best`, `--heatmap-good`, `--heatmap-caution`, `--heatmap-risk`
- Badges: `--badge-positive-bg`, `--badge-negative-bg`, `--badge-neutral-bg`

## Component Integration

- Charts: Use CSS variables for `fill`, `stroke`, and grid/axis/tick colors. Example in `ComparisonCharts.tsx`.
- Sliders: Use linear-gradient with `--slider-*` variables for track/progress.
- Decorative backgrounds: Use `--ambient-*` variables for radial orbs.
- Semantic statuses: Use `--heatmap-*` variables for categorical color logic.

## Allowed Exceptions

- Brand assets (e.g., Google login SVG) may keep vendor colors.
- Performance-centric inline styles for dimensions/transforms are allowed, but avoid color literals.

## Admin Theme Control

- Page: `src/pages/admin/ThemeSettingsPage.tsx` lets admins pick the site theme and preferred mode.
- Users can still toggle dark/light mode via the public toggle (Navbar/Footer).

## Accessibility

- Ensure text vs background contrast meets WCAG AA minimums. Run the contrast audit task after visual QA.

## Migration Tips

- Replace hex arrays with `var(--chart-color-*)`.
- If you need new semantic colors, add variables in `themes.css` and wire defaults in the baseline scope.
- Keep layout unchanged; do not modify border radius, spacing, or shadows unless existing tokens already control them.
