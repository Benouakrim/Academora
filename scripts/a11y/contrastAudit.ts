/*
 * Automated contrast audit for AcademOra themes.
 * Uses Playwright + axe-core to check WCAG contrast across key pages
 * under both themes (default, verdant) and modes (dark, light).
 */
import { chromium, Browser, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import AxeBuilder from '@axe-core/playwright';

interface IssueSummary {
  id: string;
  impact?: string;
  description: string;
  helpUrl: string;
  nodes: number;
  themes: string[]; // e.g. ["default-dark", "verdant-light"] where issue appears
}

const OUTPUT_DIR = path.resolve(process.cwd(), 'tmp');
const REPORT_FILE = path.join(OUTPUT_DIR, 'contrast-report.json');

const BASE_URL = process.env.ACADEMORA_BASE_URL || 'http://localhost:5173';

// Representative routes to sample typography, charts, sliders, ambient backgrounds, admin pages.
const ROUTES = [
  '/',
  '/explore',
  '/careers',
  '/matching',
  '/blog',
  '/orientation',
  '/admin/theme'
];

const THEMES = ['default', 'verdant'];
const MODES = ['dark', 'light'];

async function setTheme(page: Page, theme: string, mode: string) {
  await page.addInitScript(({ theme, mode }) => {
    localStorage.setItem('ao_theme_pref', JSON.stringify({ theme, mode }));
  }, { theme, mode });
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser: Browser = await chromium.launch();
  const allIssues: IssueSummary[] = [];

  for (const theme of THEMES) {
    for (const mode of MODES) {
      const context = await browser.newContext();
      const page = await context.newPage();
      for (const route of ROUTES) {
        await setTheme(page, theme, mode);
        await page.goto(BASE_URL + route, { waitUntil: 'domcontentloaded' });
        // Allow client hydration/render
        await page.waitForTimeout(600);
        // Inject axe and run only color contrast rule
        const builder = new AxeBuilder({ page }).withRules('color-contrast');
        const results = await builder.analyze();
        for (const violation of results.violations) {
          const key = violation.id + '|' + violation.description;
          let existing = allIssues.find(i => i.id === violation.id && i.description === violation.description);
          if (!existing) {
            existing = {
              id: violation.id,
              impact: violation.impact,
              description: violation.description,
              helpUrl: violation.helpUrl,
              nodes: violation.nodes.length,
              themes: []
            };
            allIssues.push(existing);
          } else {
            existing.nodes += violation.nodes.length;
          }
          existing.themes.push(`${theme}-${mode}` + ':' + route);
        }
      }
    }
  }

  fs.writeFileSync(REPORT_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), issues: allIssues }, null, 2));
  console.log(`Contrast audit complete. Issues: ${allIssues.length}. Report: ${REPORT_FILE}`);
  await browser.close();
}

run().catch(err => {
  console.error('Contrast audit failed', err);
  process.exit(1);
});
