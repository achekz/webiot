import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const PORT = 3039;
const DISABLE_ESLINT = process.env.VITE_DISABLE_ESLINT === 'true';

export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
      ...(DISABLE_ESLINT
        ? {}
        : {
            eslint: {
              useFlatConfig: true,
              lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
              dev: { logLevel: ['error'] },
            },
          }),
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^src(.+)/,
        replacement: path.resolve(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: { port: PORT, host: true },
  preview: { port: PORT, host: true },
});
