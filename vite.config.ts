import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/proxy-pncp': {
            target: 'https://pncp.gov.br',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/proxy-pncp/, ''),
            secure: false,
          },
          '/proxy-painel': {
            target: 'https://paineldeprecos.planejamento.gov.br',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/proxy-painel/, ''),
            secure: false,
          },
          '/proxy-compras': {
            target: 'https://compras.dados.gov.br',
            changeOrigin: true,
            rewrite: (p) => p.replace(/^\/proxy-compras/, ''),
            secure: false,
          },
        },
      },
      plugins: [react()],
      define: {
        // OpenRouter — chave principal
        'import.meta.env.VITE_OPENROUTER_API_KEY': JSON.stringify(env.VITE_OPENROUTER_API_KEY || env.OPENROUTER_API_KEY),
        // Mantido para compatibilidade retroativa
        'process.env.API_KEY': JSON.stringify(env.VITE_OPENROUTER_API_KEY || env.OPENROUTER_API_KEY),
        'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
