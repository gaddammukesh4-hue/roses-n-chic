import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE = 'https://roses-n-chic.vercel.app';
const pages = ['/', '/atelier', '/collections', '/policies/privacy', '/policies/terms', '/policies/shipping', '/policies/returns', '/account'];

const watchdog = setTimeout(() => { console.log('WATCHDOG'); process.exit(1); }, 90000);
watchdog.unref?.();

const browser = await chromium.launch();
const context = await browser.newContext();
for (const path of pages) {
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page }).analyze();
    const violations = results.violations;
    console.log(`\n=== ${path} === ${violations.length} violation type(s)`);
    for (const v of violations) {
      console.log(`  [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} node(s))`);
      for (const n of v.nodes.slice(0, 2)) console.log(`    - ${n.target.join(' ')}`);
    }
  } catch (e) {
    console.log(`\n=== ${path} === ERROR: ${e.message}`);
  } finally {
    await page.close();
  }
}
await browser.close();
console.log('\naudit complete');
