import { test, expect } from '@playwright/test';
import { rooms, getSelection } from '../src/catalog';

test.beforeEach(async ({ page }) => {
  // Deterministic UI tests deliberately stub only the external Spotify frame.
  // Real embeds are separately inspected in the local browser.
  await page.route('https://open.spotify.com/embed/**', route => route.fulfill({ contentType: 'text/html', body: '<html><body style="background:#193c2d;color:white"><button>Play</button><p>Spotify test frame</p></body></html>' }));
});

test('all fourteen chores open the matching player and preserve it when collapsed', async ({ page }, info) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Playlists for a cleaner living room.');
  await expect(page.locator('iframe')).toHaveCount(0);
  for (const room of rooms) {
    await page.getByRole('navigation').getByRole('button', { name: room.name, exact: true }).click();
    await expect(page.locator('.scene.is-active.is-ready')).toHaveCount(1);
    for (const chore of room.chores) {
      if (info.project.name === 'desktop') await page.getByRole('button', { name: `Find music for ${chore.label}`, exact: true }).click();
      else await page.locator('#chore-list').getByRole('button', { name: chore.label, exact: true }).click();
      await expect(page.locator('.music-hub')).toHaveClass(/expanded/);
      await expect(page).toHaveURL(new RegExp(`room=${room.id}&chore=${chore.id}`));
      await expect(page.locator('h1')).toHaveText(room.headline);
      await expect(page.locator('.intro-description')).toHaveText(room.description);
      await expect(page.locator('iframe')).toHaveCount(1);
      await expect(page.locator('iframe')).toHaveAttribute('src', `https://open.spotify.com/embed/playlist/${getSelection({ room: room.id, chore: chore.id }).playlist.id}?utm_source=generator&theme=0`);
      const frame = await page.locator('iframe').elementHandle();
      await frame!.evaluate(node => node.setAttribute('data-persistence-test', 'same-frame'));
      await page.getByRole('button', { name: 'Back to room', exact: true }).click();
      await expect(page.locator('iframe')).toHaveAttribute('data-persistence-test', 'same-frame');
    }
  }
  await page.getByRole('navigation').getByRole('button', { name: 'Kitchen', exact: true }).click();
  await expect(page.locator('iframe')).toHaveAttribute('src', /playlist\/4NDSxTXcIIJd3OtAuwA3eV\?/);
  await expect(page.locator('iframe')).not.toHaveAttribute('data-persistence-test', 'same-frame');
});

test('bedroom playlists stay in sync when switching to every other room and using history', async ({ page }) => {
  await page.goto('/?room=bedroom&chore=make-the-bed');
  const bedroomPlaylists = [
    ['Make the bed', '2ttG5tUQKn6gV0btjiavHZ'],
    ['Fold laundry', '0uS3ARqxQrfYskZjcDheqH'],
    ['Wardrobe reset', '4CWcx5OzgalGXhveEdnOKz'],
  ];
  for (const [label, id] of bedroomPlaylists) {
    await page.locator('.player-chores').getByRole('button', { name: label, exact: true }).click();
    await expect(page.locator('iframe')).toHaveAttribute('src', `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`);
    await expect(page.locator('.music-actions a')).toHaveAttribute('href', `https://open.spotify.com/playlist/${id}`);
  }
  for (const room of rooms.filter(room => room.id !== 'bedroom')) {
    await page.getByRole('navigation').getByRole('button', { name: room.name, exact: true }).click();
    const { chore, playlist } = getSelection({ room: room.id, chore: room.defaultChore });
    await expect(page.locator('.soundtrack-context')).toHaveText(`Your soundtrack · ${room.name} / ${chore.label}`);
    await expect(page.locator('iframe')).toHaveAttribute('src', `https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator&theme=0`);
    await page.getByRole('navigation').getByRole('button', { name: 'Bedroom', exact: true }).click();
    await expect(page.locator('iframe')).toHaveAttribute('src', /playlist\/0uS3ARqxQrfYskZjcDheqH\?/);
    await page.goBack();
    await expect(page.locator('.music-actions a')).toHaveAttribute('href', `https://open.spotify.com/playlist/${playlist.id}`);
    await expect(page.locator('iframe')).toHaveAttribute('src', `https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator&theme=0`);
    await page.goForward();
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await expect(page.locator('iframe')).toHaveAttribute('src', /playlist\/0uS3ARqxQrfYskZjcDheqH\?/);
    await expect(page.locator('.soundtrack-context')).toHaveText('Your soundtrack · Bedroom / Fold laundry');
  }
});

