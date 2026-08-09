#!/usr/bin/env node
/* =============================================================================
   Local dev server for the public landing sites.

   Reproduces the routing that nginx.conf gives web.wazzifni.net, so the pages
   behave locally exactly as they do in production:

     /            -> frontend/landing/web       (the main landing page)
     /itland/     -> frontend/landing/itland    (IT Land Iraq)
     /course/     -> frontend/landing/course    (the course portal)

   and forwards the two API paths the pages call:

     /wazzifni-proxy/*  -> https://api.wazzifni.net/api/*   (public; the job
                           feed on the landing page works for real)
     /api-proxy/*       -> http://127.0.0.1:3000/api/*      (the local backend,
     /uploads/*         -> http://127.0.0.1:3000/uploads/*   which needs MongoDB)

   Node builtins only — nothing to install.

     node tools/dev-server.js [--port 8080]

   This is a developer convenience, not part of the deployed stack: production
   is still nginx + docker-compose.
   ============================================================================= */
const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', 'frontend', 'landing');
const BACKEND = { host: '127.0.0.1', port: 3000 };
const UPSTREAM_API = 'api.wazzifni.net';

const portFlag = process.argv.indexOf('--port');
const PORT = portFlag !== -1 ? Number(process.argv[portFlag + 1]) : 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

/** Maps a request path onto a file, mirroring the nginx location blocks. */
function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);

  // Reject traversal before touching the filesystem.
  if (clean.includes('\0') || clean.split('/').includes('..')) return null;

  let rel;
  if (clean === '/itland' || clean.startsWith('/itland/')) rel = clean;
  else if (clean === '/course' || clean.startsWith('/course/')) rel = clean;
  else rel = '/web' + clean;

  let file = path.join(ROOT, rel);
  // A directory (or the bare prefix) serves its index.html, as `index` does.
  if (rel.endsWith('/') || !path.extname(file)) file = path.join(file, 'index.html');

  // Final guard: the resolved path must still be inside the landing tree.
  const resolved = path.resolve(file);
  return resolved.startsWith(path.resolve(ROOT)) ? resolved : null;
}

function serveStatic(req, res) {
  const file = resolveFile(req.url);
  if (!file) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end('Bad request');
  }

  fs.readFile(file, (error, body) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(`404 — not found: ${req.url}`);
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      // Always revalidate: stale CSS/JS during development wastes more time
      // than the cache saves.
      'Cache-Control': 'no-store',
    });
    res.end(body);
  });
}

/** /wazzifni-proxy/<path> -> https://api.wazzifni.net/api/<path> */
function proxyPublicApi(req, res) {
  const target = '/api/' + req.url.slice('/wazzifni-proxy/'.length);

  const upstream = https.request(
    {
      host: UPSTREAM_API,
      path: target,
      method: req.method,
      // A public HTTPS host: SNI and a matching Host header are both required.
      servername: UPSTREAM_API,
      headers: { Host: UPSTREAM_API, Accept: 'application/json' },
    },
    (response) => {
      res.writeHead(response.statusCode, response.headers);
      response.pipe(res);
    },
  );

  upstream.on('error', (error) => {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'upstream unreachable', detail: error.message }));
  });

  req.pipe(upstream);
}

/** /api-proxy/<path> -> local backend /api/<path>; /uploads/* passes through. */
function proxyBackend(req, res) {
  const target = req.url.startsWith('/api-proxy/')
    ? '/api/' + req.url.slice('/api-proxy/'.length)
    : req.url;

  const upstream = http.request(
    { ...BACKEND, path: target, method: req.method, headers: req.headers },
    (response) => {
      res.writeHead(response.statusCode, response.headers);
      response.pipe(res);
    },
  );

  upstream.on('error', () => {
    // The pages handle a failed fetch by showing their own error state, so say
    // plainly what is missing rather than hanging the request.
    res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify({
        error: 'backend not running',
        detail: `Nothing is listening on ${BACKEND.host}:${BACKEND.port}. The course portal needs the backend and MongoDB (docker compose up, or run backend/server.js against a local mongod).`,
      }),
    );
  });

  req.pipe(upstream);
}

http
  .createServer((req, res) => {
    if (req.url.startsWith('/wazzifni-proxy/')) return proxyPublicApi(req, res);
    if (req.url.startsWith('/api-proxy/') || req.url.startsWith('/uploads/')) {
      return proxyBackend(req, res);
    }
    return serveStatic(req, res);
  })
  .listen(PORT, () => {
    console.log(`
  Wazzifni landing — dev server on http://localhost:${PORT}

    main landing   http://localhost:${PORT}/
    IT Land Iraq   http://localhost:${PORT}/itland/
    courses        http://localhost:${PORT}/course/

  Job feed proxied to https://${UPSTREAM_API} (live).
  Course API proxied to ${BACKEND.host}:${BACKEND.port} — start the backend for it.
`);
  });
