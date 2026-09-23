import { describe, expect, it } from 'vitest';
import { rooms, defaultSelection, parseSelection, selectionUrl, normalizePlaylistUrl, validateSubmission, getSelection } from './catalog';

describe('room catalog and navigation', () => {
  it('contains fourteen unique valid chores and a valid default in every room', () => {
    const chores = rooms.flatMap(r => r.chores);
    expect(chores).toHaveLength(14);
    expect(new Set(chores.map(c => c.id)).size).toBe(14);
    for (const room of rooms) {
      expect(room.chores.some(c => c.id === room.defaultChore)).toBe(true);
      for (const chore of room.chores) {
        expect(getSelection({ room: room.id, chore: chore.id }).playlist.id).toMatch(/^[a-zA-Z0-9]{22}$/);
        expect(chore.anchor.x).toBeGreaterThan(0);
        expect(chore.anchor.x).toBeLessThan(100);
      }
    }
  });
  it.each(['', '?room=nope&chore=pocha', '?room=kitchen&chore=pocha', '?room=bedroom', '?chore=bartan'])('falls back safely for %s', search => {
    expect(parseSelection(search)).toEqual({ selection: defaultSelection, expanded: false });
  });
  it('round-trips every room and chore through a share link', () => {
    for (const room of rooms) for (const chore of room.chores) {
      const selection = { room: room.id, chore: chore.id };
      const url = new URL(selectionUrl(selection, 'https://example.com/?old=value#old'));
      expect(url.hash).toBe('');
      expect(url.searchParams.has('old')).toBe(false);
      expect(parseSelection(url.search)).toEqual({ selection, expanded: true });
    }
  });
});
describe('contributions', () => {
  const valid = 'https://open.spotify.com/playlist/37i9dQZF1DWX76Z8XDsZzF';
  it('normalizes playlist links and removes tracking', () => {
    expect(normalizePlaylistUrl(` ${valid}?si=abc `)).toBe(valid);
    expect(normalizePlaylistUrl(valid.replace('/playlist/', '/intl-en/playlist/'))).toBe(valid);
  });
  it.each(['javascript:alert(1)', 'https://open.spotify.com.evil.test/playlist/37i9dQZF1DWX76Z8XDsZzF', 'https://evil.test', 'https://open.spotify.com/track/37i9dQZF1DWX76Z8XDsZzF', 'http://open.spotify.com/playlist/37i9dQZF1DWX76Z8XDsZzF', 'https://open.spotify.com/playlist/nope', 'https://user@open.spotify.com/playlist/37i9dQZF1DWX76Z8XDsZzF'])('rejects %s', value => {
    expect(normalizePlaylistUrl(value)).toBeNull();
  });
  it('requires matching room/chore and limits optional text', () => {
    const submission = { url: valid, room: 'kitchen', chore: 'bartan', name: '', description: '' };
    expect(validateSubmission(submission)).toBeNull();
    expect(validateSubmission({ ...submission, chore: 'jhadu' })).toContain('Choose a chore');
    expect(validateSubmission({ ...submission, name: 'a'.repeat(61) })).toContain('60');
    expect(validateSubmission({ ...submission, description: 'a'.repeat(241) })).toContain('240');
  });
});
