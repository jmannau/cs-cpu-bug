import { defineConfig } from "vite";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";

/**
 * Vite Config, based on https://github.com/cornerstonejs/vite-react-cornerstone3d/blob/b964f8633943556debd171af77740fffa5075842/vite.config.ts#L4
 */
const c = defineConfig({
  plugins: [
    // for dicom-parser
    viteCommonjs(),
  ],
  // seems like only required in dev mode
  optimizeDeps: {
    exclude: ["@cornerstonejs/dicom-image-loader"],
    include: ["dicom-parser"],
  },
  worker: {
    format: "es",
    rollupOptions: {
      external: ["@icr/polyseg-wasm"],
    },
  },
});
export default c;
