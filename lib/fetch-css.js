const penthouse = require('penthouse');
const puppeteer = require('puppeteer')
const fs = require('fs');

const browserPromise = puppeteer.launch({
  ignoreHTTPSErrors: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu'
  ],
  defaultViewport: {
    width: 1300,
    height: 900
  }
})

const penthouseOptions = JSON.parse(process.argv[2]);

penthouseOptions.puppeteer = {
  getBrowser: () => browserPromise
}

const STDOUT_FD = 1;
const STDERR_FD = 2;

penthouse(penthouseOptions).then(function(criticalCss) {
  fs.writeSync(STDOUT_FD, criticalCss);
}).catch(function(err) {
  fs.writeSync(STDERR_FD, err.toString());
  process.exit(1);
});
