# Implementation Plan - Paystack Config & Webhook Stability

This plan resolves the payment redirection issue by aligning the Paystack dashboard settings with your current live domain and adding a fallback webhook endpoint for reliability.

## User Review Required

> [!IMPORTANT]
> **Action Required in Paystack Dashboard**:
> You must manually update your Paystack settings as shown in your screenshot to match your new domain.
> - **Live Callback URL**: `https://loveers-viyx.onrender.com/`
> - **Live Webhook URL**: `https://loveers-viyx.onrender.com/api/paystack/webhook`

## Proposed Changes

### [Server] Add Webhook Support
Add a dedicated endpoint to handle Paystack events asynchronously, ensuring no payment is ever missed even if the user closes their browser early.

#### [MODIFY] [server.ts](file:///C:/Users/hp/AndroidStudioProjects/love/server.ts)
- Add `app.post("/api/paystack/webhook")` endpoint.
- Implement basic signature verification (optional but recommended for production).
- Log webhook events for easier debugging.

### [UX] Dynamic Callback Handling
Ensure the frontend handles the redirect from Paystack gracefully.

#### [MODIFY] [App.tsx](file:///C:/Users/hp/AndroidStudioProjects/love/src/App.tsx)
- Add logic to check for a `trxref` or `reference` in the URL on load (Paystack appends these after redirect).
- Automatically trigger the "Success" screen if a valid reference is found.

## Verification Plan

### Manual Verification
1. **Dashboard Check**: Confirm the URLs in Paystack match the ones listed above.
2. **Payment Flow**: Complete a test payment and verify that you are redirected back to the correct "Sealed" screen on your new domain.
3. **Webhook Log**: Check Render logs to see if the webhook event was received.
