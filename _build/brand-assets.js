// brand-assets.js — generate Rhine brand assets from _build/brand/r-logo.jpg:
// favicon set (ico/svg/apple-touch/96x96/web-app-manifest 192+512) and the
// og:image images/share_asset.jpg (1200x630). Uses ffmpeg for raster scaling +
// a small node helper for the ICO container and the SVG (raster embedded).
// Also points site.webmanifest theme_color at the site dark-blue.
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const MERGED = path.resolve(__dirname, '..');
const LOGO = path.join(__dirname, 'brand', 'r-logo.jpg');
const FAV_DIR = path.join(MERGED, 'images', 'favicon');

const FFMPEG_CANDIDATES = [
  'ffmpeg',
  'C:/Users/teoal/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0-full_build/bin/ffmpeg.exe',
];
function findFfmpeg() {
  for (const c of FFMPEG_CANDIDATES) {
    const r = spawnSync(c, ['-version'], { encoding: 'utf8', timeout: 10000 });
    if (r.status === 0) return c;
  }
  throw new Error('ffmpeg not found');
}

function ff(cmd) {
  const r = spawnSync(cmd[0], cmd.slice(1), { encoding: 'utf8', timeout: 120000 });
  if (r.status !== 0) throw new Error('ffmpeg failed: ' + (r.stderr || r.stdout || '').slice(0, 500));
}

function buildIco(pngPath, outPath) {
  const png = fs.readFileSync(pngPath);
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);       // reserved
  header.writeUInt16LE(1, 2);       // type: icon
  header.writeUInt16LE(1, 4);       // count
  const dir = Buffer.alloc(16);
  dir[0] = 0;                       // 256px
  dir[1] = 0;                       // 256px
  dir[2] = 0;                       // no palette
  dir[3] = 0;
  dir.writeUInt16LE(1, 4);          // planes
  dir.writeUInt16LE(32, 6);         // bit count
  dir.writeUInt32LE(png.length, 8); // size
  dir.writeUInt32LE(22, 12);        // offset (6 header + 16 dir)
  fs.writeFileSync(outPath, Buffer.concat([header, dir, png]));
}

function buildSvg(pngPath, outPath) {
  const png = fs.readFileSync(pngPath);
  const b64 = png.toString('base64');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#020a19"/><image width="512" height="512" xlink:href="data:image/png;base64,${b64}"/></svg>`;
  fs.writeFileSync(outPath, svg, 'utf8');
}

const ffmpeg = findFfmpeg();
fs.mkdirSync(FAV_DIR, { recursive: true });

const sizes = [
  ['apple-touch-icon.png', '180:180'],
  ['favicon-96x96.png', '96:96'],
  ['web-app-manifest-192x192.png', '192:192'],
  ['web-app-manifest-512x512.png', '512:512'],
  ['favicon-256.png', '256:256'],
];
for (const [name, size] of sizes) {
  ff([ffmpeg, '-y', '-i', LOGO, '-vf', `scale=${size}`, path.join(FAV_DIR, name)]);
}

// og:image — 1200x630 (center-crop the square logo)
ff([ffmpeg, '-y', '-i', LOGO, '-vf', 'scale=1200:1200,crop=1200:630:0:285', '-q:v', '2', path.join(MERGED, 'images', 'share_asset.jpg')]);

// ICO wrapping the 256 PNG; SVG embedding a 512 PNG
buildIco(path.join(FAV_DIR, 'favicon-256.png'), path.join(FAV_DIR, 'favicon.ico'));
buildSvg(path.join(FAV_DIR, 'web-app-manifest-512x512.png'), path.join(FAV_DIR, 'favicon.svg'));
fs.rmSync(path.join(FAV_DIR, 'favicon-256.png'), { force: true });

// site.webmanifest: theme/background to the site dark-blue
const manifest = path.join(FAV_DIR, 'site.webmanifest');
if (fs.existsSync(manifest)) {
  let t = fs.readFileSync(manifest, 'utf8');
  t = t.split('"theme_color": "#ffffff"').join('"theme_color": "#020a19"');
  t = t.split('"background_color": "#ffffff"').join('"background_color": "#020a19"');
  fs.writeFileSync(manifest, t, 'utf8');
}

console.log('brand-assets: generated favicon set + share_asset.jpg');