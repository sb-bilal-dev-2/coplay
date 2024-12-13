const puppeteer = require('puppeteer');

async function getFilmotUrls(text = "hello there", lang = 'en') {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Construct the URL with the search term and language
  const searchUrl = `https://filmot.com/search/%22${encodeURIComponent(text)}%22/1?lang=${lang}&gridView=1`;

  // Navigate to the search URL
  await page.goto(searchUrl, { waitUntil: 'networkidle2' });

  // Extract URLs from the page
  const urls = await page.evaluate(() => {
    // Select all anchor tags with the class 'fullpagelnk'
    const anchors = document.querySelectorAll('a[href*="https://www.youtube.com/watch?v="]');
    
    // Map them to their href attribute values
    return Array.from(anchors).map(anchor => anchor.href);
  });

  // Close the browser
  await browser.close();

  // Return the array of URLs
  return urls;
}

// Example usage
getFilmotUrls('hello there')
  .then(urls => {
    console.log(urls);
  })
  .catch(err => {
    console.error('Error:', err);
  });
