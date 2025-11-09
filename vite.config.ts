import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path" ;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve:{
    alias: {
      "@" : path.resolve(__dirname,"./src"),
      "@api" : path.resolve(__dirname, "./src/api"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"), 

    }
  }
})
