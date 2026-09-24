# CHOREPLAY

A sunlit Indian home, fourteen household chores, and a little music for the everyday. An interactive React + TypeScript prototype built with Vite.

## Run locally

Use Node.js 22.12+ (or a supported newer version).

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, normally http://127.0.0.1:5173.

```sh
npm run build       # TypeScript check and production build
npm run preview     # Preview the built site
npm test            # Catalog, URL, and validation tests
npm run test:e2e     # Desktop and mobile browser journeys
```

Browser tests use installed Google Chrome. If Chrome is unavailable, install Playwright Chromium with `npx playwright install chromium` and remove `channel: 'chrome'` from `playwright.config.ts`. CI browser tests stub Spotify content; they verify our interface and iframe lifecycle, not Spotify's streaming service.

## Experience

CHOREPLAY — because every chore deserves a playlist. Room introductions stay fixed as chores change; each chore retains its own soundtrack. The card’s **Play** action opens the official player, where Spotify’s Play control starts playback. Existing share URLs and local contribution storage remain compatible.

- Five rooms and fourteen chores, including Laundry and Iron clothes in the Utility Room. Living Room / Pocha opens first, without autoplay.
- Flat photographic rooms with localized steam, water, and sunlight particles. There are no floating object layers, camera zooms, or 3D effects. Motion follows the operating system’s reduced-motion setting and pauses when the page is hidden; there is no user-facing motion control.
- Floating music card expands into the official Spotify playlist embed. One iframe stays mounted through room navigation, expanding, and collapsing. Selecting a different playlist changes its source; it never requests autoplay. Selecting a chore that shares the current demo playlist keeps that source intact.
- Room and chore share links, native sharing, clipboard fallback, and selectable links when clipboard access is blocked.
- Dedicated portrait artwork for all five rooms on phones and tablets (below 1200px wide or 800px tall). Headings, full uncropped scenes, numbered chore buttons, and the music card occupy separate sections. The player expands in place with compact Spotify controls; keyboard focus and scroll position return to the trigger when closed.

## Demo boundaries

**Contributions are local only.** The form stores entries in this browser under `ghar-ki-dhun:demo-submissions:v1` with status `demo-pending`. Nothing is sent to a server or published. A production version needs a backend, abuse controls, and a protected moderation interface.

Music is provided by external public demo playlists. Editorial names such as “Pocha Afterparty” describe the chore mood; the expanded panel identifies the actual playlist and curator. Four demo playlists are reused across the fourteen chore mappings. Playback availability, previews, login requirements, and regional restrictions are controlled by Spotify. “Open in Spotify” remains available even when an embed is blocked.

No Spotify API key, account integration, or Web Playback SDK is required. Playback is initiated with Spotify's own Play control. Embeds request resources from Spotify after the player is opened. Google Fonts supplies DM Sans and DM Serif Display; local serif/sans-serif fallbacks work if fonts are unavailable.

## Editing the collection

`src/catalog.ts` contains the rooms, chores, public playlist IDs, editorial copy, desktop and portrait scene anchors, artwork paths, and localized motion anchors. Update a playlist ID there to replace a demo selection. Hotspot coordinates are percentages of their matching landscape (1536 × 1024) or portrait (1024 × 1536 source, optimized to 800 × 1200) photograph. Portrait scenes are never cropped.

Share format: `?room=kitchen&chore=bartan`. Invalid or mismatched combinations fall back to Living Room / Pocha. Shared links open the selected player without autoplay. Room-only navigation preserves previously loaded music.

`src/styles.css` holds the responsive layout and animation keyframes. `src/App.tsx` owns scene selection and the persistent music hub. Generated source images are in `artwork/source/`; only compressed runtime assets are shipped from `public/art/`. The four original reference PNGs in the project root are unchanged.

## Artwork and sources

The supplied room references were edited with imagegen to remove their baked-in interface. The final website uses the clean, intact photographs to preserve correct furniture and curtain occlusion. Earlier layer experiments are archived in artwork/source and are not shipped. A matching utility room was generated for laundry and ironing. Each room also has a separately composed portrait photograph; see `artwork/mobile-prompts.md`. Generated illustrated cover art is decorative and is not the actual artwork of the linked Spotify playlists.

Public playlist sources checked September 23, 2026:

- [Bollywood Butter — VIKRAM](https://open.spotify.com/playlist/6jI4hQZplOWWktdYQWSSji)
- [Bollywood & Chill — Spotify](https://open.spotify.com/playlist/37i9dQZF1DWX76Z8XDsZzF)
- [Bollywood Classics — Champagne Punjabi](https://open.spotify.com/playlist/33tkfeMhQvwIawpWh3RF9u)
- [Bollywood Gold — Mayank Patel](https://open.spotify.com/playlist/6eLvNcTQCicodOSU7tWPuM)
- [Spotify embed documentation](https://developer.spotify.com/documentation/embeds)

The generated `dist/` folder can be served by any static hosting service. Vercel deployment settings are provided in vercel.json. The source repository is https://github.com/KnowOrganization/gharkidhun.
