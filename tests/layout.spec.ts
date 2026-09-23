import { test, expect } from '@playwright/test';
import { rooms } from '../src/catalog';

test('five flat rooms fit the viewport with accessible navigation', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  for (const room of rooms) {
    await page.getByRole('navigation').getByRole('button', { name: room.name, exact: true }).click();
    await expect(page.locator('.scene.is-active.is-ready')).toHaveCount(1);
    await expect(page.locator('.scene.is-active .room-image')).toHaveAttribute('src', `/art/${room.image}.webp`);
    await expect(page.locator('.object-layer')).toHaveCount(0);
    await expect(page.locator('.scene-camera.is-zoomed')).toHaveCount(0);
    const nav = await page.getByRole('navigation').boundingBox();
    expect(nav!.x).toBeGreaterThanOrEqual(0);
    expect(nav!.x + nav!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    await page.screenshot({ path: info.outputPath(`${room.id}.png`), fullPage: true, animations: 'disabled', scale: 'css' });
  }
});

test('image failures still leave usable chores and music fallback', async ({ page }) => {
  await page.route('**/art/living-room.webp', route => route.abort());
  await page.route('https://open.spotify.com/embed/**', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('room image couldn’t load');
  await page.locator('#chore-list').getByRole('button', { name: 'Pocha', exact: true }).click();
  await expect(page.locator('.music-hub')).toHaveClass(/expanded/);
  await expect(page.locator('.embed-help').getByRole('link', { name: 'Open in Spotify' })).toHaveAttribute('href', /open.spotify.com\/playlist\//);
  await expect(page.getByRole('button', { name: 'Back to room', exact: true })).toBeVisible();
});

test('storage failure never claims a contribution was saved', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Denied', 'SecurityError'); }; });
  await page.goto('/');
  await page.getByRole('button', { name: 'Add your playlist', exact: true }).click();
  await page.getByLabel('Spotify playlist link').fill('https://open.spotify.com/playlist/37i9dQZF1DWX76Z8XDsZzF');
  await page.getByRole('button', { name: 'Save demo submission' }).click();
  await expect(page.getByRole('alert')).toContainText('couldn’t save');
  await expect(page.getByText('Thanks for the good tunes.')).toHaveCount(0);
});
