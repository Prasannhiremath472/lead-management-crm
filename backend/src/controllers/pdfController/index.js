const pug = require('pug');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const puppeteer = require('puppeteer-core');
const { listAllSettings, loadSettings } = require('@/middlewares/settings');
const { getData } = require('@/middlewares/serverData');
const useLanguage = require('@/locale/useLanguage');
const { useMoney, useDate } = require('@/settings');

const pugFiles = ['invoice', 'offer', 'quote', 'payment'];

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

// Maps the old html-pdf `format` values ('A4'/'A5'/...) to a Puppeteer
// PDF page size, since Puppeteer expects lowercase format names.
const toPuppeteerFormat = (format) => (format || 'A4').toLowerCase();

exports.generatePdf = async (
  modelName,
  info = { filename: 'pdf_file', format: 'A5', targetLocation: '' },
  result,
  callback
) => {
  try {
    const { targetLocation } = info;

    // ensure the target directory exists (it's not tracked in git since
    // it starts out empty)
    fs.mkdirSync(path.dirname(targetLocation), { recursive: true });

    // if PDF already exists, then delete it and create a new PDF
    if (fs.existsSync(targetLocation)) {
      fs.unlinkSync(targetLocation);
    }

    // render pdf html

    if (pugFiles.includes(modelName.toLowerCase())) {
      // Compile Pug template

      const settings = await loadSettings();
      const selectedLang = settings['idurar_app_language'];
      const translate = useLanguage({ selectedLang });

      const {
        currency_symbol,
        currency_position,
        decimal_sep,
        thousand_sep,
        cent_precision,
        zero_format,
      } = settings;

      const { moneyFormatter } = useMoney({
        settings: {
          currency_symbol,
          currency_position,
          decimal_sep,
          thousand_sep,
          cent_precision,
          zero_format,
        },
      });
      const { dateFormat } = useDate({ settings });

      settings.public_server_file = process.env.PUBLIC_SERVER_FILE;

      const htmlContent = pug.renderFile('src/pdf/' + modelName + '.pug', {
        model: result,
        settings,
        translate,
        dateFormat,
        moneyFormatter,
        moment: moment,
      });

      const browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        await page.pdf({
          path: targetLocation,
          format: toPuppeteerFormat(info.format),
          landscape: false,
          margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
          printBackground: true,
        });
      } finally {
        await browser.close();
      }

      if (callback) callback();
    }
  } catch (error) {
    throw new Error(error);
  }
};
