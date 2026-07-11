const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();

  const ts = Date.now();
  const email = `dev_email_test2_${ts}@example.com`;
  console.log('EMAIL_USED=' + email);

  await page.goto('http://localhost:23600/onboarding', { waitUntil: 'networkidle' });
  await page.getByText('Sou Freelancer', { exact: true }).click();
  await page.getByRole('button', { name: /Continuar/ }).click();
  await page.waitForTimeout(300);

  const inputs = page.locator('input');
  await inputs.nth(0).fill('Dev Email Teste2');
  await inputs.nth(1).fill('111.222.333-96');
  await inputs.nth(2).fill('1995-05-20');
  await inputs.nth(3).fill('(11) 96666-5555');
  await inputs.nth(4).fill('(11) 96666-5555');
  await inputs.nth(5).fill(email);
  await inputs.nth(6).fill('SenhaForte123');
  await inputs.nth(7).fill('SenhaForte123');

  await page.getByRole('button', { name: /Criar Conta/ }).click();
  await page.waitForTimeout(1500);

  const token = await page.evaluate(() => localStorage.getItem('extragO_token'));

  const devEmail = await page.evaluate(async (t) => {
    const r = await fetch('/api/dev/last-email', { headers: { Authorization: `Bearer ${t}` } });
    return { status: r.status, body: await r.json() };
  }, token);
  console.log('=== dev/last-email full ===');
  console.log(JSON.stringify(devEmail, null, 2).slice(0, 3000));

  // extract OTP from the dev email text
  const otpMatch = devEmail.body.text.match(/(\d{6})/);
  const otpCode = otpMatch ? otpMatch[1] : null;
  console.log('EXTRACTED_OTP=' + otpCode);

  // Now confirm via the real UI OTP input on step 3
  await page.waitForTimeout(500);
  console.log('=== step3 body ===');
  console.log(await page.locator('body').innerText());

  const otpInputs = page.locator('input');
  const count = await otpInputs.count();
  console.log('otp input count', count);

  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
