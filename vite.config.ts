import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        '404': resolve(__dirname, '404.html'),
        'og-image': resolve(__dirname, 'og-image.html'),
        'online-retail': resolve(__dirname, 'projects/online_retail_sales.html'),
        'web-scraping': resolve(__dirname, 'projects/web_scraping_mls.html'),
        'presentation': resolve(__dirname, 'projects/ProjectPresentation-demo.html'),
        'consumer-financial': resolve(__dirname, 'projects/consumer_financial.html'),
        'powerbi': resolve(__dirname, 'projects/power_bi_dashboard.html'),
        'project-template': resolve(__dirname, 'projects/Project-template.html'),
      },
    },
  },
});
