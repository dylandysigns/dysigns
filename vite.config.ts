import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import fs from 'fs'
import { parseEntry } from './src/app/content/parse'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Turns content/**/*.md into finished data at build time and serves it as
// `virtual:content` (consumed by src/app/content/loadContent.ts), so the
// browser never downloads `marked` or parses markdown on page load.
// Keys match what import.meta.glob("/content/**/*.md") used to produce.
function contentPlugin(): Plugin {
  const VIRTUAL = 'virtual:content'
  const RESOLVED = '\0' + VIRTUAL
  const contentDir = path.resolve(__dirname, 'content')
  const listFiles = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
      const p = path.join(dir, d.name)
      return d.isDirectory() ? listFiles(p) : d.name.endsWith('.md') ? [p] : []
    })

  return {
    name: 'dysigns-content',
    resolveId(id) {
      if (id === VIRTUAL) return RESOLVED
    },
    load(id) {
      if (id !== RESOLVED) return
      const entries: Record<string, unknown> = {}
      for (const file of listFiles(contentDir).sort()) {
        this.addWatchFile(file)
        const key = '/' + path.relative(__dirname, file).split(path.sep).join('/')
        entries[key] = parseEntry(key, fs.readFileSync(file, 'utf8'))
      }
      return `export default ${JSON.stringify(entries)};`
    },
    configureServer(server) {
      // Re-run the module (full reload) when a content file is added,
      // changed or removed during `npm run dev`.
      const reload = (file: string) => {
        if (!file.startsWith(contentDir) || !file.endsWith('.md')) return
        const mod = server.moduleGraph.getModuleById(RESOLVED)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.add(contentDir)
      server.watcher.on('add', reload)
      server.watcher.on('change', reload)
      server.watcher.on('unlink', reload)
    },
  }
}

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    contentPlugin(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
