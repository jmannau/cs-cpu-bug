// @ts-check

import { initializeCornerstone } from "./cornerstoneUtils";

const viewport = await initializeCornerstone(
  document.getElementById("cornerstone")
);
