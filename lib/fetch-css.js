const penthouse = require('penthouse');
const puppeteer = require('puppeteer');
const fs = require('fs');

const launchBrowser = async () => {
  try {
    return await puppeteer.launch({
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
    });
  } catch (error) {
    fs.writeSync(process.stderr.fd, error.toString());
    process.exit(1);
  }
};

const runPenthouse = async () => {
  const browser = await launchBrowser();
  const penthouseOptions = JSON.parse(process.argv[2]);

  penthouseOptions.puppeteer = {
    getBrowser: () => browser
  };

  try {
    const criticalCss = await penthouse(penthouseOptions);
    fs.writeSync(process.stdout.fd, criticalCss);
  } catch (error) {
    fs.writeSync(process.stderr.fd, error.toString());
    process.exit(1);
  } finally {
    await browser.close();
  }
};

runPenthouse();
