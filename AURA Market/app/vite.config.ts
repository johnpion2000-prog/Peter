import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'vendor':   ['react', 'react-dom', 'react-router-dom'],
          'ui':       ['@headlessui/react', '@heroicons/react/24/outline', '@heroicons/react/24/solid', '@heroicons/react/20/solid'],
          'forms':    ['react-hook-form', '@hookform/resolvers', 'zod'],
          'state':    ['zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
