#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

async function minifyJs(input, output) {
  try {
    const esbuild = require('esbuild');
    await esbuild.build({
      entryPoints: [input],
      outfile: output,
      minify: true,
      bundle: false,
      target: ['es2018'],
    });
    return true;
  } catch {
    fs.copyFileSync(input, output);
    return false;
  }
}

function minifyCss(input, output) {
  try {
    const CleanCSS = require('clean-css');
    const src = fs.readFileSync(input, 'utf8');
    const out = new CleanCSS({ level: 2 }).minify(src);
    fs.writeFileSync(output, out.styles);
    return true;
  } catch {
    fs.copyFileSync(input, output);
    return false;
  }
}

async function main() {
  const pairs = [
    ['public/js/app.js', 'public/js/app.min.js'],
    ['public/js/admin.js', 'public/js/admin.min.js'],
    ['public/css/styles.css', 'public/css/styles.min.css'],
    ['public/css/admin.css', 'public/css/admin.min.css'],
  ];

  for (const [src, dest] of pairs) {
    const input = path.join(ROOT, src);
    const output = path.join(ROOT, dest);
    if (!fs.existsSync(input)) continue;
    if (src.endsWith('.js')) await minifyJs(input, output);
    else minifyCss(input, output);
    const inSize = fs.statSync(input).size;
    const outSize = fs.statSync(output).size;
    console.log(`${src} → ${dest} (${inSize} → ${outSize} bytes)`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
