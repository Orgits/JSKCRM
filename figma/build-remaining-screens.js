/*
 * Figma build script — remaining staff screens + prototype links.
 *
 * Run as ONE `use_figma` call against file ldD74TQj2LSQjkHHZvo6WH (the Starter plan allows very
 * few MCP calls, so everything is in one retry-safe script):
 *   1. create_session(fileKey) → 2. use_figma(code = this file) → 3. optional get_screenshot.
 *
 * What it does
 *   - Clones the Dashboard frame (6:120) for each new screen, so Sidebar + Top bar match exactly.
 *   - Sets the Top bar title and the active Nav Item, then rebuilds "Content" from the local
 *     design system: Button, Input, Badge, KPI Card, Checkbox, Radio Option, Icon/* components,
 *     "SKS / Colors" variables, text styles and the Shadow/Card effect style.
 *   - Puts the frames in a new section "07 · Loans, Deposits, Transactions, Reports & Settings".
 *   - Prototype: wires every sidebar Nav Item on every staff frame to its screen, plus the main
 *     buttons (New loan application, Record payment, …) to their screens.
 *
 * Retry-safe: it deletes a previous "07 · …" section before building. Returns frame IDs to add to
 * the CLAUDE.md frame table.
 */

const SECTION_NAME = "07 · Loans, Deposits, Transactions, Reports & Settings";
const W = 1112; // Content width inside the 1440 frame (1176 − 2×32 padding)

// ───────────────────────── Design-system lookups ─────────────────────────
const page = figma.currentPage;
const old = page.children.find((n) => n.name === SECTION_NAME);
if (old) old.remove();

await Promise.all(
  [["DM Sans", "Regular"], ["DM Sans", "Medium"], ["DM Sans", "SemiBold"], ["DM Sans", "Bold"], ["Lora", "Bold"]].map(([family, style]) =>
    figma.loadFontAsync({ family, style }),
  ),
);

