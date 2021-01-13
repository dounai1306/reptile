const puppeteer = require('puppeteer');
// Puppeteer 是一个 Node 库，它提供了一个高级 API 来通过 DevTools 协议控制 Chromium 或 Chrome。它会下载一个版本的 Chromium。
const cheerio = require('cheerio');
// Cheerio的选择器实现与jQuery的选择器实现几乎相同，因此API非常相似。
const xlsx = require('node-xlsx');
// 使用node-xlsx进行excel文件的读写
const fs = require('fs');
const data = [
  {
    name: '酒店',
    data: [
      ['酒店', '连接', '价格']
    ]
  }
];
var dataSource = [];
(async () => {
  // 创建browser实例，打开页面，使用puppeteer的api
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.goto('https://hotels.ctrip.com/hotel/shanghai2#ctm_ref=hod_hp_sb_lst');
  await autoScroll(page);
  const content = await page.content();
  // 返回页面的完整 html 代码，包括 doctype。
  const $ = cheerio.load(content);
  // jQuery的这一步骤是隐式的，因为jQuery在一个内置的DOM上运行。使用Cheerio，我们需要传递HTML文档。
  $('.J_HotelListBaseCell').each(function (index, element) {
    var text = $(element).find('.hotel_name a').text();
    var href = $(element).find('.hotel_name a').attr('href');
    var price = $(element).find('.J_price_lowList').text();
    dataSource.push([text, 'http://www.ctrip.com' + href, price]);
  });
  dataSource.sort(function (a, b) {
    return parseInt(a[2]) > parseInt(b[2]) ? 1 : -1;
  });
  dataSource.forEach(function (item) {
    data[0].data.push(item)
  });
  var buffer = xlsx.build(data);
  // 将数组转换为Buffer数据，Js语言自身只有字符串数据类型,没有二进制的数据类型。但是当需要处理文件流时,必须使用二进制数据。
  // 因此在Node.js中。引入了Buffer类,该类是创建一个专门用来储存二进制数据的缓冲区
  // fs.writeFile(file, data[, options], callback)
  fs.writeFile('./resut.xls', buffer, function (err) {
      if (err) throw err;
      console.log('爬取结束');
    }
  );
  await browser.close();
})();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 500;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  });
}
