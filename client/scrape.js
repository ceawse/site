import puppeteer from 'puppeteer';
import fs from 'fs';

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('Navigating to https://alpenstark.com/en/...');
  await page.goto('https://alpenstark.com/en/', { waitUntil: 'networkidle0', timeout: 60000 });
  
  await new Promise(resolve => setTimeout(resolve, 5000)); // wait for animations/styles
  
  console.log('Extracting head and body...');
  
  const pageData = await page.evaluate(() => {
    // 1. Get all styles from CSSOM to capture dynamically injected rules (e.g. emotion)
    let stylesHTML = '';
    const styleSheets = Array.from(document.styleSheets);
    for (const sheet of styleSheets) {
      try {
        if (sheet.ownerNode && sheet.ownerNode.tagName.toLowerCase() === 'link') continue; // Handled below
        let cssText = Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
        cssText = cssText.replace(/url\(['"]?\//g, 'url("https://alpenstark.com/');
        stylesHTML += `<style>${cssText}</style>\n`;
      } catch (e) {
        console.error('Cannot access rules of a stylesheet:', e);
      }
    }
    
    // 2. Get all link stylesheets and convert to style tags or absolute links
    const linkTags = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]'));
    let linksHTML = linkTags.map(l => {
      let href = l.getAttribute('href');
      if (href && href.startsWith('/')) {
        href = 'https://alpenstark.com' + href;
      }
      return `<link rel="stylesheet" href="${href}" />`;
    }).join('\n');
    
    // 3. Get the root element's HTML and fix src/href
    const rootEl = document.getElementById('root');
    if (!rootEl) return '';
    
    // Fix src attributes (images, scripts, etc. though we only care about images/videos)
    const elementsWithSrc = rootEl.querySelectorAll('[src]');
    elementsWithSrc.forEach(el => {
      let src = el.getAttribute('src');
      if (src && src.startsWith('/')) {
        el.setAttribute('src', 'https://alpenstark.com' + src);
      }
    });
    
    // Fix inline styles with url(/...)
    const elementsWithBg = rootEl.querySelectorAll('[style*="url("]');
    elementsWithBg.forEach(el => {
      let style = el.getAttribute('style');
      if (style && style.includes('url("/')) {
        el.setAttribute('style', style.replace(/url\(['"]?\//g, 'url("https://alpenstark.com/'));
      }
    });

    // Fix href attributes in SVG use or anchors
    const elementsWithHref = rootEl.querySelectorAll('[href]');
    elementsWithHref.forEach(el => {
      let href = el.getAttribute('href');
      if (href && href.startsWith('/')) {
        el.setAttribute('href', 'https://alpenstark.com' + href);
      }
    });
    
    const rootHTML = rootEl.innerHTML;
    
    return `
<html>
<head>
  ${linksHTML}
  ${stylesHTML}
</head>
<body>
  <div id="root">${rootHTML}</div>
</body>
</html>
    `;
  });
  
  fs.writeFileSync('src/assets/raw/home.html', pageData);
  console.log('Successfully wrote to src/assets/raw/home.html (Size:', pageData.length, ')');
  
  await browser.close();
}

run().catch(console.error);
