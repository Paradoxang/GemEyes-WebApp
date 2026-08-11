import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Sin Tailwind: la demo se estiliza con una hoja de CSS a mano.
// Puerto distinto al del proyecto principal (5174) para tener las dos versiones
// levantadas a la vez y compararlas lado a lado.
export default defineConfig({
  plugins: [react()],
  server: { port: 5175 },
})
