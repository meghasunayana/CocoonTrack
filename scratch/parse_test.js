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
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    // Find all table tags in the HTML
    const tables = [];
    let startIndex = 0;
    while (true) {
      const startTable = data.indexOf('<table', startIndex);
      if (startTable === -1) break;
      const endTable = data.indexOf('</table>', startTable);
      if (endTable === -1) break;
      
      const tableHtml = data.substring(startTable, endTable + 8);
      tables.push(tableHtml);
      startIndex = endTable + 8;
    }
    
    console.log('Total tables found:', tables.length);
    tables.forEach((t, i) => {
      console.log(`\n--- TABLE ${i} ---`);
      console.log('Length:', t.length);
      console.log('Snippet:', t.substring(0, 300));
      if (t.includes('Reeling Cocoon') || t.includes('Cross Breed') || t.includes('Bivoltine')) {
        console.log('=> This table mentions reeling cocoon, cross breed, or bivoltine!');
        // Let's print the entire table or some rows
        console.log('Sample rows:');
        const rows = t.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
        console.log('Number of rows:', rows.length);
        rows.slice(0, 20).forEach((r, rIdx) => {
          // clean tags
          const text = r.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          console.log(`  Row ${rIdx}: ${text}`);
        });
      }
    });
  });
}).on('error', (err) => {
  console.error('Error fetching page:', err);
});
