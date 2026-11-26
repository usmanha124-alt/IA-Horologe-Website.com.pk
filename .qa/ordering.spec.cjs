const { test, expect } = require('@playwright/test');

test('complete ordering workflow without sending WhatsApp', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('http://127.0.0.1:4173/shop', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });

  await expect(page.locator('article.product-card')).toHaveCount(4);
  await page.locator('article.product-card').first().locator('button.add-button').click();
  await page.waitForFunction(() => localStorage.getItem('ia-horologe-cart')?.includes('Rihl Eau de Parfum') === true);
  await page.goto('http://127.0.0.1:4173/cart', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await expect(page.locator('.cart-item')).toHaveCount(1);
  await expect(page.locator('.cart-badge')).toHaveText('1');

  await page.locator('.cart-item').first().locator('.quantity button').nth(1).click();
  await expect(page.locator('.cart-item .quantity strong')).toHaveText('2');
  await page.locator('.cart-item').first().locator('.quantity button').nth(0).click();
  await expect(page.locator('.cart-item .quantity strong')).toHaveText('1');

  await page.locator('.order-summary .gold-button').click();
  await page.getByLabel('Full Name').fill('QA Test Customer');
  await page.getByLabel('Phone Number').fill('03001234567');
  await page.getByLabel('Email Address').fill('qa@example.com');
  await page.getByLabel('City').fill('Lahore');
  await page.getByLabel('Complete Delivery Address').fill('Test Address 123, Lahore');
  await page.getByLabel('Additional Notes').fill('QA test only');

  const popupPromise = page.waitForEvent('popup', { timeout: 30000 });
  await page.locator('.order-summary .gold-button').click();
  const popup = await popupPromise;
  const popupUrl = popup.url();

  expect(popupUrl).toContain('923001074308');
  const decoded = decodeURIComponent(popupUrl.replace(/\+/g, ' '));
  expect(decoded).toContain('IA HOROLOGE - NEW ORDER');
  expect(decoded).toContain('QA Test Customer');
  expect(decoded).toContain('qa@example.com');
  expect(decoded).toContain('03001234567');
  expect(decoded).toContain('Test Address 123, Lahore');
  expect(decoded).toContain('Rihl Eau de Parfum');
  expect(decoded).toContain('Quantity: 1');
  expect(decoded).toContain('Rs. 2,800');
  expect(decoded).toContain('Grand Total: Rs. 2,800');
  await popup.close();

  await expect(page.locator('.order-confirmation')).toContainText('Thank you, QA Test Customer');
  await expect(page.locator('.confirmation-warning')).toContainText('Press SEND');
  await expect(page.locator('.confirmation-id')).toContainText('IAH-');
  await expect(page.locator('.confirmation-card')).toContainText('Your complete order has been prepared');
  console.log('ORDER_QA_PASS', popupUrl);
});
