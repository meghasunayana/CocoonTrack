const https = require('https');
const fs = require('fs');
const path = require('path');
const URL = 'https://en.krashimitra.com/silk-market-price-karnataka/';
const OPTIONS = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
  }
};
function parseHTML(html) {
  // Find the table with wpDataTableID-152 (Reeling Cocoon Prices)
  const tableStart = html.indexOf('wpDataTableID-152');
  if (tableStart === -1) {
    throw new Error('Could not find Table A (wpDataTableID-152) in HTML page.');
  }
  // Find the closest table tags containing this ID
  const tableIdx = html.lastIndexOf('<table', tableStart);
  if (tableIdx === -1) {
    throw new Error('Could not find opening table tag for Table A.');
  }
  const tableEnd = html.indexOf('</table>', tableStart);
  if (tableEnd === -1) {
    throw new Error('Could not find closing table tag for Table A.');
  }
  const tableHtml = html.substring(tableIdx, tableEnd + 8);
  const rows = tableHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
  
  if (rows.length < 2) {
    throw new Error('Table A has fewer than 2 rows.');
  }
  const results = [];
  
  // Row 0 is header: Markets, Type, Date, Minimum Price, Maximum Price, Average Price
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
    if (cells.length < 6) continue;
    const market = cleanText(cells[0]);
    const type = cleanText(cells[1]);
    const date = cleanText(cells[2]);
    const minStr = cleanText(cells[3]);
    const maxStr = cleanText(cells[4]);
    const avgStr = cleanText(cells[5]);
    // Check if empty or hyphen
    if (!market || market === '-' || market === '—') continue;
    const minPrice = parseNumber(minStr);
    const maxPrice = parseNumber(maxStr);
    const avgPrice = parseNumber(avgStr);
    results.push({
      market,
      type,
      date,
      minPrice,
      maxPrice,
      avgPrice
    });
  }
  return results;
}
function cleanText(cellHtml) {
  if (!cellHtml) return '';
  return cellHtml
    .replace(/<[^>]+>/g, '') // remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function parseNumber(str) {
  if (!str || str === '-' || str === '—' || str === '---') return null;
  const numStr = str.replace(/[^\d.]/g, '');
  const num = parseFloat(numStr);
  return isNaN(num) ? null : num;
}
console.log('Fetching live cocoon price data from:', URL);
https.get(URL, OPTIONS, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to fetch page. Status code: ${res.statusCode}`);
    process.exit(1);
  }
  let html = '';
  res.on('data', (chunk) => {
    html += chunk;
  });
  res.on('end', () => {
    try {
      console.log('Successfully fetched HTML page. Data length:', html.length);
      const parsedData = parseHTML(html);
      
      console.log(`Parsed ${parsedData.length} records successfully.`);
      console.table(parsedData.slice(0, 10));
      const outputPath = path.join(__dirname, '..', 'public', 'live_market_data.json');
      
      // Ensure the directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(outputPath, JSON.stringify({
        lastUpdated: new Date().toISOString(),
        records: parsedData
      }, null, 2));
      console.log(`Successfully wrote market data to: ${outputPath}`);
    } catch (err) {
      console.error('Error parsing/writing data:', err);
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error('Network error during fetch:', err);
  process.exit(1);
});
