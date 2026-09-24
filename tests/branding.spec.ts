import { test, expect } from '@playwright/test';
import { rooms } from '../src/catalog';

test('CHOREPLAY branding and fixed room introductions', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('CHOREPLAY — Every chore deserves a playlist');
  await expect(page.locator('.wordmark')).toHaveText('CHOREPLAYbecause every chore deserves a playlist');
  await expect(page.locator('.explore-hint')).toHaveText('Pick a chore, we’ll pick the playlist.');
  await expect(page.locator('.room-meta')).toContainText('CHORES, WITH A SOUNDTRACK.');
  await expect(page.locator('.site-footer>p')).toHaveText('Pick a room. Pick a chore. Press play.');
  await expect(page.locator('.footer-note')).toContainText('MADE FOR EVERY CHORE');
  await expect(page.locator('.listen-button')).toHaveText('Play');
  for (const room of rooms) {
    await page.getByRole('navigation').getByRole('button', { name: room.name, exact: true }).click();
    await expect(page.locator('h1')).toHaveText(room.headline);
    await expect(page.locator('.intro-description')).toHaveText(room.description);
  }
});

for (const [width, height] of [[1440, 960], [1200, 800], [1366, 768], [1024, 900]]) {
  test(`clear layout regions at ${width} by ${height}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'One check per viewport');
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('https://open.spotify.com/embed/**', route => route.fulfill({ contentType: 'text/html', body: '<button>Play</button>' }));
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    for (const room of rooms) {
      await page.getByRole('navigation').getByRole('button', { name: room.name, exact: true }).click();
      await expect(page.locator('.scene.is-active.is-ready')).toHaveCount(1);
      const boxes = await page.locator('.site-header,.room-intro,.music-hub,.scene.is-active .hotspot-label').evaluateAll(nodes => nodes.filter(n => getComputedStyle(n).display !== 'none').map(n => ({ name: n.className, rect: n.getBoundingClientRect().toJSON() })));
      for (let a = 0; a < boxes.length; a++) for (let b = a + 1; b < boxes.length; b++) {
        const x = boxes[a].rect, y = boxes[b].rect;
        expect(x.left < y.right && x.right > y.left && x.top < y.bottom && x.bottom > y.top, `${room.id}: ${boxes[a].name} overlaps ${boxes[b].name}`).toBe(false);
      }
      await page.locator('.listen-button').click();
      await expect(page.getByRole('button', { name: 'Back to room', exact: true })).toBeVisible();
      const player = (await page.locator('.music-hub').boundingBox())!;
      expect(player.x).toBeGreaterThanOrEqual(0);
      expect(player.x + player.width).toBeLessThanOrEqual(width);
      await page.getByRole('button', { name: 'Back to room', exact: true }).click();
      await page.screenshot({ path: info.outputPath(`${room.id}-${width}x${height}.png`), fullPage: true, scale: 'css' });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
