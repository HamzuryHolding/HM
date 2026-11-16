// Development server: serves src/ directly (data-inline files load as normal
// external CSS/JS) and reloads the browser when anything in src/ changes.
//
// Usage: node scripts/dev.mjs [--dir src] [--port 8000] [--no-reload]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const DIR = path.resolve(root, opt('--dir', 'src'));
const PORT = Number(opt('--port', 8000));
const RELOAD = !args.includes('--no-reload');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
};

const RELOAD_SNIPPET = `<script>new EventSource('/__reload').onmessage=()=>location.reload()</script>`;
const clients = new Set();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (RELOAD && url.pathname === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  let file = path.join(DIR, decodeURIComponent(url.pathname));
  if (!file.startsWith(DIR)) return send(res, 403, 'Forbidden');
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) return send(res, 404, 'Not found');
  const ext = path.extname(file).toLowerCase();
  let body = fs.readFileSync(file);
  if (RELOAD && ext === '.html') body = body.toString().replace(/<\/body>(?![\s\S]*<\/body>)/, RELOAD_SNIPPET + '</body>');
  res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(body);
});

function send(res, code, text) {
  res.writeHead(code, { 'Content-Type': 'text/plain' });
  res.end(text);
}

if (RELOAD) {
  let timer;
  fs.watch(DIR, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => clients.forEach((c) => c.write('data: reload\n\n')), 100);
  });
}

server.listen(PORT, () => {
  console.log(`Serving ${path.relative(root, DIR) || DIR} at http://localhost:${PORT}${RELOAD ? ' (live reload)' : ''}`);
});
