import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Note: Keep proxy on /api/* to hit Express on 5177
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5177',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 5176,
    strictPort: true
  }
});
