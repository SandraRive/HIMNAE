/**
 * Genera una versión de HIMNAE en un único archivo HTML (dist/himnae.html),
 * con el CSS y el JavaScript dentro. Sirve para abrirla sin servidor
 * (doble clic) o para publicarla en sitios que solo aceptan un archivo.
 *
 * Uso:  npm run build
 */
import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (p) => readFile(new URL(p, root), 'utf8');

// 1. JavaScript: todos los módulos en un solo bloque
const js = await build({
  entryPoints: [new URL('js/main.js', root).pathname],
  bundle: true, format: 'iife', minify: true, write: false, target: 'es2020',
});
const script = js.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

// 2. CSS: los cuatro archivos en orden
const css = (await Promise.all(['css/tokens.css', 'css/base.css', 'css/components.css', 'css/views.css'].map(read))).join('\n');

// 3. HTML: se sustituyen los <link> locales y el <script type="module">
let html = await read('index.html');
html = html.replace(/\s*<!-- Estilos[^>]*-->/, '')
  .replace(/(\s*<link rel="stylesheet" href="css\/[^"]+">)+/, `\n  <style>\n${css}\n  </style>`)
  .replace('<script type="module" src="js/main.js"></script>', `<script>\n${script}</script>`);

await mkdir(new URL('dist/', root), { recursive: true });
await writeFile(new URL('dist/himnae.html', root), html);
console.log(`dist/himnae.html (${(html.length / 1024).toFixed(0)} KB)`);
