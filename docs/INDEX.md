# Documentation Index

## New / Updated Theme System Files
- `src/context/ThemeContext.tsx` – Provides `ThemeProvider`, `useTheme()` for theme & mode management.
- `src/styles/themes.css` – Theme/mode scoped CSS variable overrides (colors only).
- `src/components/ThemeModeToggle.tsx` – Public dark/light mode toggle component.
- `src/pages/admin/ThemeSettingsPage.tsx` – Admin-only page to select active theme & preferred mode.
- `index.html` – Pre-hydration script applying persisted theme/mode + admin override.
- `docs/THEME_GUIDE.md` – Detailed guide for theme architecture, variables, and integration.
- `docs/DESIGN_SYSTEM_GUIDE.md` – Extended with Theming section.

## Related Variables (see `themes.css`)
Chart: `--chart-color-1..6`, `--chart-grid`, `--chart-axis`, `--chart-tick`
Sliders: `--slider-track`, `--slider-progress-academic`, `--slider-progress-budget`
Ambient: `--ambient-color-1..4`
Heatmap: `--heatmap-best`, `--heatmap-good`, `--heatmap-caution`, `--heatmap-risk`
Badges: `--badge-positive-bg`, `--badge-negative-bg`, `--badge-neutral-bg`

## Migration Status
Most major interactive pages now consume variables. Remaining to audit: PricingPage decorative gradients, any residual hard-coded chart stroke colors.

## Follow-ups
- Contrast audit for verdant light/dark.
- Cross-browser var() verification.
- Theme tests (persistence + body class application).
- Known issues entry documenting brand color exceptions.
