# Implementation Plan - Cleanup & Vercel Optimization

This plan cleans the app of all AI-generated content and static "mock" text, leaving only the user's real memories. It also optimizes the build for Vercel.

## Proposed Changes

### [Cleanup] Remove AI & Mock Content
Ensure the app is 100% focused on user-uploaded memories.

#### [MODIFY] [App.tsx](file:///C:/Users/hp/AndroidStudioProjects/love/src/App.tsx)
- **Remove AI**: Delete the "Magic Write" button and logic.
- **Remove Quotes**: Delete the "Inspire Me" button and the `LOVE_QUOTES` list.
- **Remove Love Hub**: Delete the "Hub of Modern Romance" section from the homepage.
- **Remove Memory Garden**: Remove the "Garden" view toggle (keeping only Classic and Constellation).

#### [MODIFY] [server.ts](file:///C:/Users/hp/AndroidStudioProjects/love/server.ts)
- Delete all Gemini/AI endpoints (`/api/gemini/*`).

### [Build] Vercel Optimization
Fix runtime crashes and build warnings.

#### [MODIFY] [server.ts](file:///C:/Users/hp/AndroidStudioProjects/love/server.ts)
- Ensure no development-only packages are imported at the top level.
- Refine the static file serving logic for the `dist` folder.

### [SEO] Optimized Tags
Keep the search-engine logic so you still rank for "Love" topics, but keep the UI clean.

#### [MODIFY] [index.html](file:///C:/Users/hp/AndroidStudioProjects/love/index.html)
- Retain the meta tags and Schema.org data for AI recommendations.

## Verification Plan

### Automated Tests
- Run `npm run build` locally to ensure zero warnings.
- Run `npm run lint` to confirm all removed logic is fully purged.

### Manual Verification
1. **Clean UI**: Open the homepage and verify the "Love Hub" is gone.
2. **Clean Modals**: Verify the "Magic Write" and "Inspire Me" buttons are removed from the Note modal.
3. **Constellation Check**: Ensure the 3D Constellation view still works perfectly.
4. **Deploy**: Push to GitHub and verify Vercel shows a green "Ready" status.
