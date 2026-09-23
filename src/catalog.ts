export type RoomId = 'living-room' | 'kitchen' | 'washroom' | 'bedroom' | 'utility';
export type Point = { x: number; y: number };
export type Chore = {
  id: string; label: string; headline: [string, string]; description: string;
  title: string; tagline: string; playlist: keyof typeof playlists; anchor: Point; mobileAnchor: Point;
};
export type Effect = { kind: 'steam' | 'water' | 'shower'; x: number; y: number; width: number; height: number };
export type Room = {
  id: RoomId; name: string; number: string; image: string; defaultChore: string;
  mobileImage: string; cover: number; chores: Chore[];
  effects: Effect[]; mobileEffects: Effect[];
};
// Public demo sources checked September 23, 2026. Editorial titles below are
// Ghar Ki Dhun mood names, not claims about ownership of the linked playlists.
export const playlists = {
  butter: { id: '6jI4hQZplOWWktdYQWSSji', title: 'Bollywood Butter', curator: 'VIKRAM' },
  chill: { id: '37i9dQZF1DWX76Z8XDsZzF', title: 'Bollywood & Chill', curator: 'Spotify' },
  classics: { id: '33tkfeMhQvwIawpWh3RF9u', title: 'Bollywood Classics', curator: 'Champagne Punjabi' },
  gold: { id: '6eLvNcTQCicodOSU7tWPuM', title: 'Bollywood Gold', curator: 'Mayank Patel' },
} as const;
export const rooms: Room[] = [
  { id: 'living-room', name: 'Living Room', number: '01', image: 'living-room', defaultChore: 'pocha', mobileImage: 'living-room-mobile', cover: 0, mobileEffects: [], effects: [], chores: [
    { id: 'jhadu', label: 'Jhadu', headline: ['Sweep a little.', 'Sway a little.'], description: 'A familiar tune for every corner of home.', title: 'Jhadu Jukebox', tagline: 'A clean sweep. A classic beat.', playlist: 'classics', anchor: { x: 17.5, y: 54 }, mobileAnchor: { x: 10, y: 55 } },
    { id: 'pocha', label: 'Pocha', headline: ['Clean floors.', 'Fresh mood.'], description: 'A little rhythm for your Sunday reset.', title: 'Pocha Afterparty', tagline: 'Clean floors. Dirty basslines.', playlist: 'butter', anchor: { x: 81, y: 63.5 }, mobileAnchor: { x: 78, y: 63 } },
    { id: 'dusting', label: 'Dusting', headline: ['Dust it off.', 'Turn it up.'], description: 'Old favourites. A fresh little beginning.', title: 'Dust & Disco', tagline: 'Less dust. More dancing.', playlist: 'gold', anchor: { x: 90.2, y: 43.5 }, mobileAnchor: { x: 92, y: 42 } },
  ] },
  { id: 'kitchen', name: 'Kitchen', number: '02', image: 'kitchen', defaultChore: 'bartan', mobileImage: 'kitchen-mobile', cover: 1, mobileEffects: [{ kind: 'steam', x: 70, y: 40, width: 11, height: 6 }], effects: [
    { kind: 'steam', x: 79, y: 35, width: 8, height: 11 },
    { kind: 'water', x: 60.5, y: 49, width: 0.6, height: 3.5 },
  ], chores: [
    { id: 'bartan', label: 'Bartan', headline: ['Sink full.', 'Volume up.'], description: 'A little Bollywood for the after-dinner dishes.', title: 'Bartan & Bollywood', tagline: 'Big choruses. One sinkful.', playlist: 'butter', anchor: { x: 55.5, y: 48 }, mobileAnchor: { x: 30, y: 47 } },
    { id: 'cooking', label: 'Cooking', headline: ['A pinch of spice.', 'A whole lot of soul.'], description: 'Let the good tunes simmer.', title: 'Kitchen Mehfil', tagline: 'Made with love. And a little music.', playlist: 'gold', anchor: { x: 84, y: 46 }, mobileAnchor: { x: 75, y: 47 } },
    { id: 'counter-clean', label: 'Counter clean', headline: ['Clear the counter.', 'Keep the chorus.'], description: 'One last wipe. One more favourite.', title: 'Counter Culture', tagline: 'A quick clean, a good groove.', playlist: 'classics', anchor: { x: 77, y: 59 }, mobileAnchor: { x: 88, y: 57 } },
  ] },
  { id: 'washroom', name: 'Washroom', number: '03', image: 'washroom', defaultChore: 'basin-clean', mobileImage: 'washroom-mobile', cover: 2, mobileEffects: [{ kind: 'water', x: 26.3, y: 43.4, width: .7, height: 3.5 }, { kind: 'shower', x: 68, y: 23, width: 6, height: 35 }], effects: [
    { kind: 'water', x: 33.6, y: 43, width: 0.65, height: 6 },
    { kind: 'shower', x: 65, y: 15, width: 5.5, height: 49 },
  ], chores: [
    { id: 'basin-clean', label: 'Basin clean', headline: ['Scrub a little.', 'Sing a lot.'], description: 'Big sing-alongs for the little clean-ups.', title: 'Scrub & Sing', tagline: 'For your bathroom encore.', playlist: 'classics', anchor: { x: 42, y: 51 }, mobileAnchor: { x: 30, y: 48 } },
    { id: 'shower-scrub', label: 'Shower scrub', headline: ['Shower sparkle.', 'Main-character energy.'], description: 'Your bathroom is the concert hall.', title: 'Shower Superstar', tagline: 'Every scrub deserves a solo.', playlist: 'butter', anchor: { x: 72, y: 42 }, mobileAnchor: { x: 76, y: 41 } },
    { id: 'floor-clean', label: 'Floor clean', headline: ['A little shine.', 'A happy refrain.'], description: 'Good tunes for the finishing touches.', title: 'Shiny Happy Floors', tagline: 'Make room for a brighter mood.', playlist: 'gold', anchor: { x: 78, y: 75 }, mobileAnchor: { x: 81, y: 63 } },
  ] },
  { id: 'bedroom', name: 'Bedroom', number: '04', image: 'bedroom', defaultChore: 'fold-laundry', mobileImage: 'bedroom-mobile', cover: 3, mobileEffects: [], effects: [], chores: [
    { id: 'make-the-bed', label: 'Make the bed', headline: ['Fresh sheets.', 'Fresh beginnings.'], description: 'Ease into the day, one song at a time.', title: 'Bedside B-Sides', tagline: 'Fluff the pillows. Feel the music.', playlist: 'chill', anchor: { x: 39, y: 51 }, mobileAnchor: { x: 40, y: 49 } },
    { id: 'fold-laundry', label: 'Fold laundry', headline: ['Fold it slow.', 'Play it loud.'], description: 'A playlist for making the clean-clothes pile disappear.', title: 'Fresh Fold Favourites', tagline: 'Soft clothes. Loud choruses.', playlist: 'chill', anchor: { x: 85, y: 60 }, mobileAnchor: { x: 84, y: 64 } },
    { id: 'wardrobe-reset', label: 'Wardrobe reset', headline: ['Find some space.', 'Find your groove.'], description: 'A little sorting for a lighter tomorrow.', title: 'Closet Classics', tagline: 'Old clothes. Timeless tunes.', playlist: 'gold', anchor: { x: 84, y: 41.5 }, mobileAnchor: { x: 88, y: 40 } },
  ] },
  { id: 'utility', name: 'Utility Room', number: '05', image: 'utility', defaultChore: 'laundry', mobileImage: 'utility-mobile', cover: 4, mobileEffects: [], effects: [], chores: [
    { id: 'laundry', label: 'Laundry', headline: ['Spin the clothes.', 'Skip the silence.'], description: 'A fresh load. A familiar chorus. A little time for you.', title: 'Spin & Sing', tagline: 'Good tunes, on a gentle cycle.', playlist: 'butter', anchor: { x: 58.5, y: 59 }, mobileAnchor: { x: 48, y: 53 } },
    { id: 'iron-clothes', label: 'Iron clothes', headline: ['Smooth the creases.', 'Keep the groove.'], description: 'For the slow Sunday ritual of freshly pressed clothes.', title: 'Pressed & Play', tagline: 'A little steam. A lot of soul.', playlist: 'gold', anchor: { x: 90, y: 52 }, mobileAnchor: { x: 89, y: 49 } },
  ] },
];
export type Selection = { room: RoomId; chore: string };
export const defaultSelection: Selection = { room: 'living-room', chore: 'pocha' };
export function getSelection(selection: Selection) {
  const room = rooms.find(r => r.id === selection.room)!;
  const chore = room.chores.find(c => c.id === selection.chore)!;
  return { room, chore, playlist: playlists[chore.playlist] };
}
export function parseSelection(search: string): { selection: Selection; expanded: boolean } {
  const params = new URLSearchParams(search);
  const room = rooms.find(r => r.id === params.get('room'));
  const chore = room?.chores.find(c => c.id === params.get('chore'));
  return room && chore ? { selection: { room: room.id, chore: chore.id }, expanded: true } : { selection: defaultSelection, expanded: false };
}
export function selectionUrl(selection: Selection, origin: string) {
  const url = new URL(origin);
  url.search = new URLSearchParams(selection).toString();
  url.hash = '';
  return url.toString();
}
export function playlistUrl(id: string) { return `https://open.spotify.com/playlist/${id}`; }
export function normalizePlaylistUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.hostname !== 'open.spotify.com' || url.username || url.password || url.port) return null;
    const match = url.pathname.match(/^\/(?:intl-[a-z]{2}\/)?playlist\/([a-zA-Z0-9]{22})\/?$/);
    return match ? playlistUrl(match[1]) : null;
  } catch { return null; }
}
export type Submission = { url: string; room: string; chore: string; name: string; description: string };
export function validateSubmission(value: Submission): string | null {
  if (!normalizePlaylistUrl(value.url)) return 'Paste a full Spotify playlist link, like https://open.spotify.com/playlist/…';
  if (!rooms.find(r => r.id === value.room)?.chores.some(c => c.id === value.chore)) return 'Choose a chore from the selected room.';
  if (value.name.trim().length > 60) return 'Keep your name under 60 characters.';
  if (value.description.trim().length > 240) return 'Keep your description under 240 characters.';
  return null;
}
