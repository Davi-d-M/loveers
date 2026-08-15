# Implementation Plan - Custom Music Upload & Audio Controls

This plan adds the ability for senders to upload their own background music from their device and provides a play/pause controller for recipients.

## Proposed Changes

### [Upload] Local Music Selection
Allow users to pick a song from their phone to play during the unboxing.

#### [MODIFY] [App.tsx](file:///C:/Users/hp/AndroidStudioProjects/love/src/App.tsx)
- Add a "Custom Upload" option to the background mood selection.
- Implement `handleMusicFile` to read the audio file as a base64 string (with a 10MB limit).
- Store the custom audio in a new `customAudioSrc` field in the package payload.

### [UX] Play/Pause Controller
Add a subtle floating music control for the recipient.

#### [MODIFY] [App.tsx](file:///C:/Users/hp/AndroidStudioProjects/love/src/App.tsx)
- Add a state `isAudioPlaying` to track playback.
- Implement a small floating music button (using `Music` / `Pause` / `Play` icons) in the `view` screen.
- Ensure the controller works with both pre-set "Moods" and "Custom Uploads".

### [Atmosphere] Audio Logic
- Update the unboxing sequence to prioritize `customAudioSrc` if available.
- Ensure Voice Notes still work independently (the background music should ideally dim or pause when a VN is played, but for simplicity, we will start with a manual toggle).

## Verification Plan

### Manual Verification
1. **Upload Test**: In "Pack a package", choose "Custom" mood, select an MP3 from your phone, and verify it can be added.
2. **Unwrap Test**: Open the box and verify the custom song starts playing.
3. **Control Test**: Use the new pause/play button to stop and restart the music.
4. **Volume Check**: Ensure the custom audio isn't too loud or quiet compared to the system sounds.
