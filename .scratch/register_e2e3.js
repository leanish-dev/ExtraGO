const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  page.on('response', async res => {
    if (res.url().includes('/api/auth/register') || res.url().includes('/api/dev/last-email') || res.url().includes('verify-email')) {
      console.log('[response]', res.request().method(), res.url(), res.status());
      try { console.log(await res.text()); } catch {}
    }
  });

  const ts = Date.now();
  const email = `dev_email_test_${ts}@example.com`;
  console.log('EMAIL_USED=' + email);

  await page.goto('http://localhost:23600/onboarding', { waitUntil: 'networkidle' });
  await page.getByText('Sou Freelancer', { exact: true }).click();
  await page.getByRole('button', { name: /Continuar/ }).click();
  await page.waitForTimeout(300);

  const inputs = page.locator('input');
  await inputs.nth(0).fill('Dev Email Teste');
  await inputs.nth(1).fill('987.654.321-00');
  await inputs.nth(2).fill('1995-05-20');
  await inputs.nth(3).fill('(11) 97777-6666');
  await inputs.nth(4).fill('(11) 97777-6666');
  await inputs.nth(5).fill(email);
  await inputs.nth(6).fill('SenhaForte123');
  await inputs.nth(7).fill('SenhaForte123');

  await page.getByRole('button', { name: /Criar Conta/ }).click();
  await page.waitForTimeout(2000);

  console.log('=== body after submit ===');
  console.log(await page.locator('body').innerText());

  // Now hit the dev-only last-email endpoint using the stored token in localStorage
  const token = await page.evaluate(() => localStorage.getItem('extragO_token'));
  const apiRes = await page.evaluate(async (t) => {
    const r = await fetch('/api/dev/last-email', { headers: { Authorization: `Bearer ${t}` } });
    return { status: r.status, body: await r.text() };
  }, token);
  console.log('=== dev/last-email ===', JSON.stringify(apiRes));

  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
