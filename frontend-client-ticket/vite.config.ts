import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Triggering Vite Restart to load Tailwind CSS config
export default defineConfig({
  plugins: [react()],
  base: '/client/',
})
