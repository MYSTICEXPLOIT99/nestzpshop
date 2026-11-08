const fs = require('fs');
const text = fs.readFileSync('page_th_status.html', 'utf8');
const navStart = text.indexOf('<nav class="store-nav-desktopNav"');
const navEnd = text.indexOf('</nav>', navStart);
const nav = text.substring(navStart, navEnd);
console.log(nav);
