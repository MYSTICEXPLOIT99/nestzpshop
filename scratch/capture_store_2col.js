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
const PORT = 9352;

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
  const tempDir = path.join(os.tmpdir(), '.chrome_store_2col_' + Date.now());
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--window-size=1440,1100',
    '--user-data-dir=' + tempDir
  ]);
  await wait(2000);

  try {
    const target = await httpPut(`http://127.0.0.1:${PORT}/json/new?http://localhost:3000/`);
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

    // Scroll down to products catalog and slightly further to see category boundaries
    await send('Runtime.evaluate', {
      expression: `(() => {
        window.scrollBy(0, 1000);
      })()`
    });
    await wait(1000);

    const screenshot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });
    fs.writeFileSync('scratch/store_2col_preview.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved scratch/store_2col_preview.png');

    ws.close();
  } catch (e) {
    console.error('Error:', e);
  } finally {
    chrome.kill();
  }
}

capture().then(() => console.log('Done'));
