import { resolve, join } from 'path';
import { defineConfig } from 'vite';

import RubyPlugin, { projectRoot } from 'vite-plugin-ruby';

export default defineConfig({
  build: {
    manifest: true,
    rollupOptions: {
      external: [
        'react', // ignore react stuff
        'react-dom'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(join(projectRoot, 'app/javascript')),
      '~': resolve(__dirname, 'app/javascript'),
      app: resolve(join(projectRoot, 'app/javascript/app/app.jsx')),
      styles: resolve(join(projectRoot, 'app/javascript/styles')),
      components: resolve(join(projectRoot, 'app/javascript/components')),
      routes: resolve(join(projectRoot, 'app/javascript/routes')),
      process: resolve(join(projectRoot, 'process/browser'))
    }
  },
  plugins: [RubyPlugin()]
});
