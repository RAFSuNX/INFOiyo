import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Handle Cloudflare RUM requests
      '/cdn-cgi/rum': {
        target: 'https://infoiyo.cc',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
        }
      },
      // Handle www and non-www redirects
      '^/.*': {
        target: 'https://infoiyo.cc',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            const host = req.headers.host;
            if (host?.startsWith('www.')) {
              proxyReq.setHeader('Location', `https://infoiyo.cc${req.url}`);
              proxyReq.setHeader('Status-Code', '301');
            }
          });
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  }
});
