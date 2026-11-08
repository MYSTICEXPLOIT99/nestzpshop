const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');
let WebSocket = globalThis.WebSocket;
try {
  if (!WebSocket) WebSocket = require('ws');
} catch (e) {
  try {
    WebSocket = require('next/dist/compiled/ws');
  } catch (e2) {}
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9353;

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
  const tempDir = path.join(os.tmpdir(), '.chrome_stock_modal_' + Date.now());
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--window-size=1440,900',
    '--user-data-dir=' + tempDir
  ]);
  await wait(2000);

  try {
    const target = await httpPut(`http://127.0.0.1:${PORT}/json/new?http://localhost:3000/admin?tab=stock`);
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

    // Click on the first "จัดการคลังสินค้านี้" button to open the modal
    await send('Runtime.evaluate', {
      expression: `(() => {
        const allBtns = Array.from(document.querySelectorAll('button'));
        const targetBtn = allBtns.find(b => b.textContent.includes('จัดการคลังสินค้านี้'));
        if (targetBtn) targetBtn.click();
      })()`
    });
    await wait(800);

    const screenshot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });
    fs.writeFileSync('scratch/stock_modal_compact.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved scratch/stock_modal_compact.png');

    ws.close();
  } catch (e) {
    console.error('Error:', e);
  } finally {
    chrome.kill();
  }
}

capture().then(() => console.log('Done'));
