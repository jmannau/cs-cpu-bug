// @ts-check

import { initializeCornerstone } from "./cornerstoneUtils";

const viewport = await initializeCornerstone(
  document.getElementById("cornerstone"),
  {
    rendering: { useCPURendering: true },
  }
);
