import { test, expect } from '@playwright/test';
import { rooms } from '../src/catalog';

for (const width of [320, 390, 768, 900]) {
  test(`portrait layout has separate sections and uncropped objects at ${width}px`, async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', 'One responsive check per viewport');
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('https://open.spotify.com/embed/**', route => route.fulfill({ contentType: 'text/html', body: '<button>Play</button>' }));
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    for (const room of rooms) {
      await page.getByRole('navigation').getByRole('button', { name: room.name, exact: true }).click();
      await expect(page.locator('.scene.is-active.is-ready')).toHaveCount(1);
      await expect.poll(() => page.locator('.scene.is-active img').evaluate((img: HTMLImageElement) => img.currentSrc)).toContain(`${room.mobileImage}.webp`);
      const sections = ['.site-header', '.room-intro', '.room-scenes', '#chore-list', '.music-hub', '.community-actions', '.site-footer'];
      let bottom = 0;
      for (const selector of sections) {
        const box = (await page.locator(selector).boundingBox())!;
        const scrollY = await page.evaluate(() => window.scrollY);
        expect(box.y + scrollY, `${room.id}: ${selector} overlaps previous section`).toBeGreaterThanOrEqual(bottom - 1);
        bottom = box.y + scrollY + box.height;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
      }
      const scene = (await page.locator('.room-scenes').boundingBox())!;
      const photo = (await page.locator('.scene.is-active img').boundingBox())!;
      expect(photo.width / photo.height).toBeCloseTo(2 / 3, 2);
      expect(photo.width).toBeCloseTo(scene.width, 0);
      for (const chore of room.chores) {
        const marker = page.getByRole('button', { name: `Find music for ${chore.label}`, exact: true });
        await expect(marker).toBeVisible();
        const box = (await marker.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(scene.x);
        expect(box.x + box.width).toBeLessThanOrEqual(scene.x + scene.width);
        await marker.click();
        await expect(page.locator('.music-hub')).toHaveClass(/expanded/);
        const player = (await page.locator('.music-hub').boundingBox())!;
        expect(player.y).toBeGreaterThanOrEqual(0);
        expect(player.y + player.height).toBeLessThanOrEqual(845);
        expect(await page.locator('iframe').evaluate(el => el.getBoundingClientRect().height)).toBe(152);
        await page.getByRole('button', { name: 'Back to room', exact: true }).click();
        await expect(marker).toBeFocused();
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.screenshot({ path: info.outputPath(`portrait-${width}.png`), fullPage: true, scale: 'css' });
  });
}

test('mobile resize preserves the player and identifies music from another room', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'Mobile-specific scenario');
  await page.route('https://open.spotify.com/embed/**', route => route.fulfill({ contentType: 'text/html', body: '<button>Play</button>' }));
  await page.goto('/?room=bedroom&chore=wardrobe-reset');
  await page.locator('iframe').evaluate(el => el.setAttribute('data-same-player', 'yes'));
  const source = await page.locator('iframe').getAttribute('src');
  await page.getByRole('button', { name: 'Back to room', exact: true }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Kitchen', exact: true }).click();
  await expect(page.locator('.soundtrack-context')).toHaveText('Your soundtrack · Bedroom / Wardrobe reset');
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(page.locator('iframe')).toHaveAttribute('src', source!);
  await expect(page.locator('iframe')).toHaveAttribute('data-same-player', 'yes');
  await page.screenshot({ path: info.outputPath('expanded-mobile.png'), fullPage: true, scale: 'css' });
});
