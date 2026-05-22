import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import os from 'os';
import mkcert from 'vite-plugin-mkcert';

function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (
        net.family === 'IPv4' &&
        !net.internal
      ) {
        return net.address;
      }
    }
  }

  return 'localhost';
}

const ip = getLocalIP();

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    https: true,    
    proxy: {
      '/api': {
        target: `http://${ip}:3000`,
      },
      '/ws': {
        target: `ws://${ip}:3000`,
        ws: true,
      },
    },
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
    mkcert(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
