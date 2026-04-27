/**
 * Instagram photo scraper — @hugogomezsalgado
 * Descarga foto de perfil + posts y los guarda en hugo-gomez-web/assets/images/
 */
const { chromium } = require('playwright');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const HANDLE = 'hugogomezsalgado';
const OUT = path.resolve(__dirname, 'hugo-gomez-web', 'assets', 'images');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

function downloadUrl(imgUrl, dest) {
  return new Promise((resolve, reject) => {
    const mod = imgUrl.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    const req = mod.get(imgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlink(dest, () => {});
        return downloadUrl(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        return reject(new Error(`HTTP ${res.statusCode} for ${imgUrl}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    req.on('error', e => { file.close(); fs.unlink(dest, () => {}); reject(e); });
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

(async () => {
  console.log('\n========================================');
  console.log('  Instagram Scraper — @' + HANDLE);
  console.log('========================================\n');

  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-size=1440,900',
    ]
  });

  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
    extraHTTPHeaders: {
      'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
    }
  });

  // Mask automation signals
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['es-AR', 'es', 'en'] });
    window.chrome = { runtime: {}, loadTimes: () => {}, csi: () => {}, app: {} };
  });

  const page = await ctx.newPage();

  // Intercept all image network responses
  const capturedImages = [];
  page.on('response', async (res) => {
    try {
      const url = res.url();
      const type = res.request().resourceType();
      if (type === 'image' || (url.includes('cdninstagram') && url.includes('.jpg'))) {
        const isProfileOrPost = url.includes('cdninstagram') || url.includes('fbcdn');
        const notTooSmall = !url.includes('s32x32') && !url.includes('s40x40') && !url.includes('s56x56') && !url.includes('s64x64');
        if (isProfileOrPost && notTooSmall) {
          capturedImages.push(url);
        }
      }
    } catch (e) {}
  });

  console.log('Abriendo perfil de Instagram...');

  try {
    await page.goto(`https://www.instagram.com/${HANDLE}/`, {
      waitUntil: 'load',
      timeout: 40000
    });
  } catch (e) {
    console.log('Carga lenta (continuando):', e.message.substring(0, 60));
  }

  await page.waitForTimeout(4000);

  const currentUrl = page.url();
  console.log('URL final:', currentUrl);

  // Check for login wall
  if (currentUrl.includes('/accounts/login') || currentUrl.includes('/challenge/')) {
    console.log('\n❌ Instagram requiere login. Cerrando...');
    await page.screenshot({ path: path.join(OUT, '_blocked.png') });
    await browser.close();
    process.exit(2);
  }

  // Dismiss any popup/dialog
  try {
    for (const sel of [
      'button:has-text("Ahora no")',
      'button:has-text("Not now")',
      'button:has-text("No ahora")',
      '[aria-label="Cerrar"]',
      '[aria-label="Close"]',
    ]) {
      const btn = page.locator(sel);
      if (await btn.count() > 0) {
        await btn.first().click({ timeout: 2000 });
        await page.waitForTimeout(500);
        break;
      }
    }
  } catch (e) {}

  await page.waitForTimeout(2000);

  // Scroll down to trigger lazy load of posts
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollBy(0, 800));
  await page.waitForTimeout(1500);

  // Debug screenshot
  await page.screenshot({ path: path.join(OUT, '_debug.png'), fullPage: false });
  console.log('Screenshot de debug guardado');

  // Extract image URLs from DOM
  const domData = await page.evaluate(() => {
    const data = { profilePic: null, posts: [], bio: '', name: '' };

    // Find all images
    const allImgs = Array.from(document.querySelectorAll('img'));

    allImgs.forEach(img => {
      const src = img.src || '';
      if (!src || src.startsWith('data:') || src.startsWith('blob:')) return;

      const isCDN = src.includes('cdninstagram') || src.includes('fbcdn');
      if (!isCDN) return;

      // Profile picture detection: usually in header, or smaller size
      const isInHeader = img.closest('header') !== null;
      const isProfileSize = src.includes('s150x150') || src.includes('s320x320') || src.includes('profile');
      const altText = (img.alt || '').toLowerCase();
      const isProfileAlt = altText.includes('profile') || altText.includes('photo') || altText.includes('foto');

      if (!data.profilePic && (isInHeader || isProfileSize || isProfileAlt)) {
        // Get higher resolution version
        const hiRes = src
          .replace(/s150x150/, 's320x320')
          .replace(/_s150x150/, '');
        data.profilePic = hiRes;
      } else if (data.posts.length < 9 && !isProfileSize) {
        data.posts.push(src);
      }
    });

    // Bio
    const spans = Array.from(document.querySelectorAll('span'));
    for (const span of spans) {
      const text = span.textContent.trim();
      if (text.length > 15 && text.length < 200 && !span.querySelector('span')) {
        data.bio = text;
        break;
      }
    }

    // Name
    const h1 = document.querySelector('h1, h2');
    if (h1) data.name = h1.textContent.trim();

    return data;
  });

  console.log('\n--- Datos extraídos ---');
  console.log('Nombre:', domData.name || '(no encontrado)');
  console.log('Bio:', domData.bio ? domData.bio.substring(0, 60) + '...' : '(no encontrada)');
  console.log('Foto perfil (DOM):', domData.profilePic ? 'encontrada' : 'no encontrada');
  console.log('Posts (DOM):', domData.posts.length);
  console.log('Imágenes capturadas en red:', capturedImages.length);

  // Merge all image sources, prioritizing larger/better quality
  const allFound = [...new Set([
    ...capturedImages,
    ...(domData.profilePic ? [domData.profilePic] : []),
    ...domData.posts,
  ])].filter(url =>
    !url.includes('s32x32') &&
    !url.includes('s40x40') &&
    !url.includes('s56x56')
  );

  console.log('\nTotal de imágenes únicas:', allFound.length);

  if (allFound.length === 0) {
    console.log('\n⚠️  No se encontraron imágenes. Guardando HTML de debug...');
    const html = await page.content();
    fs.writeFileSync(path.join(OUT, '_page.html'), html);
    await browser.close();
    process.exit(3);
  }

  // Separate profile pic from post images
  let profilePicUrl = domData.profilePic;
  const postImageUrls = [];

  if (!profilePicUrl) {
    // Heuristic: profile pic is usually small/square, found early in network
    // Take first captured image as profile pic
    profilePicUrl = allFound[0];
    for (let i = 1; i < allFound.length && postImageUrls.length < 5; i++) {
      postImageUrls.push(allFound[i]);
    }
  } else {
    for (const url of allFound) {
      if (url !== profilePicUrl && postImageUrls.length < 5) {
        postImageUrls.push(url);
      }
    }
  }

  // Download
  console.log('\n--- Descargando ---');
  const results = { profilePic: false, posts: 0 };

  if (profilePicUrl) {
    try {
      await downloadUrl(profilePicUrl, path.join(OUT, 'hugo-profile.jpg'));
      console.log('✓ hugo-profile.jpg');
      results.profilePic = true;
    } catch (e) {
      console.log('✗ hugo-profile.jpg —', e.message.substring(0, 60));
    }
  }

  for (let i = 0; i < postImageUrls.length; i++) {
    try {
      await downloadUrl(postImageUrls[i], path.join(OUT, `ig-${i + 1}.jpg`));
      console.log(`✓ ig-${i + 1}.jpg`);
      results.posts++;
    } catch (e) {
      console.log(`✗ ig-${i + 1}.jpg —`, e.message.substring(0, 60));
    }
  }

  console.log(`\n✅ Descarga completa: ${results.profilePic ? 1 : 0} perfil + ${results.posts} posts`);
  console.log(`   Guardado en: ${OUT}`);

  // Write result JSON for the next step
  fs.writeFileSync(
    path.join(OUT, '_scrape-result.json'),
    JSON.stringify({ ...results, bio: domData.bio, name: domData.name }, null, 2)
  );

  await browser.close();
  process.exit(0);
})();
