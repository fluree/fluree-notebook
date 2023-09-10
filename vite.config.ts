import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/fluree': 'http://ledger.local:58090/fluree',
    },
  },
  plugins: [react()],
});
