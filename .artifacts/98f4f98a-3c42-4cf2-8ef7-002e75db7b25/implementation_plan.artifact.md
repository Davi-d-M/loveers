# Implementation Plan - Fix Render Deployment & Redirection Issue

This plan resolves the "Module Not Found" error on Render by restoring the server build step and ensures the "Browser Shield" redirection is stable.

## Proposed Changes

### [Build] Restore Server Bundling
Render and other persistent hosting platforms (like Bun/Node) need the backend server to be compiled into the `dist` folder.

#### [MODIFY] [package.json](file:///C:/Users/hp/AndroidStudioProjects/love/package.json)
- Update the `build` script to include `esbuild server.ts`.
- Add the `start` script back if it was removed or modified.
- **New build command**: `vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs`

### [UX] Browser Shield Refinement
Ensure the redirection logic only triggers when absolutely necessary and doesn't interfere with standard browsers.

#### [MODIFY] [App.tsx](file:///C:/Users/hp/AndroidStudioProjects/love/src/App.tsx)
- Add a "Try anyway" option to the Browser Shield to allow users to bypass it if they choose.
- Improve detection to be more surgical.

## Verification Plan

### Automated Tests
- Run `npm run build` locally and verify `dist/server.cjs` exists.
- Run `npm run lint` to ensure no environment mismatches.

### Manual Verification
1. **Local Production Test**: Run `npm run build` then `npm start`. Verify the site loads at `localhost:3000`.
2. **Push to Render/Vercel**: Push the changes and verify the "Module Not Found" error is resolved in the logs.
