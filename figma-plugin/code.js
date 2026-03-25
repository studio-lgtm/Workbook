// Nate J Minnick Portfolio — Figma Frames Generator
// Creates 5 frames: Home, Projects Gallery, Project Detail, About

const W = 1440;
const H = 900;
const GAP = 80;
const MARGIN = 12;
const HEADER_H = 44;
const FONT = { family: "Times New Roman", style: "Regular" };
const FONT_ITALIC = { family: "Times New Roman", style: "Italic" };

const BLACK = { r: 0, g: 0, b: 0 };
const WHITE = { r: 1, g: 1, b: 1 };
const GREY = { r: 0.85, g: 0.85, b: 0.85 };
const MID_GREY = { r: 0.5, g: 0.5, b: 0.5 };

const PROJECTS = [
  "WØRKS",
  "DoingWell",
  "Directors Library",
  "Brutus",
  "Audemars Piguet",
  "Valerie Stepanova",
  "Vazquez + Partners",
  "Converse Closet",
];

async function loadFonts() {
  await figma.loadFontAsync(FONT);
  await figma.loadFontAsync(FONT_ITALIC);
  await figma.loadFontAsync({ family: "Times New Roman", style: "Bold" });
}

function solid(color, opacity = 1) {
  return [{ type: "SOLID", color, opacity }];
}

function makeFrame(name, x, y) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(W, H);
  f.x = x;
  f.y = y;
  f.fills = solid(WHITE);
  f.clipsContent = true;
  return f;
}

function makeRect(parent, x, y, w, h, color, name = "") {
  const r = figma.createRectangle();
  r.resize(w, h);
  r.x = x;
  r.y = y;
  r.fills = solid(color);
  if (name) r.name = name;
  parent.appendChild(r);
  return r;
}

function makeText(parent, content, x, y, size, color, font = FONT, align = "LEFT", width = null) {
  const t = figma.createText();
  t.fontName = font;
  t.characters = content;
  t.fontSize = size;
  t.fills = solid(color);
  t.textAlignHorizontal = align;
  if (width) {
    t.textAutoResize = "HEIGHT";
    t.resize(width, t.height);
  } else {
    t.textAutoResize = "WIDTH_AND_HEIGHT";
  }
  t.x = x;
  t.y = y;
  parent.appendChild(t);
  return t;
}

function makeDivider(parent, y) {
  const line = figma.createLine();
  line.resize(W - MARGIN * 2, 0);
  line.x = MARGIN;
  line.y = y;
  line.strokes = solid(BLACK, 0.15);
  line.strokeWeight = 0.5;
  parent.appendChild(line);
  return line;
}

function makeHeader(frame, leftLabel, rightItems, dark = false) {
  const bg = dark ? BLACK : WHITE;
  const fg = dark ? WHITE : BLACK;

  // Header bar bg (subtle)
  const bar = figma.createRectangle();
  bar.resize(W, HEADER_H);
  bar.x = 0;
  bar.y = 0;
  bar.fills = solid(bg, 0);
  bar.name = "Header BG";
  frame.appendChild(bar);

  // Left — name
  makeText(frame, leftLabel, MARGIN, 14, 12, fg, FONT);

  // Right — nav items
  let rightX = W - MARGIN;
  for (let i = rightItems.length - 1; i >= 0; i--) {
    const t = makeText(frame, rightItems[i], 0, 14, 12, fg, FONT);
    rightX -= t.width;
    t.x = rightX;
    if (i > 0) rightX -= 24;
  }

  // Bottom border
  makeDivider(frame, HEADER_H);
}

// ─── FRAME 1: HOME ───────────────────────────────────────────────────────────
function buildHome(x) {
  const f = makeFrame("Home", x, 0);

  // Full-bleed hero placeholder
  makeRect(f, 0, HEADER_H, W, H - HEADER_H, GREY, "Hero Slideshow");

  // Slideshow label
  makeText(f, "Slideshow — landing.json", W / 2 - 100, H / 2 - 6, 11, MID_GREY, FONT_ITALIC);

  // Slide counter
  makeText(f, "1 / 3", W - MARGIN - 30, H - MARGIN - 14, 11, BLACK, FONT);

  makeHeader(f, "Nate J Minnick", ["About", "Instagram", "Email"]);

  return f;
}

// ─── FRAME 2: PROJECTS GALLERY ───────────────────────────────────────────────
function buildGallery(x) {
  const f = makeFrame("Projects Gallery", x, 0);

  const cols = 3;
  const colW = (W - MARGIN * 2 - 24 * (cols - 1)) / cols;
  const thumbH = colW * 0.65;
  const startY = HEADER_H + 24;

  PROJECTS.forEach((title, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const tx = MARGIN + col * (colW + 24);
    const ty = startY + row * (thumbH + 40);

    makeRect(f, tx, ty, colW, thumbH, GREY, `Thumb — ${title}`);
    makeText(f, title, tx, ty + thumbH + 8, 12, BLACK, FONT);

    // Asset count
    makeText(f, `${Math.floor(Math.random() * 8) + 3}`, tx + colW - 20, ty + thumbH + 8, 11, MID_GREY, FONT);
  });

  // "See less" link
  makeText(f, "See less", MARGIN, H - MARGIN - 14, 12, BLACK, FONT);

  makeHeader(f, "Nate J Minnick", ["About", "Instagram", "Email"]);

  return f;
}

