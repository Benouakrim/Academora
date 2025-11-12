# Known Issues (Theme System)

- Brand SVGs (e.g., Google sign-in logo in `LoginPage.tsx`) use vendor colors by requirement. These are allowed exceptions.
- Some pages may still pass color arrays directly (e.g., decorative `AnimatedBackground` usages). We are progressively migrating them to CSS variables; if you see hex values, replace with the `--chart-color-*` or `--ambient-color-*` variables.
- Chart libraries (Recharts) accept CSS variable color strings for `stroke`/`fill`, but ensure your variables resolve in computed styles. If a color appears black, verify the body `theme-*` and `mode-*` classes are present.
- Contrast in verdant light mode: verify all text on `--color-bg-secondary` meets WCAG AA, especially subtle tints for grid/ticks.
- User-provided content (e.g., images with embedded colors) is outside theme control.
