// Builds src/ into dist/.
// - Every <link ... data-inline> and <script src=... data-inline> is replaced by an
//   inline <style>/<script> containing that file, so pages ship as single files.
// - HTML (with its inline CSS/JS) and standalone .css/.js files are minified
//   unless --no-minify is passed.
// - All other files are copied as-is. src/inline/ is not copied (it only feeds pages).
//
// Usage: node scripts/build.mjs [--no-minify] [--out <dir>]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'html-minifier-terser';
import { minify as minifyJs } from 'terser';
import CleanCSS from 'clean-css';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const shouldMinify = !args.includes('--no-minify');
const outArg = args.indexOf('--out');
const SRC = path.join(root, 'src');
const OUT = path.resolve(root, outArg > -1 ? args[outArg + 1] : 'dist');
const INLINE_DIR = path.join(SRC, 'inline');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

function readRef(pageFile, ref) {
  const file = path.resolve(path.dirname(pageFile), ref);
  if (!fs.existsSync(file)) throw new Error(`${path.relative(SRC, pageFile)}: missing ${ref}`);
  return fs.readFileSync(file, 'utf8').trim();
}

function inlineAssets(html, pageFile) {
  return html
    .replace(/<link\b[^>]*\bdata-inline\b[^>]*>/g, (tag) => {
      const href = tag.match(/\bhref="([^"]+)"/)[1];
      return `<style>\n${readRef(pageFile, href)}\n</style>`;
    })
    .replace(/<script\b[^>]*\bdata-inline\b[^>]*><\/script>/g, (tag) => {
      const src = tag.match(/\bsrc="([^"]+)"/)[1];
      // Guard against a literal "</script" ending the inline block early.
      const js = readRef(pageFile, src).replace(/<\/script/gi, '<\\/script');
      return `<script>\n${js}\n</script>`;
    });
}

const minifyOptions = {
  collapseWhitespace: true,
  conservativeCollapse: true, // keep one space where whitespace was, so inline layout is unchanged
  removeComments: true,
  minifyCSS: true,
  minifyJS: { mangle: false, compress: false }, // whitespace only: keep names (used by onclick="") and logic as written
  keepClosingSlash: false,
};

async function build() {
  const start = Date.now();
  fs.rmSync(OUT, { recursive: true, force: true });
  let pages = 0;
  let files = 0;
  for (const file of walk(SRC)) {
    if (file.startsWith(INLINE_DIR + path.sep)) continue;
    const rel = path.relative(SRC, file);
    const dest = path.join(OUT, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (file.endsWith('.html')) {
      let html = inlineAssets(fs.readFileSync(file, 'utf8'), file);
      if (shouldMinify) html = await minify(html, minifyOptions);
      fs.writeFileSync(dest, html);
      pages++;
    } else if (shouldMinify && file.endsWith('.js')) {
      const { code } = await minifyJs(fs.readFileSync(file, 'utf8'), minifyOptions.minifyJS);
      fs.writeFileSync(dest, code);
      files++;
    } else if (shouldMinify && file.endsWith('.css')) {
      const { styles, errors } = new CleanCSS().minify(fs.readFileSync(file, 'utf8'));
      if (errors.length) throw new Error(`${rel}: ${errors.join('; ')}`);
      fs.writeFileSync(dest, styles);
      files++;
    } else {
      fs.copyFileSync(file, dest);
      files++;
    }
  }
  console.log(
    `Built ${pages} pages + ${files} files into ${path.relative(root, OUT) || OUT}` +
      `${shouldMinify ? '' : ' (not minified)'} in ${Date.now() - start}ms`,
  );
}

build().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
