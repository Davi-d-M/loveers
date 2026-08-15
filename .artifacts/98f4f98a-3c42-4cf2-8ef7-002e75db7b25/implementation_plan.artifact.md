# Implementation Plan - Final Reliability & Instagram Fix

This plan fixes the Instagram loading issue and resolves the "System error during verification" seen on the live Vercel site.

## Proposed Changes

### [UX] Instagram & Facebook "Browser Shield"
Stop the app from breaking inside restricted in-app browsers.

#### [MODIFY] [App.tsx](file:///C:/Users/hp/AndroidStudioProjects/love/src/App.tsx)
- Add `isRestrictedBrowser` detection.
- Show an Ethereal Shield screen if inside IG/FB with a button to open in Chrome/Brave/Safari.
- Add an automatic Android Intent redirect to try and "break out" to a real browser.

### [Security] Fix Payment Verification
Resolve the "System error" seen on Vercel.

#### [MODIFY] [App.tsx](file:///C:/Users/hp/AndroidStudioProjects/love/src/App.tsx)
- Update the verification fetch to handle potential network errors more gracefully.
- Add detailed logging to help the user debug if it fails again.

### [UX] Vault Password Integration
Ensure the secret word flow is seamless.

#### [MODIFY] [App.tsx](file:///C:/Users/hp/AndroidStudioProjects/love/src/App.tsx)
- Refine the "Vault Locked" UI to match the premium unboxing aesthetic.

## Verification Plan

### Manual Verification
1. **Instagram Test**: Open the link in Instagram and verify the Shield appears.
2. **Payment Test**: Complete a test payment on Vercel and verify the "System error" is gone.
3. **Vault Test**: Set a secret word and verify the recipient is prompted to enter it.
