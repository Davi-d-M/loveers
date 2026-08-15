# Implementation Plan - Definitive Render Fix & Secret Vault Polish

This plan resolves the "Frontend build not found" error on Render and ensures the Secret Vault (Password Protection) is robust and easy to use.

## Proposed Changes

### [Server] Definitive Path Resolution
Ensure the server serves the frontend files correctly on Render by simplifying the static serving logic.

#### [MODIFY] [server.ts](file:///C:/Users/hp/AndroidStudioProjects/love/server.ts)
- Simplify path resolution to use `path.join(process.cwd(), 'dist')`.
- Remove the conditional `fs.existsSync` check for `express.static` to let Express handle the mapping.
- Add more detailed logging for Paystack verification to catch "System Errors" early.

### [UX] Secret Vault Polish
Make the password protection feature more obvious and robust.

#### [MODIFY] [App.tsx](file:///C:/Users/hp/AndroidStudioProjects/love/src/App.tsx)
- **Sender UI**: Update the "Secret Word" section to have a clearer "Save" feedback.
- **Recipient UI**: Fix a potential loop where a wrong password might not show a clear error message.
- **Cleanup**: Double-check for any remaining "non-memory" content (AI content).

### [Build] Clean Dependencies
Ensure Render has everything it needs to build successfully.

#### [MODIFY] [package.json](file:///C:/Users/hp/AndroidStudioProjects/love/package.json)
- Ensure all build-time tools like `tsx` are in `dependencies` (not `devDependencies`) because Render needs them at runtime.

## Verification Plan

### Automated Tests
- Run `npm run build` locally.
- Start the server and verify it serves `index.html` correctly.

### Manual Verification
1. **Unbox Test**: Set a secret word, open the link, and verify the password prompt works.
2. **Payment Test**: Monitor the logs for a successful Paystack handshake.
