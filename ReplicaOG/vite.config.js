import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Puerto distinto al del proyecto principal (5174) para poder tener las dos
// versiones levantadas a la vez y compararlas lado a lado.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5175 },
})
