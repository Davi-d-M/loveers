import { KeepsakeBox } from "../types";

export const sampleBoxes: KeepsakeBox[] = [
  {
    id: "box-1",
    slug: "our-5-year-journey",
    title: "Our 5-Year Chapter ❤️",
    toName: "Maya",
    fromName: "Julian",
    occasion: "5th Anniversary",
    createdAt: "2026-08-01",
    theme: "ethereal",
    musicTrack: "piano",
    isLocked: false,
    coverImageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80",
    viewsCount: 42,
    isPaid: true,
    paidAt: "2026-08-01T12:00:00Z",
    giftTier: "deluxe",
    transactionId: "EVERGIFT-TXN-882194",
    accessKey: "sample-key-1",
    reactions: [
      { id: "r1", emoji: "😭", userName: "Maya", timestamp: "2026-08-02 14:20", message: "Julian... I cried happy tears reading this! Thank you for 5 amazing years ❤️" },
      { id: "r2", emoji: "❤️", userName: "Maya", timestamp: "2026-08-02 14:22" }
    ],
    items: [
      {
        id: "item-101",
        type: "note",
        title: "Where It All Began",
        content: "Five years ago today, we sat at that tiny coffee shop in Greenwich Village arguing about whether pineapple belongs on pizza. I knew right then that my life was about to change forever.",
        year: 2021,
        date: "2021-08-08",
        authorName: "Julian",
        colorAccent: "#e0d7ff"
      },
      {
        id: "item-102",
        type: "photo",
        title: "First Trip to Santorini 🌅",
        content: "Watching the sunset over Oia. You were wearing that yellow linen dress, and the breeze was warm.",
        mediaUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80",
        caption: "Golden hour in Santorini",
        year: 2022,
        date: "2022-06-15",
        authorName: "Julian"
      },
      {
        id: "item-103",
        type: "voice",
        title: "Voice Note: Midnight Laughs 🎙️",
        content: "A short voice recording from our rainy camping trip in Maine when our tent leaked and we couldn't stop giggling.",
        mediaUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
        caption: "Listen to the rain in Acadia",
        year: 2023,
        date: "2023-09-20",
        authorName: "Julian"
      },
      {
        id: "item-104",
        type: "location",
        title: "The Stargazing Meadow 🌌",
        content: "The exact spot where we saw our first meteor shower together under the clear mountain skies.",
        locationName: "Blue Ridge Parkway, Milepost 382",
        lat: 35.5951,
        lng: -82.5515,
        year: 2024,
        date: "2024-08-12",
        authorName: "Julian"
      },
      {
        id: "item-105",
        type: "song",
        title: "Our Song: Beyond by Leon Bridges 🎶",
        content: "Every time this song comes on, time slows down and I remember dancing in our first apartment kitchen.",
        artist: "Leon Bridges",
        mediaUrl: "https://open.spotify.com/track/1a2b3c",
        year: 2025,
        date: "2025-02-14",
        authorName: "Julian"
      },
      {
        id: "item-106",
        type: "coupon",
        title: "Golden Pass: 1-Year Dinner Date Ticket 🍷",
        content: "Redeemable anytime for a homemade candlelit dinner, your favorite pasta, and zero dishes for you!",
        couponCode: "LOVE-MAYA-2026",
        year: 2026,
        date: "2026-08-08",
        authorName: "Julian"
      }
    ]
  },
  {
    id: "box-2",
    slug: "mayas-25th-birthday",
    title: "Maya's 25th Birthday Celebration 🎂",
    toName: "Maya",
    fromName: "The Besties Group",
    occasion: "25th Birthday",
    createdAt: "2026-08-05",
    theme: "cherry-blossom",
    musicTrack: "acoustic",
    isLocked: false,
    isCollaborative: true,
    coverImageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80",
    viewsCount: 18,
    isPaid: true,
    paidAt: "2026-08-05T10:00:00Z",
    giftTier: "standard",
    transactionId: "EVERGIFT-TXN-902183",
    accessKey: "sample-key-2",
    reactions: [
      { id: "r3", emoji: "🥹", userName: "Maya", timestamp: "2026-08-06 09:12", message: "You guys are the absolute best friends ever!!" }
    ],
    items: [
      {
        id: "item-201",
        type: "photo",
        title: "Roadtrip to Big Sur 🚗",
        content: "Remember when we got a flat tire and ended up eating ice cream in the sun for three hours?",
        mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        caption: "Best accidental afternoon ever!",
        year: 2023,
        authorName: "Chloe"
      },
      {
        id: "item-202",
        type: "note",
        title: "Quarter Century Wisdom 🌸",
        content: "Happy 25th birthday Maya! You shine brighter than anyone I know. May this year bring you all the magic, adventures, and tea dates you deserve!",
        year: 2026,
        authorName: "Liam"
      },
      {
        id: "item-203",
        type: "giftCard",
        title: "Spa Day e-Gift Card 💆‍♀️",
        content: "A $150 gift card for your favorite holistic spa day in downtown!",
        couponCode: "SPA-MAYA-25TH",
        amount: "$150",
        year: 2026,
        authorName: "Chloe & Liam"
      }
    ]
  },
  {
    id: "box-3",
    slug: "time-capsule-2030",
    title: "Letter to Future Us: 2030 Time Capsule ⏳",
    toName: "Future Maya & Julian",
    fromName: "Present Day Us (2026)",
    occasion: "Time Capsule",
    createdAt: "2026-08-08",
    theme: "celestial",
    musicTrack: "celestial-bells",
    isLocked: true,
    locked: true,
    accessCode: "milo",
    unlockDate: "2030-01-01T00:00:00.000Z",
    passwordPrompt: "What was the name of our first pet together?",
    secretPin: "milo",
    coverImageUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
    viewsCount: 5,
    reactions: [],
    items: [
      {
        id: "item-301",
        type: "note",
        title: "Thoughts From 2026",
        content: "If you are opening this in 2030: I hope we are living near the ocean, reading good books, and laughing as much as we do right now. Here are our promises for the future.",
        year: 2026,
        authorName: "Julian"
      },
      {
        id: "item-302",
        type: "photo",
        title: "Our Living Room in 2026 🏡",
        content: "A snapshot of our cozy couch, plants, and coffee mugs before we remodel.",
        mediaUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80",
        year: 2026,
        authorName: "Maya"
      }
    ]
  }
];