const vars = {};
for (const c of await figma.variables.getLocalVariableCollectionsAsync()) {
  for (const id of c.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id);
    vars[v.name] = v;
  }
}
const textStyles = Object.fromEntries((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
const effectStyles = Object.fromEntries((await figma.getLocalEffectStylesAsync()).map((s) => [s.name, s]));
const byId = async (id) => figma.getNodeByIdAsync(id);
const [dashboard, buttonSet, inputSet, badgeSet, kpiCard, checkboxSet, radioSet] = await Promise.all(
  ["6:120", "2:455", "2:490", "2:536", "2:541", "10:407", "10:418"].map(byId),
);
if (!dashboard || !buttonSet || !inputSet || !badgeSet || !kpiCard) throw new Error("Design-system nodes not found — check IDs");
const icons = Object.fromEntries(
  page.findAllWithCriteria({ types: ["COMPONENT"] }).filter((c) => c.name.startsWith("Icon/")).map((c) => [c.name.slice(5), c]),
);

const paint = (name) => figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", vars[name]);
const variant = (set, props) =>
  set.children.find((c) => Object.entries(props).every(([k, v]) => c.name.includes(`${k}=${v}`))) ?? set.defaultVariant;

function text(chars, style = "Body/Default", color = "text/primary", opts = {}) {
  const t = figma.createText();
  t.textStyleId = textStyles[style].id;
  t.characters = String(chars);
  t.fills = [paint(color)];
  if (opts.align) t.textAlignHorizontal = opts.align;
  return t;
}

function box(dir = "VERTICAL", props = {}) {
  const f = figma.createAutoLayout(dir, props);
  f.fills = [];
  return f;
}

/** Append and optionally FILL along the parent's main axis / stretch. */
function add(parent, child, { fill = false, stretch = false, width } = {}) {
  parent.appendChild(child);
  if (width) {
    child.resize(width, child.height);
    child.layoutSizingHorizontal = "FIXED";
  }
  if (fill) child.layoutSizingHorizontal = "FILL";
  if (stretch) child.layoutSizingVertical = "FILL";
  return child;
}

function card(props = {}) {
  const c = box("VERTICAL", { name: "Card", itemSpacing: 0, ...props });
  c.fills = [paint("neutral/surface")];
  c.strokes = [paint("neutral/border")];
  c.strokeWeight = 1;
  c.cornerRadius = 16;
  c.effectStyleId = effectStyles["Shadow/Card"].id;
  c.clipsContent = true;
  return c;
}

function cardHeader(parent, title, description) {
  const h = add(parent, box("VERTICAL", { name: "Card header", itemSpacing: 2, paddingLeft: 24, paddingRight: 24, paddingTop: 20, paddingBottom: 16 }), { fill: true });
  h.appendChild(text(title, "Heading/H4"));
  if (description) h.appendChild(text(description, "Body/Small", "text/secondary"));
  return h;
}

function button(label, type = "Primary", icon, size = "Medium") {
  const b = variant(buttonSet, { Type: type, Size: size }).createInstance();
  const props = { "Label#2:0": label, "Show icon#2:9": !!icon };
  if (icon && icons[icon]) props["Icon#2:18"] = icons[icon].id;
  b.setProperties(props);
  return b;
}

function badge(label, tone = "Neutral", dot = true) {
  const b = variant(badgeSet, { Tone: tone }).createInstance();
  b.setProperties({ "Label#2:59": label, "Show dot#2:66": dot });
  return b;
}

function input(label, value, { state = "Default", helper, leading, trailing } = {}) {
  const i = variant(inputSet, { State: state }).createInstance();
  const props = { "Label#2:27": label, "Value#2:31": value, "Show helper#10:4": !!helper, "Show leading#10:0": !!leading, "Show trailing#2:39": !!trailing };
  if (helper) props["Helper#10:8"] = helper;
  if (leading && icons[leading]) props["Leading icon#2:35"] = icons[leading].id;
  if (trailing && icons[trailing]) props["Trailing icon#2:43"] = icons[trailing].id;
  i.setProperties(props);
  return i;
}

function kpi(title, value, footer, icon) {
  const k = kpiCard.createInstance();
  const props = { "Title#2:73": title, "Value#2:74": value, "Footer#2:75": footer, "Show trend#2:77": false };
  if (icon && icons[icon]) props["Icon#2:78"] = icons[icon].id;
  k.setProperties(props);
  return k;
}

function checkbox(label, checked = true) {
  const c = variant(checkboxSet, { State: checked ? "Checked" : "Unchecked" }).createInstance();
  c.setProperties({ "Label#10:28": label });
  return c;
}

function radio(label, selected = false) {
  const r = variant(radioSet, { State: selected ? "Selected" : "Unselected" }).createInstance();
  r.setProperties({ "Label#10:31": label });
  return r;
}

// ───────────────────────── Composite blocks ─────────────────────────
function pageHeader(content, title, description, actions = [], back) {
  if (back) {
    const b = add(content, box("HORIZONTAL", { name: "Back link", itemSpacing: 6, counterAxisAlignItems: "CENTER" }));
    const arrow = icons.arrowLeft.createInstance();
    arrow.resize(16, 16);
    b.appendChild(arrow);
    b.appendChild(text(back, "Body/Medium", "text/secondary"));
  }
  const row = add(content, box("HORIZONTAL", { name: "Page header", itemSpacing: 12, counterAxisAlignItems: "CENTER" }), { fill: true });
  const left = add(row, box("VERTICAL", { name: "Title", itemSpacing: 4 }), { fill: true });
  left.appendChild(text(title, "Heading/H1"));
  if (description) left.appendChild(text(description, "Body/Default", "text/secondary"));
  for (const a of actions) row.appendChild(a);
  return row;
}

function kpiRow(content, items) {
  const row = add(content, box("HORIZONTAL", { name: "KPIs", itemSpacing: 16 }), { fill: true });
  for (const [t, v, f, i] of items) add(row, kpi(t, v, f, i), { fill: true });
  return row;
}

/** cells: string | { badge, tone } | { two: [primary, secondary] } | { amt, color } */
function cell(spec, width, align = "LEFT") {
  const c = box("VERTICAL", { name: "Cell", itemSpacing: 2, paddingLeft: 8, paddingRight: 8 });
  c.resize(width, 20);
  c.counterAxisAlignItems = align === "RIGHT" ? "MAX" : "MIN";
  c.primaryAxisSizingMode = "AUTO";
  if (typeof spec === "string") c.appendChild(text(spec, "Body/Default", "text/secondary"));
  else if (spec.badge) c.appendChild(badge(spec.badge, spec.tone, spec.dot !== false));
  else if (spec.two) {
    c.appendChild(text(spec.two[0], "Body/Strong"));
    c.appendChild(text(spec.two[1], "Caption/Default", "text/muted"));
  } else if (spec.amt) c.appendChild(text(spec.amt, "Body/Strong", spec.color ?? "text/primary"));
  return c;
}

function table(content, { name, search, filters = [], trailing = [], columns, rows, footer }) {
  const t = add(content, card({ name }), { fill: true });
  const bar = add(t, box("HORIZONTAL", { name: "Toolbar", itemSpacing: 12, paddingLeft: 20, paddingRight: 20, paddingTop: 16, paddingBottom: 16, counterAxisAlignItems: "MAX" }), { fill: true });
  const s = add(bar, input("Search", search, { leading: "search" }), { width: 320 });
  s.name = "Search";
  for (const f of filters) bar.appendChild(button(f, "Secondary", "chevronDown"));
  add(bar, box("HORIZONTAL", { name: "Spacer" }), { fill: true });
  for (const tr of trailing) bar.appendChild(tr);

  const head = add(t, box("HORIZONTAL", { name: "Header row", paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10 }), { fill: true });
  head.fills = [paint("neutral/subtle")];
  head.strokes = [paint("neutral/border")];
  head.strokeTopWeight = 1;
  head.strokeBottomWeight = 1;
  head.strokeLeftWeight = 0;
  head.strokeRightWeight = 0;
  for (const col of columns) {
    const h = box("VERTICAL", { name: col.label, paddingLeft: 8, paddingRight: 8 });
    h.resize(col.w, 14);
    h.primaryAxisSizingMode = "AUTO";
    h.counterAxisAlignItems = col.align === "RIGHT" ? "MAX" : "MIN";
    h.appendChild(text(col.label.toUpperCase(), "Table/Header", "text/muted"));
    head.appendChild(h);
  }
  for (const r of rows) {
    const row = add(t, box("HORIZONTAL", { name: "Row", paddingLeft: 12, paddingRight: 12, paddingTop: 12, paddingBottom: 12, counterAxisAlignItems: "CENTER" }), { fill: true });
    row.strokes = [paint("neutral/border")];
    row.strokeTopWeight = 0;
    row.strokeLeftWeight = 0;
    row.strokeRightWeight = 0;
    row.strokeBottomWeight = 1;
    r.forEach((spec, i) => row.appendChild(cell(spec, columns[i].w, columns[i].align)));
  }
  const foot = add(t, box("HORIZONTAL", { name: "Pagination", paddingLeft: 20, paddingRight: 20, paddingTop: 14, paddingBottom: 14 }), { fill: true });
  foot.appendChild(text(footer, "Body/Default", "text/secondary"));
  return t;
}

function formCard(parent, title, description, fields, cols = 2, opts = {}) {
  const c = add(parent, card({ name: title }), { fill: true });
  cardHeader(c, title, description);
  const grid = add(c, box("HORIZONTAL", { name: "Fields", layoutWrap: "WRAP", itemSpacing: 20, counterAxisSpacing: 20, paddingLeft: 24, paddingRight: 24, paddingBottom: 24 }), { fill: true });
  const inner = (opts.width ?? W) - 48;
  const colW = Math.floor((inner - 20 * (cols - 1)) / cols);
  for (const f of fields) {
    // A field is [label, value, opts] (opts.full spans the row) or a ready-made node (e.g. a button).
    const isNode = !Array.isArray(f);
    const node = isNode ? f : input(f[0], f[1], f[2] ?? {});
    add(grid, node, { width: isNode ? undefined : f[2]?.full ? inner : colW });
  }
  return c;
}

function summaryCard(parent, title, lines, hero, cta) {
  const c = add(parent, card({ name: title, itemSpacing: 16, paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24 }), { width: 340 });
  c.appendChild(text(title, "Heading/H4"));
  if (hero) {
    const h = add(c, box("VERTICAL", { name: "Hero", itemSpacing: 2, paddingLeft: 16, paddingRight: 16, paddingTop: 14, paddingBottom: 14 }), { fill: true });
    h.fills = [paint("brand/50")];
    h.cornerRadius = 10;
    h.appendChild(text(hero[0], "Caption/Default", "brand/700"));
    h.appendChild(text(hero[1], "KPI/Value", "brand/700"));
    if (hero[2]) h.appendChild(text(hero[2], "Caption/Default", "brand/700"));
  }
  for (const [l, v, strong] of lines) {
    const r = add(c, box("HORIZONTAL", { name: l, paddingTop: 4, paddingBottom: 4 }), { fill: true });
    add(r, text(l, "Body/Small", "text/secondary"), { fill: true });
    r.appendChild(text(v, strong ? "Heading/H4" : "Body/Strong"));
  }
  if (cta) add(c, cta, { fill: true });
  return c;
}

function labelValueCard(parent, title, description, lines) {
  const c = add(parent, card({ name: title }), { fill: true });
  cardHeader(c, title, description);
  for (const [l, v, strong, indent] of lines) {
    const r = add(c, box("HORIZONTAL", { name: l, paddingLeft: indent ? 40 : 24, paddingRight: 24, paddingTop: 10, paddingBottom: 10 }), { fill: true });
    if (strong) r.fills = [paint("neutral/subtle")];
    r.strokes = [paint("neutral/border")];
    r.strokeTopWeight = 1;
    r.strokeBottomWeight = 0;
    r.strokeLeftWeight = 0;
    r.strokeRightWeight = 0;
    add(r, text(l, strong ? "Body/Strong" : "Body/Default", strong ? "text/primary" : "text/secondary"), { fill: true });
    r.appendChild(text(v, strong ? "Body/Strong" : "Body/Default"));
  }
  return c;
}

function iconTile(icon, bg, fg) {
  const t = box("HORIZONTAL", { name: "Icon tile", primaryAxisAlignItems: "CENTER", counterAxisAlignItems: "CENTER" });
  t.resize(40, 40);
  t.primaryAxisSizingMode = "FIXED";
  t.counterAxisSizingMode = "FIXED";
  t.fills = [paint(bg)];
  t.cornerRadius = 10;
  const i = icons[icon].createInstance();
  t.appendChild(i);
  for (const v of i.findAll((n) => "strokes" in n && n.strokes.length)) v.strokes = [paint(fg)];
  return t;
}

// ───────────────────────── Frame scaffolding ─────────────────────────
const section = figma.createSection();
section.name = SECTION_NAME;
section.x = 1640;
section.y = Math.max(...page.children.filter((n) => n !== section).map((n) => n.y + n.height)) + 200;

const navInstances = (frame) =>
  frame.findAllWithCriteria({ types: ["INSTANCE"] }).filter((i) => {
    const mc = i.mainComponent;
    return mc && (mc.parent?.type === "COMPONENT_SET" ? mc.parent.name : mc.name) === "Nav Item";
  });
const navLabel = (i) => String(i.componentProperties[Object.keys(i.componentProperties).find((k) => k.startsWith("Label"))]?.value ?? "");

const frames = {};
let slot = 0;
async function screen(key, name, title, activeNav, build) {
  const f = dashboard.clone();
  section.appendChild(f);
  f.name = name;
  f.x = 100 + (slot % 3) * 1560;
  f.y = 100 + Math.floor(slot / 3) * 1900;
  slot++;

  // Top bar title (first text) and subtitle (second, if present).
  const titleFrame = f.findOne((n) => n.name === "Title" && n.type === "FRAME");
  const titleTexts = titleFrame ? titleFrame.findAllWithCriteria({ types: ["TEXT"] }) : [];
  for (const t of titleTexts) await Promise.all(t.getRangeAllFontNames(0, t.characters.length).map((fn) => figma.loadFontAsync(fn)));
  if (titleTexts[0]) titleTexts[0].characters = title;
  if (titleTexts[1]) titleTexts[1].characters = "Head Office · " + "11 Nov 2026";

  for (const i of navInstances(f)) {
    const label = navLabel(i);
    const state = activeNav && label.toLowerCase().startsWith(activeNav.toLowerCase()) ? "Active" : "Default";
    try {
      i.setProperties({ State: state });
    } catch {
      /* nav item without State variant — leave as is */
    }
  }

  const content = f.findOne((n) => n.name === "Content" && n.type === "FRAME");
  for (const c of [...content.children]) c.remove();
  content.itemSpacing = 24;
  content.layoutSizingVertical = "HUG";
  const main = content.parent;
  if (main && "layoutSizingVertical" in main) main.layoutSizingVertical = "HUG";
  // Sidebar follows the page height instead of the Dashboard's fixed 1502px.
  const sidebar = f.children.find((n) => n.name === "Sidebar");
  if (sidebar) sidebar.layoutSizingVertical = "FILL";
  f.counterAxisSizingMode = "AUTO";
  f.minHeight = 1024;

  await build(content);
  frames[key] = f;
  return f;
}

const two = (a, b) => ({ two: [a, b] });

// ───────────────────────── Screens ─────────────────────────
await screen("loans", "Loans — List", "Loans", "Loans", (c) => {
  pageHeader(c, "Loans", "Loan portfolio, repayments and applications awaiting approval", [button("New loan application", "Primary", "plus")]);
  kpiRow(c, [
    ["Loans outstanding", "₹44 L", "across 22 active loans", "banknote"],
    ["EMIs due this month", "₹10,100", "2 instalments", "calendar"],
    ["Overdue EMIs", "₹36,100", "2 loans · 9% of portfolio", "alert"],
    ["Applications pending", "4", "₹13,75,000 requested", "wallet"],
  ]);
  const pipe = add(c, card({ name: "Applications in progress" }), { fill: true });
  cardHeader(pipe, "Applications in progress", "New → document verification → loan committee");
  const cols = add(pipe, box("HORIZONTAL", { name: "Stages", itemSpacing: 16, paddingLeft: 24, paddingRight: 24, paddingBottom: 24 }), { fill: true });
  const stages = [
    ["New", "Info", [["Deepak Rawat", "₹3,00,000", "LN-2026-0418 · Business · applied 10 / 11 / 2026"]]],
    ["Verification", "Warning", [["Anjali Mishra", "₹1,50,000", "LN-2026-0415 · Education · 08 / 11 / 2026"], ["Pooja Bisht", "₹75,000", "LN-2026-0409 · Medical · 04 / 11 / 2026"]]],
    ["Committee", "Brand", [["Suresh Yadav", "₹8,50,000", "LN-2026-0411 · Housing · 05 / 11 / 2026"]]],
  ];
  for (const [stage, tone, items] of stages) {
    const col = add(cols, box("VERTICAL", { name: stage, itemSpacing: 12, paddingLeft: 16, paddingRight: 16, paddingTop: 16, paddingBottom: 16 }), { fill: true, stretch: false });
    col.fills = [paint("neutral/subtle")];
    col.strokes = [paint("neutral/border")];
    col.cornerRadius = 10;
    col.appendChild(badge(stage, tone));
    for (const [n, amt, meta] of items) {
      const it = add(col, box("VERTICAL", { name: n, itemSpacing: 4, paddingLeft: 12, paddingRight: 12, paddingTop: 12, paddingBottom: 12 }), { fill: true });
      it.fills = [paint("neutral/surface")];
      it.strokes = [paint("neutral/border")];
      it.cornerRadius = 10;
      const top = add(it, box("HORIZONTAL", { name: "Top" }), { fill: true });
      add(top, text(n, "Body/Strong"), { fill: true });
      top.appendChild(text(amt, "Body/Strong"));
      it.appendChild(text(meta, "Caption/Default", "text/muted"));
    }
  }
  table(c, {
    name: "Active loans",
    search: "Loan no., member name or ID",
    filters: ["Status: All", "Purpose: All"],
    trailing: [button("Export", "Secondary", "download")],
    columns: [
      { label: "Loan", w: 150 }, { label: "Borrower", w: 190 }, { label: "Sanctioned", w: 110, align: "RIGHT" }, { label: "EMI", w: 90, align: "RIGHT" },
      { label: "Repaid", w: 120 }, { label: "Outstanding", w: 120, align: "RIGHT" }, { label: "Next due", w: 120 }, { label: "Status", w: 164 },
    ],
    rows: [
      [two("LN-2025-9678", "Housing · 23 / 03 / 2025"), two("Kavita Agarwal", "JSK-M-0767"), "₹3,49,000", "₹15,950", "17 of 24 EMIs", { amt: "₹1,01,650" }, "23 / 09 / 2026", { badge: "2 EMIs overdue", tone: "Danger" }],
      [two("LN-2025-0610", "Personal · 02 / 09 / 2025"), two("Rajesh Yadav", "JSK-M-0645"), "₹80,000", "₹4,200", "13 of 24 EMIs", { amt: "₹42,600" }, "02 / 11 / 2026", { badge: "1 EMI overdue", tone: "Danger" }],
      [two("LN-2025-0942", "Business · 20 / 08 / 2025"), two("Anita Rawat", "JSK-M-0556"), "₹1,75,000", "₹5,900", "15 of 36 EMIs", { amt: "₹1,02,000" }, "20 / 11 / 2026", { badge: "Regular", tone: "Success" }],
      [two("LN-2026-0118", "Personal · 05 / 04 / 2026"), two("Vikas Jain", "JSK-M-0731"), "₹1,50,000", "₹7,050", "7 of 24 EMIs", { amt: "₹96,500" }, "05 / 12 / 2026", { badge: "Regular", tone: "Success" }],
      [two("LN-2025-6200", "Personal · 05 / 11 / 2025"), two("Ritu Chauhan", "JSK-M-0996"), "₹2,60,000", "₹11,900", "11 of 24 EMIs", { amt: "₹1,40,650" }, "05 / 12 / 2026", { badge: "Regular", tone: "Success" }],
    ],
    footer: "Showing 1–5 of 22 loans",
  });
});

await screen("loanNew", "Loans — New Application", "New Loan Application", "Loans", (c) => {
  pageHeader(c, "New loan application", "Borrower and guarantors must be active members with verified KYC. A member can guarantee at most 3 loans.", [], "All loans");
  const cols = add(c, box("HORIZONTAL", { name: "Columns", itemSpacing: 24 }), { fill: true });
  const left = add(cols, box("VERTICAL", { name: "Form", itemSpacing: 24 }), { fill: true });
  const lw = W - 340 - 24;
  formCard(left, "Borrower", "Search by name or member ID", [["Member", "Ramesh Kumar Gupta · JSK-M-0412", { state: "Filled", trailing: "chevronDown", full: true }]], 1, { width: lw });
  const details = formCard(
    left,
    "Loan details",
    "Rate and limits come from the society's loan policy",
    [["Loan amount", "₹ 1,50,000", { state: "Filled", helper: "Maximum ₹3,00,000" }], ["Tenure", "24 months", { state: "Filled", trailing: "chevronDown" }]],
    2,
    { width: lw },
  );
  const radios = box("HORIZONTAL", { name: "Loan type", layoutWrap: "WRAP", itemSpacing: 12, counterAxisSpacing: 12, paddingLeft: 24, paddingRight: 24, paddingBottom: 20 });
  details.insertChild(1, radios);
  radios.layoutSizingHorizontal = "FILL";
  ["Personal · 12%", "Business · 13%", "Education · 10%", "Housing · 9.5%", "Medical · 11%"].forEach((l, i) => add(radios, radio(l, i === 0), { width: Math.floor((lw - 48 - 24) / 3) }));
  formCard(left, "Guarantors", "Personal loans need 2 member guarantors", [
    ["Guarantor 1", "Anita Rawat · JSK-M-0556", { state: "Filled", trailing: "chevronDown" }],
    ["Guarantor 2", "Select member", { trailing: "chevronDown" }],
  ], 2, { width: lw });
  add(left, checkbox("I have checked the borrower's and guarantors' KYC, income proof and signed consent forms.", false), { fill: true });
  summaryCard(
    cols,
    "Repayment estimate",
    [["Loan amount", "₹1,50,000"], ["Total interest", "₹19,464"], ["Processing fee (1%)", "₹1,500"], ["Total repayable", "₹1,69,464", true]],
    ["Monthly EMI", "₹7,061", "for 24 months · 12% p.a."],
    button("Submit application", "Primary", "arrowRight", "Large"),
  );
});

await screen("deposits", "Deposits", "Deposits", "Deposits", (c) => {
  pageHeader(c, "Deposits", "118 accounts holding ₹71.6 L across savings, thrift, RD and FD", [button("Record deposit", "Primary", "plus")]);
  kpiRow(c, [
    ["Savings", "₹41.9 L", "54 accounts · 59% of deposits", "wallet"],
    ["Compulsory thrift", "₹28 L", "62 accounts · 39% of deposits", "calendarCheck"],
    ["Recurring deposits", "₹18,000", "1 account · 0% of deposits", "calendar"],
    ["Fixed deposits", "₹1.5 L", "1 account · 2% of deposits", "banknote"],
  ]);
  table(c, {
    name: "Deposit accounts",
    search: "Account no., member name or ID",
    filters: ["Type: All", "Sort: Highest balance"],
    trailing: [text("Total ₹71,56,850", "Body/Strong"), button("Export", "Secondary", "download")],
    columns: [{ label: "Account", w: 170 }, { label: "Member", w: 240 }, { label: "Terms", w: 220 }, { label: "Note", w: 170 }, { label: "Balance", w: 140, align: "RIGHT" }, { label: "", w: 124 }],
    rows: [
      ["SB-1046", "Arjun Saxena", "JSK-M-1046", "₹1,80,000"],
      ["SB-0359", "Manoj Bisht", "JSK-M-0359", "₹1,79,000"],
      ["SB-0598", "Seema Agarwal", "JSK-M-0598", "₹1,68,400"],
      ["SB-1135", "Kavita Kapoor", "JSK-M-1135", "₹1,65,400"],
      ["SB-0747", "Arjun Negi", "JSK-M-0747", "₹1,61,500"],
    ].map(([a, n, id, bal]) => [two(a, "Savings"), two(n, id), "Interest 4.0% p.a.", "Withdrawable", { amt: bal }, { badge: "Passbook", tone: "Brand", dot: false }]),
    footer: "Showing 1–5 of 118 accounts",
  });
});

await screen("transactions", "Transactions — Ledger", "Transactions", "Transactions", (c) => {
  pageHeader(c, "Transactions", "Every receipt and payout at the counter, by UPI, cheque and auto-debit", [button("Record payment", "Primary", "plus")]);
  kpiRow(c, [
    ["Collections · 30 days", "₹13.1 L", "Deposits, EMIs, shares and fees", "trendUp"],
    ["Payouts · 30 days", "₹11.9 L", "Withdrawals and loan disbursals", "trendDown"],
    ["Net inflow", "₹1.2 L", "143 completed transactions", "rupee"],
    ["Needs attention", "16", "Pending or failed", "clock"],
  ]);
  table(c, {
    name: "Transactions",
    search: "Txn / receipt no., account or member",
    filters: ["Period: Last 30 days", "Type: All", "Mode: All", "Status: All"],
    trailing: [button("Export", "Secondary", "download")],
    columns: [{ label: "Date & time", w: 130 }, { label: "Transaction", w: 210 }, { label: "Member", w: 200 }, { label: "Type", w: 130 }, { label: "Mode", w: 100 }, { label: "Amount", w: 130, align: "RIGHT" }, { label: "Status", w: 164 }],
    rows: [
      [two("11 / 11 / 2026", "10:42 AM"), two("TXN-80412", "SB-0412 · by Meena (Cashier)"), two("Ramesh Kumar Gupta", "JSK-M-0412"), "Deposit", "Cash", { amt: "+₹25,000", color: "success/600" }, { badge: "Completed", tone: "Success" }],
      [two("11 / 11 / 2026", "10:15 AM"), two("TXN-80411", "LN · by Krishna Verma"), two("Sunita Devi", "JSK-M-0877"), "EMI received", "UPI", { amt: "+₹8,450", color: "success/600" }, { badge: "Completed", tone: "Success" }],
      [two("11 / 11 / 2026", "9:58 AM"), two("TXN-80410", "LN · by Priya Sharma"), two("Mohd. Arif Khan", "JSK-M-1023"), "Loan disbursal", "Transfer", { amt: "−₹1,84,500" }, { badge: "Pending", tone: "Warning" }],
      [two("10 / 11 / 2026", "5:20 PM"), two("TXN-80409", "SB-0331 · by Meena (Cashier)"), two("Kavita Joshi", "JSK-M-0331"), "Withdrawal", "Cash", { amt: "−₹12,000" }, { badge: "Completed", tone: "Success" }],
      [two("10 / 11 / 2026", "4:05 PM"), two("TXN-80408", "LN · by Krishna Verma"), two("Harish Chandra Pandey", "JSK-M-1190"), "EMI received", "UPI", { amt: "+₹6,200", color: "success/600" }, { badge: "Failed", tone: "Danger" }],
    ],
    footer: "Showing 1–5 of 160 transactions",
  });
});

await screen("payment", "Transactions — Record Payment", "Record Payment", "Transactions", (c) => {
  pageHeader(c, "Record payment", "Post a deposit, withdrawal or EMI and print the receipt for the member", [], "All transactions");
  const cols = add(c, box("HORIZONTAL", { name: "Columns", itemSpacing: 24 }), { fill: true });
  const lw = W - 340 - 24;
  const left = add(cols, box("VERTICAL", { name: "Form", itemSpacing: 24 }), { fill: true });
  const f = formCard(
    left,
    "Transaction",
    null,
    [
      ["Member", "Ramesh Kumar Gupta · JSK-M-0412", { state: "Filled", trailing: "chevronDown" }],
      ["Loan", "LN-2025-0412 · Personal · EMI ₹8,450", { state: "Filled", trailing: "chevronDown" }],
      ["Amount", "₹ 8,450", { state: "Filled" }],
      ["Mode", "UPI", { state: "Filled", trailing: "chevronDown" }],
      ["UPI / bank reference", "6278 1934 0021", { state: "Focused" }],
      ["Remarks", "November instalment"],
    ],
    2,
    { width: lw },
  );
  const kinds = box("HORIZONTAL", { name: "Kind", itemSpacing: 12, paddingLeft: 24, paddingRight: 24, paddingBottom: 20 });
  f.insertChild(1, kinds);
  kinds.layoutSizingHorizontal = "FILL";
  ["Deposit", "Withdrawal", "EMI repayment"].forEach((l, i) => add(kinds, radio(l, i === 2), { fill: true }));
  summaryCard(
    cols,
    "Summary",
    [["Member", "Ramesh Kumar Gupta"], ["Loan", "LN-2025-0412"], ["Outstanding now", "₹80,250"], ["Outstanding after", "₹71,800"]],
    ["Collect", "₹8,450", "by UPI"],
    button("Post & print receipt", "Primary", "receipt", "Large"),
  );
});

await screen("reports", "Reports", "Reports", "Reports", (c) => {
  pageHeader(c, "Reports", "Society position as on 11 Nov 2026 and downloadable registers");
  const row = add(c, box("HORIZONTAL", { name: "Position", itemSpacing: 24 }), { fill: true });
  labelValueCard(row, "Funds position", "Liabilities to members and loans given out", [
    ["Share capital", "₹95,500"], ["Savings", "₹41,89,850", false, true], ["Compulsory thrift", "₹27,99,000", false, true], ["Recurring deposit", "₹18,000", false, true],
    ["Fixed deposit", "₹1,50,000", false, true], ["Total member funds", "₹72,52,350", true], ["Loans outstanding", "₹43,97,250"], ["Credit–deposit ratio", "61%", true],
  ]);
  labelValueCard(row, "Membership & loan quality", "For the monthly committee meeting", [
    ["Members on register", "62"], ["Active", "50", false, true], ["Pending approval / dormant", "12", false, true], ["Active loans", "22", true],
    ["Loans with overdue EMIs", "2", false, true], ["Outstanding on overdue loans", "₹1,44,250", false, true], ["Portfolio at risk", "3.3%", true],
  ]);
  const head = add(c, box("VERTICAL", { name: "Registers heading", itemSpacing: 4 }), { fill: true });
  head.appendChild(text("Registers & statements", "Heading/H3"));
  head.appendChild(text("Download as CSV — opens in Excel with ₹ and Hindi names intact.", "Body/Small", "text/secondary"));
  const grid = add(c, box("HORIZONTAL", { name: "Report cards", layoutWrap: "WRAP", itemSpacing: 16, counterAxisSpacing: 16 }), { fill: true });
  const reports = [
    ["Day book", "Every receipt and payout with mode, account and cashier — for daily cash tally.", "history", "brand/50", "brand/600", "166 rows"],
    ["Loan portfolio", "All active loans with sanction, EMI, repayments and outstanding principal.", "banknote", "accent/50", "accent/600", "22 rows"],
    ["Overdue & recovery list", "Borrowers with unpaid EMIs, their guarantors and the recovery-visit location.", "alert", "danger/50", "danger/600", "2 rows"],
    ["Member register", "Statutory register: member number, admission date, membership type, KYC and status.", "idCard", "info/50", "info/600", "62 rows"],
    ["Deposit balances", "Closing balance of every savings, thrift, RD and FD account.", "wallet", "success/50", "success/600", "118 rows"],
    ["Share capital register", "Shares held and paid-up share capital per member.", "fileText", "brand/50", "brand/600", "62 rows"],
  ];
  for (const [t, d, ic, bg, fg, rows] of reports) {
    const rc = add(grid, card({ name: t, itemSpacing: 16, paddingLeft: 20, paddingRight: 20, paddingTop: 20, paddingBottom: 20 }), { width: Math.floor((W - 32) / 3) });
    const top = add(rc, box("HORIZONTAL", { name: "Top", itemSpacing: 12 }), { fill: true });
    top.appendChild(iconTile(ic, bg, fg));
    const tx = add(top, box("VERTICAL", { name: "Text", itemSpacing: 4 }), { fill: true });
    tx.appendChild(text(t, "Heading/H4"));
    const desc = add(tx, text(d, "Body/Small", "text/secondary"), { fill: true });
    desc.textAutoResize = "HEIGHT";
    const bottom = add(rc, box("HORIZONTAL", { name: "Bottom", itemSpacing: 8, counterAxisAlignItems: "CENTER" }), { fill: true });
    bottom.appendChild(badge("CSV", "Neutral", false));
    add(bottom, text(rows, "Caption/Default", "text/muted"), { fill: true });
    bottom.appendChild(button("Download", "Secondary", "download"));
  }
});

await screen("settings", "Settings", "Settings", "Settings", (c) => {
  pageHeader(c, "Settings", "Society profile, rates, fees, notifications and sign-in security");
  const cols = add(c, box("HORIZONTAL", { name: "Columns", itemSpacing: 24 }), { fill: true });
  const nav = add(cols, box("VERTICAL", { name: "Section nav", itemSpacing: 4 }), { width: 220 });
  [["Society profile", "building"], ["Interest rates", "percent"], ["Fees & charges", "receipt"], ["Notifications", "bell"], ["Security", "shield"]].forEach(([l, ic], i) => {
    const it = add(nav, box("HORIZONTAL", { name: l, itemSpacing: 10, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, counterAxisAlignItems: "CENTER" }), { fill: true });
    it.cornerRadius = 10;
    if (i === 0) it.fills = [paint("neutral/surface")];
    const icn = icons[ic].createInstance();
    icn.resize(18, 18);
    it.appendChild(icn);
    it.appendChild(text(l, "Body/Medium", i === 0 ? "text/primary" : "text/secondary"));
  });
  const rw = W - 220 - 24;
  const right = add(cols, box("VERTICAL", { name: "Sections", itemSpacing: 24 }), { fill: true });
  formCard(right, "Society profile", "Printed on receipts, passbooks and statements", [
    ["Registered name", "Jai Shri Krishna Co-operative Thrift & Credit Society Ltd.", { state: "Read-only", helper: "Changes need the Registrar's approval", full: true }],
    ["Registration no.", "As on the registration certificate"], ["Head office", "Head Office, Badli", { state: "Filled" }],
    ["Office phone", "Landline or mobile", { leading: "phone" }], ["Office email", "Shown on statements", { leading: "mail" }],
  ], 2, { width: rw });
  formCard(right, "Interest rates", "% per year. New rates apply to new loans and deposits only.", [
    ["Personal loan", "12 %", { state: "Filled" }], ["Business loan", "13 %", { state: "Filled" }], ["Education loan", "10 %", { state: "Filled" }],
    ["Housing loan", "9.5 %", { state: "Filled" }], ["Savings", "4 %", { state: "Filled" }], ["Fixed deposit (2 years)", "7.5 %", { state: "Filled" }],
  ], 3, { width: rw });
  const n = add(right, card({ name: "Notifications" }), { fill: true });
  cardHeader(n, "Notifications", "SMS and email sent to members and staff");
  const list = add(n, box("VERTICAL", { name: "Options", itemSpacing: 16, paddingLeft: 24, paddingRight: 24, paddingBottom: 24 }), { fill: true });
  [["SMS the member after every transaction", true], ["EMI reminder 3 days before the due date", true], ["Alert guarantors when an EMI is 30 days overdue", true], ["Daily cash summary email to the branch manager", false]].forEach(([l, on]) => list.appendChild(checkbox(l, on)));
  const bar = add(right, card({ name: "Save bar", layoutMode: "HORIZONTAL", itemSpacing: 12, paddingLeft: 20, paddingRight: 20, paddingTop: 12, paddingBottom: 12, primaryAxisAlignItems: "MAX" }), { fill: true });
  bar.effectStyleId = effectStyles["Shadow/Elevated"].id;
  bar.appendChild(button("Discard changes", "Ghost"));
  bar.appendChild(button("Save changes", "Primary", "save"));
});

await screen("help", "Help & Support", "Help & support", "Help", (c) => {
  pageHeader(c, "Help & support", "Guides for everyday counter work, answers to common questions, and a way to reach the admin team");
  const guides = add(c, box("HORIZONTAL", { name: "Quick guides", itemSpacing: 16 }), { fill: true });
  [
    ["Register a member", "KYC, nominee, bank and admission fees", "userPlus", "brand/50", "brand/600"],
    ["Record a payment", "Deposits, withdrawals and EMIs with receipt", "receipt", "success/50", "success/600"],
    ["Start a loan application", "EMI estimate, guarantors and checks", "banknote", "accent/50", "accent/600"],
    ["Download reports", "Day book, loan portfolio, registers", "chart", "info/50", "info/600"],
  ].forEach(([t, d, ic, bg, fg]) => {
    const g = add(guides, card({ name: t, itemSpacing: 12, paddingLeft: 20, paddingRight: 20, paddingTop: 20, paddingBottom: 20 }), { fill: true });
    g.appendChild(iconTile(ic, bg, fg));
    g.appendChild(text(t, "Heading/H4"));
    g.appendChild(text(d, "Body/Small", "text/secondary"));
  });
  const cols = add(c, box("HORIZONTAL", { name: "Columns", itemSpacing: 24 }), { fill: true });
  const faq = add(cols, card({ name: "FAQ" }), { fill: true });
  cardHeader(faq, "Frequently asked questions");
  [
    "I posted a transaction against the wrong account. How do I fix it?",
    "How does a loan application move to approval?",
    "Why can't I choose some members as guarantors?",
    "A member's KYC shows “Re-KYC due”. What should I do?",
    "The member lost their receipt. How do I confirm the payment?",
    "A member can't sign in to the member portal.",
  ].forEach((q, i) => {
    const r = add(faq, box("VERTICAL", { name: "Question", itemSpacing: 8, paddingLeft: 24, paddingRight: 24, paddingTop: 16, paddingBottom: 16 }), { fill: true });
    r.strokes = [paint("neutral/border")];
    r.strokeTopWeight = 1;
    r.strokeBottomWeight = 0;
    r.strokeLeftWeight = 0;
    r.strokeRightWeight = 0;
    const top = add(r, box("HORIZONTAL", { name: "Summary", itemSpacing: 16 }), { fill: true });
    add(top, text(q, "Body/Strong"), { fill: true }).textAutoResize = "HEIGHT";
    top.appendChild(icons.chevronDown.createInstance());
    if (i === 0) {
      const a = add(r, text("Posted transactions can't be edited or deleted, so the passbook stays auditable. Raise a ticket with the transaction ID; the branch manager posts a reversal and you record the payment again against the right account.", "Body/Default", "text/secondary"), { fill: true });
      a.textAutoResize = "HEIGHT";
    }
  });
  const side = add(cols, box("VERTICAL", { name: "Side", itemSpacing: 24 }), { width: 380 });
  formCard(side, "Raise a ticket", "For corrections, reversals and access problems", [
    ["Category", "Wrong entry / reversal", { state: "Filled", trailing: "chevronDown" }],
    ["Subject", "Deposit posted to wrong account", { state: "Filled" }],
    ["Transaction / member ID", "TXN-80412"],
    ["Details", "What happened, and what should it be?"],
    button("Send to admin team", "Primary", "arrowRight"),
  ], 1, { width: 380 });
  const visit = add(side, card({ name: "Visit the office", itemSpacing: 12, paddingLeft: 24, paddingRight: 24, paddingTop: 20, paddingBottom: 20 }), { fill: true });
  visit.appendChild(text("Visit the office", "Heading/H4"));
  visit.appendChild(text("Head Office, Badli", "Body/Default", "text/secondary"));
  visit.appendChild(text("Monday – Saturday, 9:30 AM – 5:30 PM", "Body/Default", "text/secondary"));
});

await screen("memberEdit", "Member — Edit", "Edit member", "Members", (c) => {
  pageHeader(c, "Edit member", "Ramesh Kumar Gupta · JSK-M-0412", [], "Back to profile");
  const id = add(c, card({ name: "Identity & KYC" }), { fill: true });
  cardHeader(id, "Identity & KYC", "These match the member's Aadhaar and PAN. To change them, re-verify KYC with the original documents.");
  const grid = add(id, box("HORIZONTAL", { name: "Identity", itemSpacing: 1 }), { fill: true });
  grid.fills = [paint("neutral/border")];
  [["Full name", "Ramesh Kumar Gupta"], ["Father's name", "Shyam Lal Gupta"], ["Date of birth", "22 / 07 / 1978"], ["Aadhaar", "XXXX XXXX 7731"], ["PAN", "AKPPG5512R"]].forEach(([l, v]) => {
    const f = add(grid, box("VERTICAL", { name: l, itemSpacing: 2, paddingLeft: 20, paddingRight: 20, paddingTop: 14, paddingBottom: 14 }), { fill: true });
    f.fills = [paint("neutral/subtle")];
    f.appendChild(text(l, "Caption/Default", "text/muted"));
    f.appendChild(text(v, "Body/Strong"));
  });
  formCard(c, "Contact", null, [["Mobile", "+91 98110 23456", { state: "Filled", helper: "OTP for the member portal goes here" }], ["Email", "ramesh.gupta@email.com", { state: "Filled" }]]);
  formCard(c, "Address", null, [["House / street", "H.No. 147/2, Gali No. 5", { state: "Filled" }], ["Locality / village", "Mukund Pur", { state: "Filled" }], ["City", "Delhi", { state: "Filled" }], ["PIN code", "110042", { state: "Filled" }]]);
  formCard(c, "Nominee", null, [["Nominee name", "Kamla Gupta", { state: "Filled" }], ["Relation", "Wife", { state: "Filled" }]]);
  formCard(c, "Bank account", "For loan disbursals and withdrawals by transfer", [["Bank", "Punjab National Bank", { state: "Filled" }], ["IFSC", "PUNB0123400", { state: "Filled" }], ["Branch", "Badli", { state: "Filled" }], ["New account number", "On file: XXXX4590", { helper: "Leave blank to keep the account on file" }]]);
  const bar = add(c, card({ name: "Save bar", layoutMode: "HORIZONTAL", itemSpacing: 12, paddingLeft: 24, paddingRight: 24, paddingTop: 20, paddingBottom: 20, counterAxisAlignItems: "MAX" }), { fill: true });
  add(bar, input("Reason for change", "e.g. Member shifted house; new mobile number"), { fill: true });
  bar.appendChild(button("Cancel", "Secondary", null, "Large"));
  bar.appendChild(button("Save changes", "Primary", "save", "Large"));
});

section.resizeWithoutConstraints(100 + 3 * 1560, 100 + Math.ceil(slot / 3) * 1900);

// ───────────────────────── Prototype links ─────────────────────────
const existing = (name) => page.findOne((n) => n.type === "FRAME" && n.name === name);
const targets = {
  dashboard,
  members: existing("Members — List"),
  loans: frames.loans,
  deposits: frames.deposits,
  transactions: frames.transactions,
  reports: frames.reports,
  settings: frames.settings,
  help: frames.help,
};
const navTarget = (label) => {
  const l = label.toLowerCase();
  return Object.entries(targets).find(([k]) => l.startsWith(k === "help" ? "help" : k))?.[1];
};
const go = (dest) => [{ trigger: { type: "ON_CLICK" }, actions: [{ type: "NODE", destinationId: dest.id, navigation: "NAVIGATE", transition: null, resetScrollPosition: true }] }];

const staffFrames = [
  dashboard,
  ...["Members — List", "Members — Register New Member", "Member Profile — Overview", "Member Profile — Passbook"].map(existing),
  ...Object.values(frames),
].filter(Boolean);

let linked = 0;
for (const f of staffFrames) {
  for (const item of navInstances(f)) {
    const dest = navTarget(navLabel(item));
    if (dest && dest !== f) {
      await item.setReactionsAsync(go(dest));
      linked++;
    }
  }
}
// Primary actions → their screens
const buttonLinks = [
  [frames.loans, "New loan application", frames.loanNew],
  [frames.transactions, "Record payment", frames.payment],
  [frames.deposits, "Record deposit", frames.payment],
];
for (const [from, label, to] of buttonLinks) {
  const b = from.findAllWithCriteria({ types: ["INSTANCE"] }).find((i) => i.componentProperties["Label#2:0"]?.value === label);
  if (b) {
    await b.setReactionsAsync(go(to));
    linked++;
  }
}
// Back links
for (const [from, to] of [[frames.loanNew, frames.loans], [frames.payment, frames.transactions], [frames.memberEdit, existing("Member Profile — Overview")]]) {
  const back = from.findOne((n) => n.name === "Back link");
  if (back && to) {
    await back.setReactionsAsync(go(to));
    linked++;
  }
}
page.flowStartingPoints = [...page.flowStartingPoints.filter((p) => p.name !== "Staff console"), { nodeId: dashboard.id, name: "Staff console" }];

return {
  sectionId: section.id,
  frames: Object.fromEntries(Object.entries(frames).map(([k, f]) => [k, `${f.id} ${f.name} ${Math.round(f.width)}x${Math.round(f.height)}`])),
  linked,
  missingExisting: ["Members — List", "Member Profile — Overview"].filter((n) => !existing(n)),
};
