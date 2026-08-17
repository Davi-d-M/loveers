# Implementation Plan - Exceptional Media Experience

This plan focuses on making the music, voice, and video features "wonderful" by adding file uploads for songs and creating a custom, themed media player for the recipient.

## Proposed Changes

### [UX] High-End Media Players
Replace standard browser controls with boutique, "scrapbook-style" players.

#### [MODIFY] [App.tsx](file:///C:/Users/hp/AndroidStudioProjects/love/src/App.tsx)
- **Song Upload**: Add a file picker for audio files in the "Add Song" modal.
- **Custom Player Component**: Create a `BoutiqueAudioPlayer` component that uses Lucide icons and matches the app's aesthetic.
- **Media Toggling**: Ensure background music pauses automatically when a user plays a tucked song or voice note.
- **Video Aesthetics**: Add a subtle "Polaroid vignette" and rounded corners to all video embeds.

### [Logic] Audio Quality & Handling
Ensure the audio is clear and handles large files gracefully.

#### [MODIFY] [App.tsx](file:///C:/Users/hp/AndroidStudioProjects/love/src/App.tsx)
- **Audio Compression**: Implement a basic check for file size (max 10MB) for uploads.
- **Voice Note Polish**: Improve the "Recording" feedback with a smoother pulsing animation.

## Verification Plan

### Manual Verification
1. **Song Upload Test**: Upload an mp3 and verify it plays within the scrapbook.
2. **Video Look Test**: Check if YouTube and uploaded videos have the new "Ethereal" styling.
3. **Audio Conflict Test**: Play a voice note while background music is on. Background music should pause.
4. **Wonderful Experience Check**: Verify that all media interactions feel smooth, premium, and meaningful.
