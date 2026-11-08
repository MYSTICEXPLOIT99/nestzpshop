const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9346;

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
    '--window-size=1400,1200',
    '--user-data-dir=' + path.join(__dirname, '.chrome_temp_hover')
  ]);
  await wait(2000);

  try {
    const target = await httpPut(`http://127.0.0.1:${PORT}/json/new?http://localhost:3000/store`);
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
    await wait(3500);

    // Scroll to products and trigger hover on the first product card
    await send('Runtime.evaluate', {
      expression: `
        const card = document.querySelector('.arx-product-card');
        if (card) {
          card.classList.add('hovered');
          card.scrollIntoView({ behavior: 'instant', block: 'center' });
        }
      `
    });
    await wait(1000);

    const artifactDir = 'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\1a1707eb-d540-4b8b-9426-d7fa58af3a70';
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preview_product_hover_logo_only.png'), Buffer.from(screenshot.data, 'base64'));
    console.log('Saved preview_product_hover_logo_only.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

capture().catch(console.error);
