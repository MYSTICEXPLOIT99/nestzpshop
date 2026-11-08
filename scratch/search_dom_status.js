const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9388;

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

async function searchDOM(url) {
  const target = await httpPut(`http://127.0.0.1:${PORT}/json/new?${url}`);
  const WebSocket = require('ws');
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
  await wait(2000);

  const evalResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const all = Array.from(document.querySelectorAll('*'));
      const matches = all.filter(el => {
        return el.children.length === 0 && (el.textContent.includes('สถานะบริการ') || el.textContent.includes('สถานะ'));
      }).map(el => ({
        tag: el.tagName,
        text: el.textContent.trim(),
        className: el.className,
        parentTag: el.parentElement?.tagName,
        parentClass: el.parentElement?.className
      }));
      return matches;
    })()`,
    returnByValue: true
  });

  ws.close();
  return evalResult.result.value;
}

async function main() {
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + path.join(__dirname, '.chrome_temp_findstatus')
  ]);
  await wait(2000);

  try {
    console.log('--- Searching / ---');
    const homeMatches = await searchDOM('http://localhost:3000/');
    console.log('Home:', homeMatches);

    console.log('--- Searching /admin ---');
    const adminMatches = await searchDOM('http://localhost:3000/admin');
    console.log('Admin:', adminMatches);
  } finally {
    chrome.kill();
  }
}

main().catch(console.error);
