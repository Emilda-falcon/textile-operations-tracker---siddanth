const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
http.createServer((req, res) => {
  const requested = decodeURIComponent((req.url || '/').split('?')[0]);
  const file = path.join(root, path.normalize(requested === '/' ? '/index.html' : requested));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); return res.end('Not found'); } res.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'text/plain; charset=utf-8', 'Cache-Control':'no-store'}); res.end(data); });
}).listen(5176, '127.0.0.1', () => console.log('Operations Tracker Clean UI running at http://127.0.0.1:5176'));
