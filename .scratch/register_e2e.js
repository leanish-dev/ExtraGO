const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('[browser]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('[pageerror]', err.message));

  const ts = Date.now();
  const email = `ui_freelancer_${ts}@example.com`;

  await page.goto('http://localhost:23600/onboarding', { waitUntil: 'networkidle' });

  // Step 1: choose Freelancer
  await page.getByText('Sou Freelancer', { exact: true }).click();
  await page.getByRole('button', { name: /Continuar/ }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/step2.png' });
  console.log('=== step2 body ===');
  console.log(await page.locator('body').innerText());

  // Step 2: fill basic data (freelancer branch)
  const labels = await page.locator('label').allTextContents();
  console.log('labels:', labels);

  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