test('deep links, invalid links, Back and Forward', async ({ page }) => {
  await page.goto('/?room=kitchen&chore=cooking');
  await expect(page.locator('h1')).toContainText('Playlists for your kitchen era.');
  await expect(page.locator('.music-hub')).toHaveClass(/expanded/);
  await expect(page.locator('iframe')).not.toHaveAttribute('src', /autoplay/);
  await page.getByRole('button', { name: 'Back to room', exact: true }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Bedroom', exact: true }).click();
  await page.goBack();
  await expect(page.locator('h1')).toContainText('Playlists for your kitchen era.');
  await page.goForward();
  await expect(page.locator('h1')).toContainText('Playlists for the room that gets you.');
  await page.goto('/?room=kitchen&chore=not-real');
  await expect(page.locator('h1')).toContainText('Playlists for a cleaner living room.');
});

test('demo contribution validates and persists without publishing', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add your playlist', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Save demo submission' }).click();
  await expect(page.getByRole('alert')).toContainText('Spotify playlist link');
  await page.getByLabel('Spotify playlist link').fill('https://open.spotify.com/playlist/37i9dQZF1DWX76Z8XDsZzF?si=demo');
  await page.getByRole('dialog').getByLabel('Room', { exact: true }).selectOption('kitchen');
  await expect(page.getByRole('dialog').getByLabel('Chore', { exact: true })).toHaveValue('bartan');
  await page.getByLabel('Your name').fill('A neighbour');
  await page.getByRole('button', { name: 'Save demo submission' }).click();
  await expect(page.getByRole('status')).toContainText('It hasn’t been sent for review.');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ghar-ki-dhun:demo-submissions:v1')!));
  expect(saved).toHaveLength(1);
  expect(saved[0]).toMatchObject({ status: 'demo-pending', room: 'kitchen', chore: 'bartan' });
  expect(saved[0].url).not.toContain('?');
  await page.getByRole('button', { name: 'Back to your rhythm' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Add your playlist', exact: true })).toBeFocused();
});

test('share falls back to selectable URL when APIs are unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Denied')) } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Share this moment', exact: true }).click();
  await expect(page.getByLabel('Copy this link to share your moment')).toHaveValue(/room=living-room&chore=pocha/);
  await expect(page.getByLabel('Copy this link to share your moment')).toBeFocused();
});

test('clipboard and native-share cancellation are handled', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.resolve() } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Share this moment', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('copied');
  await page.evaluate(() => Object.defineProperty(navigator, 'share', { value: () => Promise.reject(new DOMException('Cancelled', 'AbortError')) }));
  await page.getByRole('button', { name: 'Share this moment', exact: true }).click();
  await expect(page.locator('.share-fallback')).toHaveCount(0);
});

test('system reduced motion and hidden pages pause effects without a motion control', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.motion-button')).toHaveCount(0);
  await expect(page.getByText('Room is alive', { exact: true })).toHaveCount(0);
  await expect(page.locator('main')).not.toHaveClass(/motion-paused/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('main')).toHaveClass(/motion-paused/);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('main')).not.toHaveClass(/motion-paused/);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('main')).toHaveClass(/motion-paused/);
});

test('Escape restores focus and page never overflows horizontally', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Play', exact: true });
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.listen-button')).toBeFocused();
  await expect(page.locator('.music-hub')).not.toHaveClass(/expanded/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
