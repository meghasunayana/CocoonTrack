const https = require('https');
const url = 'https://en.krashimitra.com/silk-market-price-karnataka/';
const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
  }
};
https.get(url, options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Data length:', data.length);
    if (data.includes('Reeling Cocoon Prices')) {
      console.log('Found "Reeling Cocoon Prices"!');
      // print first 500 chars of data containing Reeling Cocoon Prices
      const index = data.indexOf('Reeling Cocoon Prices');
      console.log(data.substring(index - 200, index + 800));
    } else {
      console.log('Could not find "Reeling Cocoon Prices" in page.');
    }
  });
}).on('error', (err) => {
  console.error('Error fetching page:', err);
});
