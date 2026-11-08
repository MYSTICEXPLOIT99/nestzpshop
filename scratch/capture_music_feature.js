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
    '--window-size=1440,900',
    '--user-data-dir=' + path.join(__dirname, '.chrome_temp_music')
  ]);
  await wait(2000);

  const artifactDir = 'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\1a1707eb-d540-4b8b-9426-d7fa58af3a70';

  try {
    // 1. Visit Home & open music player
    const target1 = await httpPut(`http://127.0.0.1:${PORT}/json/new?http://localhost:3000`);
    const ws1 = new WebSocket(target1.webSocketDebuggerUrl);
    await new Promise(r => ws1.onopen = r);

    let id = 1;
    function send1(method, params = {}) {
      return new Promise((resolve, reject) => {
        const curId = id++;
        const onMsg = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id === curId) {
            ws1.removeEventListener('message', onMsg);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws1.addEventListener('message', onMsg);
        ws1.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send1('Page.enable');
    await send1('Runtime.enable');
    await wait(3000);

    // Click the music widget toggle to expand
    await send1('Runtime.evaluate', {
      expression: `
        const btn = document.querySelector('button[title*="เพลง"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('BGM') || b.textContent.includes('Cyber Music'));
        if (btn) btn.click();
      `
    });
    await wait(1000);

    const shot1 = await send1('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'music_front_widget.png'), Buffer.from(shot1.data, 'base64'));
    console.log('Saved music_front_widget.png');
    ws1.close();

    // 2. Visit Admin -> Music Tab
    const target2 = await httpPut(`http://127.0.0.1:${PORT}/json/new?http://localhost:3000/admin`);
    const ws2 = new WebSocket(target2.webSocketDebuggerUrl);
    await new Promise(r => ws2.onopen = r);

    let id2 = 1;
    function send2(method, params = {}) {
      return new Promise((resolve, reject) => {
        const curId = id2++;
        const onMsg = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id === curId) {
            ws2.removeEventListener('message', onMsg);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws2.addEventListener('message', onMsg);
        ws2.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send2('Page.enable');
    await send2('Runtime.enable');
    await wait(3000);

    // Click music tab
    await send2('Runtime.evaluate', {
      expression: `
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('เพลงพื้นหลัง BGM'));
        if (btn) btn.click();
      `
    });
    await wait(1000);

    const shot2 = await send2('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'music_admin_tab.png'), Buffer.from(shot2.data, 'base64'));
    console.log('Saved music_admin_tab.png');
    ws2.close();

    // 3. Visit Product page
    const target3 = await httpPut(`http://127.0.0.1:${PORT}/json/new?http://localhost:3000/products/prod_gta_01`);
    const ws3 = new WebSocket(target3.webSocketDebuggerUrl);
    await new Promise(r => ws3.onopen = r);

    let id3 = 1;
    function send3(method, params = {}) {
      return new Promise((resolve, reject) => {
        const curId = id3++;
        const onMsg = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id === curId) {
            ws3.removeEventListener('message', onMsg);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws3.addEventListener('message', onMsg);
        ws3.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send3('Page.enable');
    await send3('Runtime.enable');
    await wait(3000);

    const shot3 = await send3('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'music_product_page.png'), Buffer.from(shot3.data, 'base64'));
    console.log('Saved music_product_page.png');
    ws3.close();

  } finally {
    chrome.kill();
  }
}

capture().catch(console.error);
