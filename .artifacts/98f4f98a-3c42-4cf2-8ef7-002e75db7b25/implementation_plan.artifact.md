# Implementation Plan - The "Premium Ethereal" Update

This plan adds the Secret Word security, 3D Constellation View, Background Moods, and Recipient Reactions to EverGift.

## User Review Required

> [!IMPORTANT]
> **Secret Word Flow**: As requested, the sender will set the "Secret Word" *after* the payment is verified, on the same screen where they get their share link. This makes it feel like a "Premium Upgrade."

> [!NOTE]
> **Supabase Update**: The recipient will need permission to update the `reactions` field in the database. I will implement this via a secure backend call to ensure they can't change the actual gift content.

## Proposed Changes

### [Personalization] Custom Gift Wrapping
Allow the sender to choose the look and feel of the package.
- **Themes**:
    - *Midnight Sky*: Dark blue background with CSS-animated silver stars.
    - *Rose Quartz*: Soft pink palette with a CSS "ribbon" overlay.
    - *Vintage Letter*: Parchment texture, typewriter fonts, and a wax seal icon.
- **Visuals**: Update the `box-visual` (lid and body) to reflect the selected theme colors and textures.

### [Security] Secret Word Protection
- **Sender Side**: Add an "Add Password Protection" section to the `sealed` screen (post-payment).
- **Recipient Side**: Add a "Vault Lock" screen that appears before the unwrap animation if a secret word is set.

### [UX] 3D Constellation View
- **New Visualization**: Each tucked item will be rendered as a glowing, pulsing star in a deep 3D space.
- **Interaction**: Clicking a star will "zoom" the camera into the card.

### [Atmosphere] Background Moods
- **Selection**: Add a "Pick a Mood" selector in the `create` flow.
- **Player**: A subtle audio player that starts when the box is opened, with options: *Soft Piano, Gentle Rain, Lo-Fi Beats*.

### [Feedback] Recipient Reactions
- **Interaction**: Add a "Send Love" button at the bottom of the `view` screen.
- **Storage**: Save the reaction (heart/note) back to the Supabase record.

## Proposed Data Structure (JSON)
I will expand the `data` blob in Supabase to include:
```json
{
  "secretWord": "...",
  "mood": "piano | rain | lofi",
  "reactions": { "hearts": 0, "message": "..." }
}
```

## Verification Plan

### Automated Tests
- Verify `secretWord` hashing (or simple matching) works to gate access.
- Ensure audio files load and play without blocking the UI.

### Manual Verification
1. **Security**: Set a secret word, open the link in incognito, and verify you can't see the box without it.
2. **Stars**: Toggle "Constellation View" and check the 3D zoom effect.
3. **Reactions**: Send a heart as a recipient and check the Supabase dashboard to see it recorded.
