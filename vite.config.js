import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'frontend/src/main.jsx',
      formats: ['iife'],
      name: 'Lookbook',
      fileName: () => 'lookbook.js',
    },
    outDir: 'assets',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        assetFileNames: 'lookbook.[ext]',
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
})
