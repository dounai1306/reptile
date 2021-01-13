const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.goto('https://segmentfault.com/a/1190000015371795');
  await autoScroll(page);
  await page.screenshot({
    path: 'image.png',
    fullPage: true
  });
  await browser.close();
})();

async function autoScroll(page){
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 500;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if(totalHeight >= scrollHeight){
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  });
}
