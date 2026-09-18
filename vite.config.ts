import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'STORAGE_', 'SUPABASE_'],
  server: {
    port: 3000
  }
})
