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
const PORT = 9349;

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
    '--window-size=1440,900',
    '--user-data-dir=' + path.join(__dirname, '.chrome_temp_feed')
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

    // Scroll to the live feed section
    await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector('.live-feed-marquee-container');
        if (el) el.scrollIntoView({ block: 'center' });
      })()`
    });
    await wait(800);

    // Take screenshot without hover
    const screenshot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/live_feed_preview.png', Buffer.from(screenshot1.data, 'base64'));
    console.log('Saved scratch/live_feed_preview.png');

    // Simulate mouse move over the marquee track to test continuous running
    const trackBounds = await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector('.live-feed-marquee-container');
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      })()`,
      returnByValue: true
    });

    if (trackBounds.result.value) {
      await send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: trackBounds.result.value.x,
        y: trackBounds.result.value.y
      });
      await wait(1000);

      // Check if animation is running
      const animState = await send('Runtime.evaluate', {
        expression: `(() => {
          const track = document.querySelector('.live-feed-marquee-track');
          return window.getComputedStyle(track).animationPlayState;
        })()`,
        returnByValue: true
      });
      console.log('Animation Play State on Hover:', animState.result.value);
    }

    ws.close();
  } catch (e) {
    console.error('Error:', e);
  } finally {
    chrome.kill();
  }
}

capture().then(() => console.log('Done'));
