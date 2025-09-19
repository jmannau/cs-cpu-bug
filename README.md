# Cornerstone.js CPU Rendering Bug Reproduction

This repository contains a minimal reproduction case for a bug that occurs when using CPU rendering in Cornerstone.js 3D with the `.setDisplayArea` method.

## Bug Description

If Cornerstone3D (latest, v4.3.x at the time of writing) is used with CPU rendering, an error is thrown when calling `viewport.setDisplayArea`.

See file://./src/cornerstoneUtils.js line 85 for the relevant code.

If CPU rendering is enabled, calling `viewport.setDisplayArea` results in the following error:

```
StackViewport.js:812 Uncaught TypeError: Cannot destructure property 'focalPoint' of 'cameraInterface' as it is undefined.
    at StackViewport.setCameraCPU (StackViewport.js:812:17)
    at StackViewport.setDisplayArea (Viewport.js:391:14)
    at initializeCornerstone (cornerstoneUtils.js:61:12)
    at async cs-cpu.js:5:18
```

## Setup Instructions

1. **Clone the repository**:

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   ```

4. **Open the test pages**:
   - Navigate to `http://localhost:5173/c3d-gpu.html` for default rendering with GPU enabled
   - Navigate to `http://localhost:5173/c3d-cpu.html` for CPU rendering
