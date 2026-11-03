// render.mjs <kb-root> <page.svx> <out.html> — server-renders one kb page the way the desk's build does.
import { createServer } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import fs from 'node:fs';
import path from 'node:path';

const [root, page, out] = process.argv.slice(2).map((p) => path.resolve(p));
const vite = await createServer({
  root,
  configFile: false,
  logLevel: 'warn',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false },
  resolve: { alias: { '#lib': path.join(root, 'src/lib') } },
  plugins: [
    svelte({
      extensions: ['.svelte', '.svx'],
      preprocess: [mdsvex({ extensions: ['.svx'], layout: { runbook: path.join(root, 'src/lib/layouts/runbook.svelte') } })],
      compilerOptions: { css: 'injected' },
    }),
  ],
});
try {
  // Load svelte/server through vite too, so the page and the renderer share one svelte instance.
  const { render } = await vite.ssrLoadModule('svelte/server');
  const mod = await vite.ssrLoadModule(page);
  const { head, body } = render(mod.default);
  fs.writeFileSync(out, `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`);
  console.log('wrote', out, fs.statSync(out).size, 'bytes');
} finally {
  await vite.close();
}
