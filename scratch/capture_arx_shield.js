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

const os = require('os');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9350;

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
  const tempDir = path.join(os.tmpdir(), '.chrome_shield_' + Date.now());
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

    // Trigger ARX SHIELD via custom event
    await send('Runtime.evaluate', {
      expression: `window.dispatchEvent(new CustomEvent('arx:shield:trigger'))`
    });
    await wait(800);

    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/arx_shield_modal.png', Buffer.from(screenshot.data, 'base64'));
    console.log('Saved scratch/arx_shield_modal.png');

    ws.close();
  } catch (e) {
    console.error('Error:', e);
  } finally {
    chrome.kill();
  }
}

capture().then(() => console.log('Done'));
