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
  assert.match(page, /Homepage emojis/);
  assert.match(page, /endingEmojis/);
  assert.match(page, /fan-reel/);
  assert.match(page, /story\.friends\.length>5\?11:5/);
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

test("simulates adding, saving, and deleting a temporary friend", () => {
  const colors = ["#f0a76d", "#7589ad", "#d17979", "#79a58e", "#9c78b1", "#d1a547", "#5d9da4"];
  const story = {
    group: "JOKES",
    title: "Some people become a whole chapter.",
    intro: "Five different people. One wonderfully chaotic friendship. This is a small home for the stories, laughter and ordinary days that became unforgettable.",
    ending: "The best part is that our story is still being written.",
    friends: [
      { id: 1, name: "Thalaivar", nickname: "Heisenberg", note: "The Planning Engineer", memory: "A", color: colors[0] },
      { id: 2, name: "Deivs", nickname: "Twin Instinct", note: "The Kindest Soul", memory: "B", color: colors[1] },
      { id: 3, name: "Denz", nickname: "Director", note: "The Storyteller", memory: "C", color: colors[2] },
      { id: 4, name: "Elevennnnn", nickname: "El...", note: "The Heroic", memory: "D", color: colors[3] },
      { id: 5, name: "JD", nickname: "Thalapathy", note: "The Real OG", memory: "E", color: colors[4] },
    ],
  };

  const addFriend = (draft) => {
    if (draft.friends.length === 11) return draft;
    const id = Math.max(0, ...draft.friends.map((friend) => friend.id)) + 1;
    return {
      ...draft,
      friends: [
        ...draft.friends,
        {
          id,
          name: `Friend ${draft.friends.length + 1}`,
          nickname: "Their signature role",
          note: "Add a short line about this friend.",
          memory: "Write a favorite memory here.",
          color: colors[draft.friends.length % colors.length],
        },
      ],
    };
  };
  const saveStory = (draft) => ({ ...draft, friends: draft.friends.slice(0, 11) });
  const removeFriend = (draft, id) => ({ ...draft, friends: draft.friends.filter((friend) => friend.id !== id) });

  const added = addFriend(structuredClone(story));
  assert.equal(added.friends.length, 6);
  assert.deepEqual(added.friends.at(-1), {
    id: 6,
    name: "Friend 6",
    nickname: "Their signature role",
    note: "Add a short line about this friend.",
    memory: "Write a favorite memory here.",
    color: colors[5],
  });

  const savedWithFriend = saveStory(added);
  assert.equal(savedWithFriend.friends.some((friend) => friend.id === 6), true);

  const savedAfterDelete = saveStory(removeFriend(savedWithFriend, 6));
  assert.equal(savedAfterDelete.friends.length, 5);
  assert.equal(savedAfterDelete.friends.some((friend) => friend.id === 6), false);
  assert.deepEqual(savedAfterDelete.friends.map((friend) => friend.name), [
    "Thalaivar",
    "Deivs",
    "Denz",
    "Elevennnnn",
    "JD",
  ]);
});

test("keeps custom homepage emojis and uploaded card photos editable", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);
  const draft = {
    group: "JOKES",
    title: "Some people become a whole chapter.",
    intro: "Intro",
    ending: "Ending",
    endingEmojis: ["💫", "🎧", "🫶"],
    friends: [
      {
        id: 6,
        name: "QA Friend",
        nickname: "Tester",
        note: "A custom card",
        memory: "A custom memory",
        image: "data:image/png;base64,abc",
        specialImage: "data:image/png;base64,xyz",
        color: "#d1a547",
      },
    ],
  };
  const saved = {
    ...draft,
    endingEmojis: draft.endingEmojis.length ? draft.endingEmojis.slice(0, 5) : ["😎", "🤍", "✨", "🔥", "⚡"],
    friends: draft.friends.slice(0, 11),
  };

  assert.deepEqual(saved.endingEmojis, ["💫", "🎧", "🫶"]);
  assert.equal(saved.friends[0].image.startsWith("data:image/"), true);
  assert.equal(saved.friends[0].specialImage.startsWith("data:image/"), true);
  assert.match(page, /endingEmojis\.map/);
  assert.match(page, /readEmojis/);
  assert.match(css, /\.fan-card\{\s*filter:grayscale\(1\)/);
  assert.match(css, /\.fan-card:hover/);
  assert.match(css, /\.people \.friend-photo \.portrait img\{\s*filter:none!important/);
});

test("supports eleven homepage fan cards without changing the five-card fan", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);
  const friends = Array.from({ length: 11 }, (_, index) => ({ id: index + 1 }));
  const topFanCount = (items) => items.slice(0, items.length > 5 ? 11 : 5).length;

  assert.equal(topFanCount(friends), 11);
  assert.equal(topFanCount(friends.slice(0, 5)), 5);
  assert.match(page, /homeCardPhoto/);
  assert.match(css, /\.fan\.fan-reel/);
  assert.match(css, /scroll-snap-type:x mandatory/);
});

test("keeps the native cursor visible across home and chapter pages", async () => {
  const css = await readFile(new URL("app/globals.css", root), "utf8");

  assert.doesNotMatch(css, /cursor\s*:\s*none/);
  assert.match(css, /html,\s*body,\s*body \*\{\s*cursor:default!important/);
  assert.match(css, /\[role="button"\],\s*\.paper\{\s*cursor:pointer!important/);
});
