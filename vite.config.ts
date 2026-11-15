import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { parseEntry } from './src/app/content/parse'
import { buildFaqIndex, plainAnswer } from './src/app/content/faqIndex'
import { buildKnowledgeChunks } from './src/app/content/knowledgeChunks'
import { projects } from './src/app/data/projects'
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

  const readEntries = () => {
    const entries: Record<string, ReturnType<typeof parseEntry>> = {}
    for (const file of listFiles(contentDir).sort()) {
      const key = '/' + path.relative(__dirname, file).split(path.sep).join('/')
      entries[key] = parseEntry(key, fs.readFileSync(file, 'utf8'))
    }
    return entries
  }

  return {
    name: 'dysigns-content',
    resolveId(id) {
      if (id === VIRTUAL) return RESOLVED
    },
    load(id) {
      if (id !== RESOLVED) return
      for (const file of listFiles(contentDir)) this.addWatchFile(file)
      return `export default ${JSON.stringify(readEntries())};`
    },
    // dist/faq-index.json: the knowledge functions/api/faq-chat.js answers
    // from. `text` is embedded with Workers AI to find relevant questions,
    // `context` (answer with its markdown links) is what the chat model
    // reads. `version` changes whenever any question or answer does, so
    // the function knows its cached vectors are stale.
    // Page sections and case studies (knowledgeChunks.ts) go in the same
    // file, so the chat can also answer about cases, the studio and the
    // services beyond what the FAQ covers.
    generateBundle() {
      const entries = readEntries()
      const faqItems = buildFaqIndex(entries).map((i) => ({
        id: i.id,
        lang: i.lang,
        text: `${i.question}\n${plainAnswer(i.answer)}`,
        context: `${i.question}\n${i.answer}`,
        question: i.question,
        href: i.href,
        label: i.pageLabel,
        isHome: i.isHome,
      }))
      const pageItems = buildKnowledgeChunks(entries, projects).map((c) => ({
        id: c.id,
        lang: c.lang,
        text: c.text,
        context: c.text,
        question: c.title,
        href: c.href,
        label: c.label,
        isHome: c.isHome,
      }))
      const items = [...faqItems, ...pageItems]
      const version = crypto
        .createHash('sha256')
        .update(JSON.stringify(items))
        .digest('hex')
        .slice(0, 12)
      this.emitFile({
        type: 'asset',
        fileName: 'faq-index.json',
        source: JSON.stringify({ version, items }),
      })
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
