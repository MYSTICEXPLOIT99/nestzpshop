const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg'
};

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const pathname = parsedUrl.pathname || '';

    // Direct serve for /uploads/ static files to support runtime uploads
    if (pathname.startsWith('/uploads/')) {
      const relativePath = pathname.replace(/^\/uploads\//, '');
      const sanitized = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
      const filePath = path.join(__dirname, 'public', 'uploads', sanitized);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable'
        });
        return fs.createReadStream(filePath).pipe(res);
      }
    }

    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Next.js production server ready on port ${port}`);
  });
}).catch((err) => {
  console.error('Failed to start Next.js production server:', err);
  process.exit(1);
});
