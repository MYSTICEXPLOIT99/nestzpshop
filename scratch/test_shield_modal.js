const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

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

async function testShield() {
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--window-size=1440,900',
    '--user-data-dir=' + path.join(__dirname, '.chrome_temp_shield')
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

    // 1. Check if shield modal is NOT visible initially
    const initialCheck = await send('Runtime.evaluate', {
      expression: `Boolean(document.getElementById('arx-shield-modal'))`,
      returnByValue: true
    });
    console.log('Is shield modal visible initially on page load?:', initialCheck.result.value);

    // 2. Trigger shield
    await send('Runtime.evaluate', {
      expression: `window.dispatchEvent(new Event('arx:shield:trigger'))`
    });
    await wait(600);

    const afterTriggerCheck = await send('Runtime.evaluate', {
      expression: `Boolean(document.getElementById('arx-shield-modal'))`,
      returnByValue: true
    });
    console.log('Is shield modal visible after trigger?:', afterTriggerCheck.result.value);

    // Take screenshot of the new compact modal with logo
    const screenshot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: 400,
        y: 200,
        width: 640,
        height: 500,
        scale: 1
      }
    });

    const outPath = path.join(__dirname, 'shield_modal_new.png');
    fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
    console.log('Saved screenshot to:', outPath);

    // 3. Test clicking "รับทราบ"
    const ackResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.getElementById('arx-shield-acknowledge-btn');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()`,
      returnByValue: true
    });
    console.log('Clicked รับทราบ button?:', ackResult.result.value);
    await wait(500);

    const closedCheck = await send('Runtime.evaluate', {
      expression: `Boolean(document.getElementById('arx-shield-modal'))`,
      returnByValue: true
    });
    console.log('Is shield modal closed after clicking รับทราบ?:', !closedCheck.result.value);

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

testShield();
