const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9347;

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
    '--window-size=1400,900',
    '--user-data-dir=' + path.join(__dirname, '.chrome_temp_nav')
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
    await wait(2500);

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await wait(800);

    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        const shell = document.querySelector('.store-nav-shell');
        const actions = document.querySelector('.store-nav-actions');
        const navLinks = Array.from(document.querySelectorAll('.store-nav-navLink')).map(el => ({
          text: el.innerText.trim(),
          width: el.getBoundingClientRect().width
        }));
        return {
          shellRight: shell.getBoundingClientRect().right,
          actionsRight: actions.getBoundingClientRect().right,
          overflow: actions.getBoundingClientRect().right > shell.getBoundingClientRect().right,
          navLinks
        };
      })()`,
      returnByValue: true
    });
    console.log('CHECK:', JSON.stringify(check.result.value, null, 2));

    await send('Runtime.evaluate', {
      expression: `window.scrollTo(0, 700)`
    });
    await wait(600);

    const screenshot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: 250,
        y: 600,
        width: 900,
        height: 700,
        scale: 1
      }
    });

    const outPath = path.join(__dirname, 'navbar_current.png');
    fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
    console.log('Saved screenshot to:', outPath);

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

capture();
