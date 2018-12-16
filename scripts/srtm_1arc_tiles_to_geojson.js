const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const util = require('util');
const execSync = util.promisify(require('child_process').execSync);
const got = require('got');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const Big = require('big.js');

const doDownloadXMLInfos = process.env.XMLINFOS || false;
const mainUrl = 'https://e4ftl01.cr.usgs.gov/MEASURES/SRTMGL1.003/2000.02.11/';

(async () => {
  // Initialize browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(mainUrl, {
    timeout: 60000,
    waitUntil: 'networkidle0'
  });

  // Get pages URLs to tiles lists
  const urls = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('table tr a'))
      .map(element => {
          return element.href
      })
  });
  await browser.close();

  // Retrieve raw HTML due to JavaScript jQuery datatable use
  // (hence cheerio usage instead of puppeteer)
  // and convert to JSON
  const json = await Promise.all(urls
      .map(async link => {
        const response = await got(link);
        const html = response.body;
        const tr = cheerio('table tbody tr', html);
        const jsons = tr.map(function(i, el) {
          let size = cheerio(el).children('td:nth-child(4)').text();
            return {
              url: cheerio(el).find('td a').attr('href'),
              modified: cheerio(el).children('td:nth-child(3)').text(),
              sizeraw: size,
              size: size.endsWith('M') ? x = (new Big(Number(size.replace('M', '')))).times(1024) : Number(size.replace('K', ''))
            };
          }).get();
        return jsons;
      })
    );
  // Filter files to only get *.hgt.zip files
  const only_hgt_zip = json
    .reduce((acc, curr) => {
      acc = [...acc, ...curr];
      return acc;
    }, [])
    .filter(el => el.url.endsWith('.hgt.zip'));


  async function wget_nasa(url) {
    const { stdout, stderr } = await execSync('wget --load-cookies ~/.urs_cookies --save-cookies ~/.urs_cookies --keep-session-cookies ' + url + '.xml');
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
  }
  process.chdir('xml');

  if (doDownloadXMLInfos) {

    const EXTENSION = '.xml';
    const files = await fsPromises.readdir('./');
    const targetFiles = files.filter(file => {
      return path.extname(file).toLowerCase() === EXTENSION;
    }).forEach(file => {
      fs.unlinkSync(file);
    });

    only_hgt_zip.forEach(el => {
      wget_nasa(el.url);
    });
  }

  // Generate GeoJSON from infos retrieved previously
  // and from xml files informations
  let features = await Promise.all(only_hgt_zip.map(async el => {
    var filename = el.url.split('/').slice(-1)[0] + '.xml';
    var htmlContent = await fsPromises.readFile(filename, 'utf-8');
    var $ = cheerio.load(htmlContent, {
      xmlMode: true
    });

    var west = Number($('WestBoundingCoordinate').text());
    var north = Number($('NorthBoundingCoordinate').text());
    var east = Number($('EastBoundingCoordinate').text());
    var south = Number($('SouthBoundingCoordinate').text());
    var feature = {
      "type":"Feature",
      "geometry": {
        "type":"Polygon",
        "coordinates":[[
          [west, north],
          [east, north],
          [east, south],
          [west, south],
          [west, north]
        ]]
      },"properties": {
        "url": el.url,
        "modified": el.modified,
        "size": el.size,
        "sizeraw": el.sizeraw
      }
    };
    return feature;
  }));

  // Write GeoJSON
  fs.writeFile('../data/srtm_1arc_hgt_zip.geojson', JSON.stringify({
    "type": "FeatureCollection",
    "features": features
  }, null, ' '), function(err) {
    if(err) throw err;
  })

})();
