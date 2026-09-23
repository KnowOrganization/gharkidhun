import { test, expect } from '@playwright/test';
import { rooms } from '../src/catalog';

test.beforeEach(async ({ page }) => {
  // Deterministic UI tests deliberately stub only the external Spotify frame.
  // Real embeds are separately inspected in the local browser.
  await page.route('https://open.spotify.com/embed/**', route => route.fulfill({ contentType: 'text/html', body: '<html><body style="background:#193c2d;color:white"><button>Play</button><p>Spotify test frame</p></body></html>' }));
});

test('all fourteen chores open the matching player and preserve the iframe through navigation', async ({ page }, info) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Clean floors.');
  await expect(page.locator('iframe')).toHaveCount(0);
  for (const room of rooms) {
    await page.getByRole('navigation').getByRole('button', { name: room.name, exact: true }).click();
    await expect(page.locator('.scene.is-active.is-ready')).toHaveCount(1);
    for (const chore of room.chores) {
      if (info.project.name === 'desktop') await page.getByRole('button', { name: `Find music for ${chore.label}`, exact: true }).click();
      else await page.locator('#chore-list').getByRole('button', { name: chore.label, exact: true }).click();
      await expect(page.locator('.music-hub')).toHaveClass(/expanded/);
      await expect(page).toHaveURL(new RegExp(`room=${room.id}&chore=${chore.id}`));
      await expect(page.locator('iframe')).toHaveCount(1);
      const frame = await page.locator('iframe').elementHandle();
      await frame!.evaluate(node => node.setAttribute('data-persistence-test', 'same-frame'));
      await page.getByRole('button', { name: 'Back to room', exact: true }).click();
      await expect(page.locator('iframe')).toHaveAttribute('data-persistence-test', 'same-frame');
    }
  }
  const src = await page.locator('iframe').getAttribute('src');
  await page.getByRole('navigation').getByRole('button', { name: 'Kitchen', exact: true }).click();
  await expect(page.locator('iframe')).toHaveAttribute('src', src!);
  await expect(page.locator('iframe')).toHaveAttribute('data-persistence-test', 'same-frame');
});

test('deep links, invalid links, Back and Forward', async ({ page }) => {
  await page.goto('/?room=kitchen&chore=cooking');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('A pinch of spice.');
  await expect(page.locator('.music-hub')).toHaveClass(/expanded/);
  await expect(page.locator('iframe')).not.toHaveAttribute('src', /autoplay/);
  await page.getByRole('button', { name: 'Back to room', exact: true }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Bedroom', exact: true }).click();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('A pinch of spice.');
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Fold it slow.');
  await page.goto('/?room=kitchen&chore=not-real');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Clean floors.');
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

test('motion controls and system reduced motion', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Pause room motion' }).click();
  await expect(page.locator('main')).toHaveClass(/motion-paused/);
  await page.reload();
  await expect(page.locator('main')).toHaveClass(/motion-paused/);
  await page.getByRole('button', { name: 'Enable room motion' }).click();
  await expect(page.locator('main')).not.toHaveClass(/motion-paused/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('main')).toHaveClass(/motion-paused/);
  await expect(page.getByRole('button', { name: 'Enable room motion' })).toBeDisabled();
});

test('Escape restores focus and page never overflows horizontally', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Find your rhythm', exact: true });
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.listen-button')).toBeFocused();
  await expect(page.locator('.music-hub')).not.toHaveClass(/expanded/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
