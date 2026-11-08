const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');
let WebSocket = globalThis.WebSocket;
try {
  if (!WebSocket) WebSocket = require('ws');
} catch (e) {
  try {
    WebSocket = require('next/dist/compiled/ws');
  } catch (e2) {}
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9348;

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function httpPut(url) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method: 'PUT' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}

async function capture() {
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--window-size=1440,1100',
    '--user-data-dir=' + path.join(__dirname, '.chrome_temp_prod_admin')
  ]);
  await wait(2000);

  try {
    // 1. Capture Product Page
    const target = await httpPut(`http://127.0.0.1:${PORT}/json/new?http://localhost:3000/products/prod-1`);
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const curId = id++;
        const onMsg = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', onMsg);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', onMsg);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await wait(3000);

    const screenshot1 = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true
    });
    fs.writeFileSync('scratch/product_detail_page.png', Buffer.from(screenshot1.data, 'base64'));
    console.log('Saved scratch/product_detail_page.png');

    // 2. Capture Admin Stock Tab
    await send('Page.navigate', { url: 'http://localhost:3000/admin' });
    await wait(3000);

    // Click Stock Tab
    await send('Runtime.evaluate', {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const stockBtn = buttons.find(b => b.innerText.includes('จัดการสต็อก'));
        if (stockBtn) stockBtn.click();
      })()`
    });
    await wait(1500);

    const screenshot2 = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true
    });
    fs.writeFileSync('scratch/admin_stock_tab.png', Buffer.from(screenshot2.data, 'base64'));
    console.log('Saved scratch/admin_stock_tab.png');

    // Click "จัดการคลังสินค้านี้" button to open modal
    await send('Runtime.evaluate', {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const manageBtn = buttons.find(b => b.innerText.includes('จัดการคลังสินค้านี้'));
        if (manageBtn) manageBtn.click();
      })()`
    });
    await wait(1500);

    const screenshot3 = await send('Page.captureScreenshot', {
      format: 'png'
    });
    fs.writeFileSync('scratch/admin_stock_modal.png', Buffer.from(screenshot3.data, 'base64'));
    console.log('Saved scratch/admin_stock_modal.png');

    ws.close();
  } catch (e) {
    console.error('Error during capture:', e);
  } finally {
    chrome.kill();
  }
}

capture().then(() => console.log('Done'));
