import { chromium } from 'playwright';
const url = 'http://localhost:3000/dev/founding-preview';
console.log('Launching browser for', url);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 900 } });
try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    // Check for founding number text
    const body = await page.textContent('body');
    console.log('Body contains 創設メンバー番号:1 ?', body.includes('創設メンバー番号:1'));
    console.log('Body snippet:', body.slice(0, 500));
    await page.screenshot({ path: 'founding-preview.png', fullPage: true });
    console.log('Screenshot saved to founding-preview.png');
    // Also check specific element
    const loc = page.locator('text=創設メンバー番号:1').first();
    const count = await loc.count();
    console.log('Found loc count for 創設メンバー番号:1 =', count);
    if (count > 0) {
        const box = await loc.boundingBox();
        console.log('BoundingBox:', box);
    }
} catch (e) {
    console.error('Error:', e);
    process.exit(1);
} finally {
    await browser.close();
}
