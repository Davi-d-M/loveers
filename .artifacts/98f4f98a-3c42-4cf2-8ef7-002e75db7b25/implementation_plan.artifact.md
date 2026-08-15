# Implementation Plan - Final "Bulletproof" Render Fix

This plan resolves the persistent "Frontend build not found" error on Render by implementing recursive path searching and comprehensive environment logging.

## Proposed Changes

### [Server] "Smart" Path Discovery
Update the server to actively look for the `dist` folder instead of relying on a single hardcoded path.

#### [MODIFY] [server.ts](file:///C:/Users/hp/AndroidStudioProjects/love/server.ts)
- Implement a `findDistPath()` helper that checks:
    - `./dist`
    - `../dist`
    - `./src/dist`
    - `process.cwd()/dist`
- Log the entire directory structure (one level deep) to the console if the build is still missing. This will give us the exact roadmap of the Render server.
- Add an automatic redirect from `/` to the first available `index.html`.

### [Build] Build Step Verification
Ensure the build process is producing files where the server expects them.

#### [MODIFY] [package.json](file:///C:/Users/hp/AndroidStudioProjects/love/package.json)
- Update build command: `vite build && echo "Build complete" && ls -R dist || dir /s dist` (standardizing output check).
- Ensure `typescript` and `tsx` are firmly in `dependencies`.

## Verification Plan

### Manual Verification
1. **Local Test**: Verify the server finds `dist` even if started from different subfolders.
2. **Render Logs**: Check the new logs on Render to see the "Smart Discovery" in action.
3. **Emergency Fallback**: If it still fails, the logs will show the exact directory tree, allowing for a 1-minute final fix.
