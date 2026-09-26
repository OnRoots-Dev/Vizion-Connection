import { chromium } from 'playwright';
const email = 'tumtragym622@gmail.com';
const password = 'TempTest123!@#';
const baseUrl = 'http://localhost:3000';
console.log('Starting verification for id=2 (shoma_trampwall) BASE and OG referral');
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

try {
    // Step 1: Go to login page to establish context
    console.log('Navigating to login...');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    console.log('Login page loaded, performing login via fetch...');
    // Perform login via fetch from page context (with correct Origin)
    const loginResult = await page.evaluate(async ({email, password}) => {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'same-origin'
        });
        const data = await res.json().catch(()=>({}));
        return { status: res.status, data, headers: Object.fromEntries(res.headers.entries()) };
    }, {email, password});
    console.log('Login result status:', loginResult.status);
    console.log('Login data:', JSON.stringify(loginResult.data).slice(0, 500));
    if (!loginResult.data.success) {
        console.error('Login failed, cannot proceed to /base');
        // try to show page content for debugging
        const content = await page.content();
        console.log(content.slice(0, 1000));
        throw new Error('Login failed');
    }
    console.log('Login succeeded, navigating to /base...');
    // Now go to /base
    await page.goto(`${baseUrl}/base`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    // Check for founding number text
    const bodyText = await page.textContent('body');
    const hasFounding1 = bodyText.includes('創設メンバー番号:1') || bodyText.includes('創設メンバー番号: 1') || bodyText.includes('創設メンバー番号:1');
    console.log('Body contains 創設メンバー番号:1 ?', hasFounding1);
    console.log('Body snippet:', bodyText.slice(0, 1200));
    // Screenshot BASE
    await page.screenshot({ path: 'base-id2.png', fullPage: true });
    console.log('Screenshot saved to base-id2.png');
    // Also try to locate the specific element
    const loc = page.locator('text=創設メンバー番号:1').first();
    const count = await loc.count();
    console.log('Locator count for 創設メンバー番号:1', count);
    if (count>0) {
        const box = await loc.boundingBox();
        console.log('BoundingBox for founding number:', box);
    } else {
        console.log('WARNING: 創設メンバー番号:1 not found in /base');
        // dump HTML for debugging
        const html = await page.content();
        console.log(html.slice(0, 2000));
    }

    // Step 2: Check OG referral image
    console.log('Navigating to OG referral image for shoma_trampwall...');
    const ogUrl = `${baseUrl}/api/og/referral?ref=shoma_trampwall`;
    // OG returns image/png, we can fetch and check headers, and also screenshot via page goto
    // Use page to goto ogUrl and screenshot (it will render as image)
    await page.goto(ogUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);
    // The OG endpoint returns an image, not HTML, so page content will be an image element
    // Try to screenshot the page (should be image)
    await page.screenshot({ path: 'og-referral-id2.png', fullPage: true });
    console.log('OG screenshot saved to og-referral-id2.png');
    // Also fetch via fetch to check logic
    const ogFetch = await page.evaluate(async (url) => {
        const res = await fetch(url);
        return { status: res.status, contentType: res.headers.get('content-type'), ok: res.ok };
    }, ogUrl);
    console.log('OG fetch result:', ogFetch);
    // For OG, we cannot easily check text inside image, but we can verify via API logic:
    // The image should contain Founding Member #0001
    // We can also fetch the JSON logic via direct server check, but for now screenshot is evidence
    // Try to use OCR? Not needed, just log that we got image
    console.log('OG verification: If image was generated, it should contain Founding Member #0001 for shoma_trampwall (id=2 -> 1)');

} catch (e) {
    console.error('Error during verification:', e);
    process.exit(1);
} finally {
    await browser.close();
    console.log('Browser closed');
}
