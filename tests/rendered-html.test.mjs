import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

const friendAssets = [
  "thalaivar-card.jpg",
  "thalaivar-chapter.jpg",
  "thalaivar-heist.jpg",
  "thalaivar-memory.jpg",
  "deivs-card.jpg",
  "deivs-chapter.jpg",
  "deivs-grid.jpg",
  "deivs-memory.jpg",
  "denz-card.jpg",
  "denz-chapter.jpg",
  "denz-grid.jpg",
  "denz-memory.jpg",
  "eleven-card.jpg",
  "eleven-chapter.jpg",
  "eleven-grid.jpg",
  "eleven-memory.jpg",
  "jd-card.jpg",
  "jd-chapter.jpg",
  "jd-grid.jpg",
  "jd-memory.jpg",
];

test("keeps the JOKES archive content and sections intact", async () => {
  const [page, chapter, layout] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/chapter/page.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
  ]);

  for (const name of ["Thalaivar", "Deivs", "Denz", "Elevennnnn", "JD"]) {
    assert.match(page, new RegExp(name));
    assert.match(chapter, new RegExp(name));
  }

  for (const section of ["OUR STORY", "THE PEOPLE", "THE MEMORIES", "TO BE CONTINUED"]) {
    assert.match(page, new RegExp(section));
  }

  assert.match(page, /localStorage\.getItem\("jokes-story"\)/);
  assert.match(page, /sessionStorage\.setItem\("jokes-return-card"/);
  assert.match(page, /setPreview\(\{src:photo/);
  assert.match(page, /type="file" accept="image\/\*"/);
  assert.match(chapter, /new URLSearchParams\(location\.search\)\.get\("id"\)/);
  assert.match(chapter, /role="button"/);
  assert.match(layout, /JOKES — Our Friendship Story/);
});

test("keeps every curated image reference available", async () => {
  await Promise.all(friendAssets.map((asset) => access(new URL(`public/${asset}`, root))));

  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  const chapter = await readFile(new URL("app/chapter/page.tsx", root), "utf8");
  const source = `${page}\n${chapter}`;

  for (const asset of friendAssets) {
    assert.match(source, new RegExp(`/${asset.replace(".", "\\.")}`));
  }
});

test("does not contain starter preview or mojibake artifacts in app code", async () => {
  const files = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/chapter/page.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);
  const source = files.join("\n");

  assert.doesNotMatch(source, /SkeletonPreview|Your site is taking shape|codex-preview/);
  assert.doesNotMatch(source, /â|Ã|ðŸ/);
});
