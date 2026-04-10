import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/tools/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'citation': ['./src/components/citation/CitationMonitor.jsx'],
          'pagebuilder': ['./src/components/pagebuilder/PageBuilder.jsx'],
        }
      }
    }
  }
});
