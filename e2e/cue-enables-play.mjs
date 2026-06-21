/**
 * Regression guard for the "cueing a video leaves Play disabled" bug.
 *
 * Root cause was an ordering bug: DeckController.cue() set currentId AFTER
 * deck.cue() fired the synchronous "cued" state callback, so renderState()
 * disabled Play (currentId still null). A re-cue kept state="cued", so the
 * callback short-circuited and Play never re-enabled.
 *
 * Run against a running preview/dev server:
 *   npm run preview -- --port 4173   # in one shell
 *   node e2e/cue-enables-play.mjs     # in another
 */
import pkg from "@playwright/test";
const { chromium } = pkg;

const URL = process.env.MIX_URL ?? "http://localhost:4173/";
const V1 = "dQw4w9WgXcQ";
const V2 = "9bZkp7q19f0";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(URL, { waitUntil: "load" });
await page.waitForFunction(() => !!(window.YT && window.YT.Player), null, { timeout: 15000 });
await page.waitForTimeout(1200);

async function cue(side, id) {
  await page.locator(`.deck[data-side="${side}"] [data-role=url]`).fill(id);
  await page.locator(`.deck[data-side="${side}"] form button[type=submit]`).click();
  await page.waitForTimeout(2000);
}
const playDisabled = (side) =>
  page.locator(`.deck[data-side="${side}"] [data-role=play]`).isDisabled();

let pass = true;
await cue("left", V1);
const afterFirst = await playDisabled("left");
console.log(`play disabled after first cue:  ${afterFirst}  (expect false)`);
pass &&= afterFirst === false;

await cue("left", V2); // re-cue same deck
const afterSecond = await playDisabled("left");
console.log(`play disabled after second cue: ${afterSecond}  (expect false)`);
pass &&= afterSecond === false;

await browser.close();
console.log(pass ? "RESULT: PASS" : "RESULT: FAIL");
process.exit(pass ? 0 : 1);
