/**
 * Exercises the REAL built page in a real DOM: extracts the inline script from
 * dist/client/index.html, runs it under jsdom, then drives the UI like a user would.
 * This is the check that matters — the static HTML can be perfect while the filter,
 * ZIP lookup and distance sort are all broken.
 */
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('dist/client/index.html', 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true });
const { window } = dom;
const doc = window.document;

let pass = 0;
let fail = 0;
const check = (label, ok, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ' — ' + detail : ''}`);
  ok ? pass++ : fail++;
};

const visible = () =>
  Array.from(doc.querySelectorAll('.resource-item')).filter((el) => !el.classList.contains('hidden'));

const countText = () => doc.getElementById('count')?.textContent ?? '';

console.log('=== initial render ===');
const total = doc.querySelectorAll('.resource-item').length;
check('all resources rendered', total === 28, `${total} items`);
check('initial visible == total', visible().length === 28, `${visible().length} visible`);
check('count text populated', /28 resources shown/.test(countText()), countText());

console.log('\n=== category filter ===');
const housingChip = doc.querySelector('[data-cat="housing"]');
housingChip.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
const housingCount = visible().length;
check('housing filter narrows results', housingCount > 0 && housingCount < 28, `${housingCount} visible`);
check('count text updated', /resources shown/.test(countText()), countText());
check('chip marked active', housingChip.classList.contains('chip-active'));

doc.querySelector('[data-cat="all"]').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
check('All chip restores full list', visible().length === 28, `${visible().length} visible`);

console.log('\n=== search ===');
const q = doc.getElementById('q');
q.value = 'detox';
q.dispatchEvent(new window.Event('input', { bubbles: true }));
const detox = visible().length;
check('search "detox" narrows', detox > 0 && detox < 38, `${detox} visible`);

q.value = 'zzzznope';
q.dispatchEvent(new window.Event('input', { bubbles: true }));
check('no-match shows empty state', !doc.getElementById('empty').classList.contains('hidden'));
q.value = '';
q.dispatchEvent(new window.Event('input', { bubbles: true }));
check('clearing search restores list', visible().length === 28, `${visible().length} visible`);

console.log('\n=== population filter ===');
const vetChip = doc.querySelector('[data-pop="veterans"]');
vetChip.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
const vets = visible().length;
check('veterans filter narrows', vets > 0 && vets < 28, `${vets} visible`);
check('veterans chip properly active', vetChip.classList.contains('chip-active'));
// The flip-flop state is genuine (clicking again removes the filter); the earlier test was
// wrong for that reason. Verify it works properly instead:
vetChip.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
check('veterans chip inactive after toggle-off', !vetChip.classList.contains('chip-active'));

console.log('\n=== ZIP distance sort ===');
const zip = doc.getElementById('zip');
zip.value = '32780';
zip.dispatchEvent(new window.Event('input', { bubbles: true }));

const badges = doc.querySelectorAll('.js-distance');
check('distance badges rendered', badges.length > 0, `${badges.length} badges`);
check('status text set', /Sorting by distance/.test(doc.getElementById('loc-status').textContent),
  doc.getElementById('loc-status').textContent);
check('clear button shown', !doc.getElementById('clear-loc').classList.contains('hidden'));

const grid = doc.getElementById('grid');
const order = Array.from(grid.querySelectorAll('.resource-item')).map((el) => el.dataset.id);
const firstTwo = order.slice(0, 2);
check('nearest resources sorted first', firstTwo.includes('no-one-hungry') && firstTwo.includes('lifepointe-ministries'),
  firstTwo.join(', '));
check('no-geo resources pushed to bottom', order.indexOf('211-united-way') > order.indexOf('no-one-hungry'));

const texts = Array.from(badges).map((b) => b.textContent);
check('address-precision badge has no approx caveat', texts.some((t) => /mi away$/.test(t)),
  texts.find((t) => /mi away$/.test(t)) || 'none');
check('city-precision badge flagged approximate', texts.some((t) => /approx\./.test(t)),
  texts.find((t) => /approx\./.test(t)) || 'none');

console.log('\n=== bad ZIP ===');
zip.value = '99999';
zip.dispatchEvent(new window.Event('input', { bubbles: true }));
check('unknown ZIP shows friendly message', /don't recognize|do not recognize/.test(doc.getElementById('loc-status').textContent),
  doc.getElementById('loc-status').textContent);

console.log('\n=== clear ===');
zip.value = '32780';
zip.dispatchEvent(new window.Event('input', { bubbles: true }));
doc.getElementById('clear-loc').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
check('clear removes badges', doc.querySelectorAll('.js-distance').length === 0);
check('clear resets status', doc.getElementById('loc-status').textContent === '');

console.log('\n=== combined filters ===');
doc.querySelector('[data-cat="housing"]').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
q.value = 'voucher';
q.dispatchEvent(new window.Event('input', { bubbles: true }));
const combo = visible().length;
check('category + search combine', combo >= 1 && combo < 28, `${combo} visible`);
check('combo finds HUD entry', visible().some((el) => el.dataset.id === 'hud-housing-florida'));

console.log('\n=== no SAMPLE records remain ===');
const samples = Array.from(doc.querySelectorAll('.resource-item')).filter(
  (el) => el.dataset.trust === 'sample',
);
check('zero SAMPLE placeholders', samples.length === 0, `${samples.length} remaining`);

// category distribution from rendered data
const cats = {};
doc.querySelectorAll('.resource-item').forEach((el) => {
  const c = el.dataset.category;
  cats[c] = (cats[c] || 0) + 1;
});
console.log('\n=== per-category rendered counts ===');
for (const [c, n] of Object.entries(cats)) {
  console.log(`  ${c.padEnd(14)} ${n}`);
}
const renderedTotal = Object.values(cats).reduce((a, b) => a + b, 0);
console.log(`  ${'TOTAL'.padEnd(14)} ${renderedTotal}`);
check('rendered total matches seed data', renderedTotal === 28, `expected 28, got ${renderedTotal}`);

console.log(`\n──────────── ${pass} passed, ${fail} failed ────────────`);
process.exit(fail === 0 ? 0 : 1);
