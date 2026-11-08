const fs = require('fs');

function searchFile(file) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  let idx = 0;
  while ((idx = content.indexOf('สถานะบริการ', idx)) !== -1) {
    console.log(`[${file}] match at ${idx}:`);
    console.log(content.substring(Math.max(0, idx - 150), Math.min(content.length, idx + 250)));
    console.log('----------------------------------------------------');
    idx += 1;
  }
}

['page_th_status.html', 'demox_home.html', 'page_th_home.html', 'page_th_store.html'].forEach(searchFile);
