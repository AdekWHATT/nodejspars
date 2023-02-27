const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const baseUrl = 'https://consulting.1c.ru';

async function parsePage(pageNum) {
  try {
    const url = `${baseUrl}/partners/?PAGEN_2=${pageNum}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const partners = [];
    for (const element of $('.wrapper_iso')) {
      const partnerName = $(element).find('.link_to_parth').text().trim();
      const partnerCity = $(element).find('.city_parth').text().trim();
      const partnerLink = $(element).find('.link_to_parth').attr('href');
      const partnerUrl = `${baseUrl}${partnerLink}`;
      const partnerResponse = await axios.get(partnerUrl);
      const partner$ = cheerio.load(partnerResponse.data);
      const partnerAddress = partner$('.loc_name_parth').text().trim();
      partners.push({ name: partnerName, city: partnerCity, address: partnerAddress, url: partnerUrl });
    }

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
  const partnerStrings = partners.map((partner) => `${partner.name},${partner.city},${partner.address}`).join('\n');
  fs.writeFile('partnersNew.txt', partnerStrings, (err) => {
    if (err) throw err;
    console.log('Partners saved to partners.txt file');
  });
});
