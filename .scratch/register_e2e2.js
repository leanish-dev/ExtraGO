const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('[browser]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('[pageerror]', err.message));
  page.on('response', async res => {
    if (res.url().includes('/api/auth/register')) {
      console.log('[response register]', res.status());
      try { console.log(await res.text()); } catch {}
    }
  });

  const ts = Date.now();
  const email = `ui_freelancer_${ts}@example.com`;
  console.log('EMAIL_USED=' + email);

  await page.goto('http://localhost:23600/onboarding', { waitUntil: 'networkidle' });
  await page.getByText('Sou Freelancer', { exact: true }).click();
  await page.getByRole('button', { name: /Continuar/ }).click();
  await page.waitForTimeout(300);

  const inputs = page.locator('input');
  // order: Nome Completo, CPF, Data Nasc, Telefone, WhatsApp, E-mail, Senha, Confirmar Senha
  await inputs.nth(0).fill('Freelancer UI Teste');
  await inputs.nth(1).fill('123.456.789-09');
  await inputs.nth(2).fill('1995-05-20');
  await inputs.nth(3).fill('(11) 98888-7777');
  await inputs.nth(4).fill('(11) 98888-7777');
  await inputs.nth(5).fill(email);
  await inputs.nth(6).fill('SenhaForte123');
  await inputs.nth(7).fill('SenhaForte123');

  await page.screenshot({ path: '/tmp/step2_filled.png' });

  await page.getByRole('button', { name: /Criar Conta/ }).click();
  await page.waitForTimeout(2500);

  console.log('URL after submit:', page.url());
  console.log('=== body after submit ===');
  console.log(await page.locator('body').innerText());
  await page.screenshot({ path: '/tmp/step3.png' });

  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