// ─── FRAME 3: PROJECT DETAIL ─────────────────────────────────────────────────
function buildProjectDetail(x) {
  const f = makeFrame("Project Detail", x, 0);

  const mediaH = H - HEADER_H - 80;

  // Full-width media
  makeRect(f, 0, HEADER_H, W, mediaH, GREY, "Media Viewer");
  makeText(f, "Media slideshow", W / 2 - 55, HEADER_H + mediaH / 2 - 6, 11, MID_GREY, FONT_ITALIC);

  // Asset nav arrows
  makeText(f, "←", MARGIN, HEADER_H + mediaH / 2 - 8, 18, BLACK, FONT);
  makeText(f, "→", W - MARGIN - 18, HEADER_H + mediaH / 2 - 8, 18, BLACK, FONT);

  // Counter
  makeText(f, "2 / 5", W / 2 - 15, HEADER_H + mediaH + 8, 11, BLACK, FONT);

  // Bottom info bar
  const barY = HEADER_H + mediaH;
  makeText(f, "WØRKS", MARGIN, barY + 8, 12, BLACK, FONT);
  makeText(
    f,
    "WØRKS is a New York City based creative studio dedicated to cultural advancement through strategy and interdisciplinary design.",
    MARGIN + 180,
    barY + 8,
    11,
    MID_GREY,
    FONT,
    "LEFT",
    W - MARGIN - 180 - MARGIN
  );

  makeHeader(f, "Nate J Minnick", ["Close"]);

  return f;
}

// ─── FRAME 4: ABOUT ──────────────────────────────────────────────────────────
function buildAbout(x) {
  const f = makeFrame("About", x, 0);

  const bodyY = HEADER_H + 48;

  makeText(
    f,
    "Nate J Minnick is a designer and creative director based in New York.",
    MARGIN,
    bodyY,
    12,
    BLACK,
    FONT,
    "LEFT",
    W / 2
  );

  makeText(
    f,
    "With experience working with leading brands and studios, Nate specializes in brand identity, digital design, and creative strategy.",
    MARGIN,
    bodyY + 30,
    12,
    BLACK,
    FONT,
    "LEFT",
    W / 2
  );

  makeText(
    f,
    "For inquiries and collaborations, please reach out via email.",
    MARGIN,
    bodyY + 72,
    12,
    BLACK,
    FONT,
    "LEFT",
    W / 2
  );

  makeText(f, "studio@natejminnick.com", MARGIN, bodyY + 104, 12, MID_GREY, FONT_ITALIC);

  makeHeader(f, "Nate J Minnick", ["Instagram", "Email"]);

  return f;
}

// ─── FRAME 5: MOBILE HOME ────────────────────────────────────────────────────
function buildMobileHome(x) {
  const f = figma.createFrame();
  f.name = "Mobile — Home";
  f.resize(390, 844);
  f.x = x;
  f.y = 0;
  f.fills = solid(WHITE);
  f.clipsContent = true;

  makeRect(f, 0, HEADER_H, 390, 844 - HEADER_H, GREY, "Hero Slideshow");
  makeText(f, "Slideshow", 390 / 2 - 30, 844 / 2 - 6, 11, MID_GREY, FONT_ITALIC);
  makeText(f, "1 / 3", 390 - MARGIN - 24, 844 - MARGIN - 14, 11, BLACK, FONT);

  // Simple mobile header
  const bar = figma.createRectangle();
  bar.resize(390, HEADER_H);
  bar.x = 0; bar.y = 0;
  bar.fills = solid(WHITE, 0);
  f.appendChild(bar);

  makeText(f, "Nate J Minnick", MARGIN, 14, 12, BLACK, FONT);
  makeText(f, "About", 390 - MARGIN - 36, 14, 12, BLACK, FONT);

  const line = figma.createLine();
  line.resize(390 - MARGIN * 2, 0);
  line.x = MARGIN; line.y = HEADER_H;
  line.strokes = solid(BLACK, 0.15);
  line.strokeWeight = 0.5;
  f.appendChild(line);

  return f;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  await loadFonts();

  const frames = [
    buildHome(0),
    buildGallery(W + GAP),
    buildProjectDetail((W + GAP) * 2),
    buildAbout((W + GAP) * 3),
    buildMobileHome((W + GAP) * 4),
  ];

  // Select all and zoom to fit
  figma.currentPage.selection = frames;
  figma.viewport.scrollAndZoomIntoView(frames);

  figma.notify("✓ Portfolio frames created", { timeout: 3000 });
  figma.closePlugin();
})();
