/// <reference types="vitest/config" />
import { createHash } from 'node:crypto'
import { extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react-swc'
import { globSync } from 'glob'
import preserveDirectives from 'rollup-preserve-directives'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    dts({
      tsconfigPath: fileURLToPath(
        new URL('tsconfig.lib.json', import.meta.url),
      ),
      exclude: '**/*.stories.ts',
    }),
    preserveDirectives(),
  ],
  css: {
    devSourcemap: true,
    modules: {
      generateScopedName: (className, filename) => {
        const hash = createHash('sha256')
          .update(filename)
          .update(className)
          .digest('base64')
          .replace(/\//g, '')
          .replace(/\+/g, '')
          .substring(0, 5)
        return `${className}__${hash}`
      },
    },
  },
  build: {
    copyPublicDir: false,
    lib: {
      entry: fileURLToPath(new URL('src/components/main.ts', import.meta.url)),
      formats: ['es'],
    },
    rolldownOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      input: Object.fromEntries(
        globSync('src/**/*.{ts,tsx}', {
          ignore: [
            'src/**/*types*.ts',
            'src/**/*stories*.ts',
            'src/**/*test.{ts,tsx}',
          ],
        }).map((file) => [
          relative('src', file.slice(0, file.length - extname(file).length)),
          fileURLToPath(new URL(file, import.meta.url)),
        ]),
      ),
      output: {
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: '[name].js',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './__tests__/setupVitest.ts',
    coverage: {
      provider: 'v8',
      //include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '*.scss',
        'src/components/main.ts',
        'src/components/**/*.stories.ts',
      ],
      clean: true,
    },
  },
})
