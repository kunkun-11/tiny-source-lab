import { test, expect } from '@playwright/test';
import { lessons } from '../../src/lessons.js';

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('starter exposes a failure; learner repair passes and persists', async ({ page }) => {
  const lesson = lessons[0];
  await page.locator('#run-checks').click();
  await expect(page.locator('#notice')).toContainText('Choose a prediction');
  await page.locator('label').filter({has: page.locator(`input[value="${lesson.prediction.answer}"]`)}).click();
  await page.locator('#run-checks').click();
  await expect(page.locator('.check-row.failed').first()).toBeVisible();
  await expect(page.locator('.trace-step')).not.toHaveCount(0);
  await page.locator('#source-code').fill(lesson.solution);
  await page.locator('#run-checks').click();
  await expect(page.locator('.check-row.passed')).toHaveCount(lesson.tests.length);
  await expect(page.locator('.check-row.failed')).toHaveCount(0);
  await expect(page.locator('.check-summary')).toContainText('independently');
  await page.locator('#source-code').fill(lesson.solution + '\n// edited');
  await expect(page.locator('.checks-count')).toHaveText(`0 / ${lesson.tests.length}`);
  await page.locator('#run-checks').click();
  await expect(page.locator('.check-row.passed')).toHaveCount(lesson.tests.length);
  await page.reload();
  await expect(page.locator('#source-code')).toHaveValue(lesson.solution + '\n// edited');
  await expect(page.locator('[data-lesson="emitter"] .lesson-complete')).toHaveAttribute('title','Solved independently');
});

for (const lesson of lessons) {
  test(`${lesson.id}: reference works in actual isolated browser runner`, async ({ page }) => {
    await page.goto(`/#${lesson.id}`);
    await page.locator('label').filter({has: page.locator(`input[value="${lesson.prediction.answer}"]`)}).click();
    page.once('dialog', dialog => dialog.accept());
    await page.locator('#reference').click();
    await page.locator('#run-checks').click();
    await expect(page.locator('.check-row.passed')).toHaveCount(lesson.tests.length);
    await expect(page.locator('.check-summary')).toContainText('reference');
    await expect(page.locator('iframe')).toHaveCount(0);
  });
}

test('Chinese content, links, layout, and keyboard access', async ({ page }) => {
  await page.locator('#language').click();
  await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
  await expect(page.locator('#run-checks')).toContainText('运行检查');
  await expect(page.locator('h1')).not.toHaveText(lessons[0].title.en);
  await expect(page.locator('.github-top')).toHaveAttribute('href','https://github.com/kunkun-11/tiny-source-lab');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
  await page.locator('#source-code').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#run-checks')).toBeFocused();
  await page.locator('[data-lesson="store"]').click();
  await expect(page).toHaveURL(/#store$/);
});

test('syntax errors are visible and code is rendered as text', async ({ page }) => {
  await page.locator('.prediction-option').first().click();
  await page.locator('#source-code').fill('function { // <img src=x onerror=alert(1)>');
  await page.locator('#run-checks').click();
  await expect(page.locator('.run-error')).toContainText('SyntaxError');
  await expect(page.locator('img')).toHaveCount(0);
});

test('lesson switch cancels infinite loop and allows a fresh run', async ({ page }) => {
  await page.locator('.prediction-option').first().click();
  await page.locator('#source-code').fill('function createEmitter() {} while (true) {}');
  await page.locator('#run-checks').click();
  await page.locator('[data-lesson="store"]').click();
  await expect(page.locator('iframe')).toHaveCount(0);
  const lesson = lessons.find(item => item.id === 'store');
  await page.locator('.prediction-option').first().click();
  await page.locator('#source-code').fill(lesson.solution);
  await page.locator('#run-checks').click();
  await expect(page.locator('.check-row.passed')).toHaveCount(lesson.tests.length);
});

test('runner blocks network and application storage access', async ({ page }) => {
  const requests = [];
  page.on('request', request => { if(request.url().includes('/must-not-leave')) requests.push(request.url()); });
  const outcome = await page.evaluate(async () => {
    const { runLesson } = await import('/src/runner.js');
    return runLesson('function probe(){ return typeof localStorage; }', {
      entry:'probe',
      tests:[{
        id:'storage',
        run: async function(create,{equal,assert}) {
          equal(create(), 'undefined', 'Worker should have no localStorage');
          let blocked = false;
          try { await fetch('http://127.0.0.1:4173/must-not-leave'); } catch { blocked = true; }
          assert(blocked, 'Network should be denied by CSP');
        },
      }],
      demo: function() { return {steps:[]}; },
    });
  });
  expect(outcome.results).toEqual([{id:'storage',passed:true}]);
  expect(requests).toHaveLength(0);
});
