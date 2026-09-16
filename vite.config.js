import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readdirSync, existsSync } from 'node:fs';

const input = { main: resolve('index.html'), notFound: resolve('404.html') };
for (const folder of ['experiments', 'notes', 'projects', 'research', 'credits', 'lab']) {
  if (!existsSync(folder)) continue;
  if (existsSync(resolve(folder, 'index.html'))) input[folder] = resolve(folder, 'index.html');
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const file = resolve(folder, entry.name, 'index.html');
    if (entry.isDirectory() && existsSync(file)) input[`${folder}-${entry.name}`] = file;
  }
}

// The user-site repository is published at the domain root, not a project subpath.
export default defineConfig({
  base: '/',
  build: {
    target: 'es2022',
    rollupOptions: {
      input,
      output: {
        manualChunks(id) { if (id.includes('node_modules/three')) return 'three'; }
      }
    }
  },
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' }
});
