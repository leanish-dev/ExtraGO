const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  page.on('response', async res => {
    if (res.url().includes('verify-email/confirm')) {
      console.log('[response confirm]', res.status());
      try { console.log(await res.text()); } catch {}
    }
  });

  const ts = Date.now();
  const email = `dev_email_test3_${ts}@example.com`;
  console.log('EMAIL_USED=' + email);

  await page.goto('http://localhost:23600/onboarding', { waitUntil: 'networkidle' });
  await page.getByText('Sou Freelancer', { exact: true }).click();
  await page.getByRole('button', { name: /Continuar/ }).click();
  await page.waitForTimeout(300);

  const inputs = page.locator('input');
  await inputs.nth(0).fill('Dev Email Teste3');
  await inputs.nth(1).fill('222.333.444-05');
  await inputs.nth(2).fill('1995-05-20');
  await inputs.nth(3).fill('(11) 95555-4444');
  await inputs.nth(4).fill('(11) 95555-4444');
  await inputs.nth(5).fill(email);
  await inputs.nth(6).fill('SenhaForte123');
  await inputs.nth(7).fill('SenhaForte123');

  await page.getByRole('button', { name: /Criar Conta/ }).click();
  await page.waitForTimeout(1500);

  const token = await page.evaluate(() => localStorage.getItem('extragO_token'));
  const devEmail = await page.evaluate(async (t) => {
    const r = await fetch('/api/dev/last-email', { headers: { Authorization: `Bearer ${t}` } });
    return await r.json();
  }, token);
  const otpCode = devEmail.text.match(/(\d{6})/)[1];
  console.log('EXTRACTED_OTP=' + otpCode);

  // fill OTP in the UI
  const otpInput = page.locator('input').first();
  await otpInput.fill(otpCode);
  await page.getByRole('button', { name: /Confirmar e-mail/ }).click();
  await page.waitForTimeout(1500);

  console.log('=== body after confirm ===');
  console.log(await page.locator('body').innerText());

  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
