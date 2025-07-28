import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue()
  ],
  esbuild: {
    // Disable TypeScript checking by setting this option to false
    tsconfigRaw: JSON.stringify({
      compilerOptions: {
        noEmitOnError: false,  // Allows emitting files even if there are type errors
      }
    })
  }
});
