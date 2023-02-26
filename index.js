const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function parsePage(pageNum) {
  try {
    const url = `https://consulting.1c.ru/partners/?PAGEN_2=${pageNum}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const partners = [];
    $('.wrapper_iso').each((index, element) => {
      const partnerName = $(element).find('.link_to_parth').text().trim();
      const partnerCity = $(element).find('.city_parth').text().trim();
      partners.push(`${partnerName},${partnerCity}`);
    });

    return partners;
  } catch (error) {
    console.error(error);
  }
}

async function parseAllPages() {
  const allPartners = [];
  for (let i = 1; i <= 22; i++) {
    const partnersOnPage = await parsePage(i);
    allPartners.push(...partnersOnPage);
  }
  return allPartners;
}

parseAllPages().then((partners) => {
  fs.writeFile('partners.txt', partners.join('\n'), (err) => {
    if (err) throw err;
    console.log('Partners saved to partners.txt file');
  });
});
