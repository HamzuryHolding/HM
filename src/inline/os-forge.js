const KEY = "hm_stationery_forge_v1",
  $ = (id) => document.getElementById(id),
  fields = [
    "kind",
    "name",
    "author",
    "contact",
    "date",
    "reference",
    "recipient",
    "title",
    "body",
    "theme",
  ];
let drafts = [],
  id = null,
  slide = 0,
  ok = true;
try {
  drafts = JSON.parse(localStorage.getItem(KEY) || "[]");
  if (!Array.isArray(drafts)) drafts = [];
} catch {}
const motif = new Image();
motif.src = "../assets/brand/signage.webp";
motif.onload = render;
const d = new Date();
$("date").value = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);
const esc = (s) =>
  String(s || "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function msg(s) {
  $("status").textContent = s;
}
function val() {
  return Object.fromEntries(fields.map((k) => [k, $(k).value]));
}
function view(k) {
  ["create", "saved", "assets"].forEach((x) => ($(x).hidden = x !== k));
  if (k === "saved") list();
}
$("createTab").onclick = () => view("create");
$("savedTab").onclick = () => view("saved");
$("assetsTab").onclick = () => view("assets");
function doc(v) {
  const src = new URL("../assets/brand/signage.webp", location.href).href;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(v.name)}</title><style>@page{size:A4;margin:20mm}body{color:#35271e;font:11pt/1.7 Georgia;margin:0}.sheet{padding:30px;max-width:720px;margin:auto}header{border-bottom:1px solid #c9a66c;padding-bottom:14px;display:flex;justify-content:space-between;gap:20px}header b{font:700 25px Arial}small{font:9pt Arial;color:#876e50}.motif{width:100%;height:60px;object-fit:contain;mix-blend-mode:multiply;opacity:.65}h1{font:normal 24pt/1.3 Georgia;break-after:avoid}.body p,.recipient{white-space:pre-wrap;orphans:3;widows:3}.signature{break-inside:avoid;margin-top:30px}footer{break-inside:avoid;margin-top:40px}footer .motif{height:40px}@media print{.sheet{padding:0}body{print-color-adjust:exact}}</style></head><body><div class="sheet"><header><b>hm hamzury</b><small>${esc(v.contact)}</small></header><img class="motif" src="${src}" alt=""><p><small>${esc(v.date)}${v.reference ? " · Ref: " + esc(v.reference) : ""}</small></p><div class="recipient">${esc(v.recipient)}</div><h1>${esc(v.title)}</h1><div class="body">${v.body
    .split(/\n\s*\n/)
    .map((x) => "<p>" + esc(x) + "</p>")
    .join(
      "",
    )}</div><div class="signature"><b>${esc(v.author)}</b><br><small>hm hamzury</small></div><footer><img class="motif" src="${src}" alt=""><p style="text-align:center"><small>Awareness · Strategy · Structure · Systems · Success</small></p></footer></div></bo${"dy"}></html>`;
}
function lines(c, t, w) {
  const all = [];
  String(t)
    .split("\n")
    .forEach((p) => {
      let line = "";
      for (const word of p.split(/\s+/)) {
        if (c.measureText(word).width > w) {
          if (line) all.push(line);
          line = "";
          for (const ch of word) {
            if (c.measureText(line + ch).width > w) {
              all.push(line);
              line = ch;
            } else line += ch;
          }
          continue;
        }
        const trial = line ? line + " " + word : word;
        if (c.measureText(trial).width > w && line) {
          all.push(line);
          line = word;
        } else line = trial;
      }
      all.push(line);
    });
  return all;
}
function fit(c, t, max, min, h, f) {
  for (let size = max; size >= min; size -= 2) {
    c.font = size + "px " + f;
    const a = lines(c, t, 900);
    if (a.length * size * 1.35 <= h) return { a, size };
  }
  return { a: lines(c, t, 900), size: min, overflow: true };
}
function render() {
  const v = val(),
    social = ["flyer", "carousel"].includes(v.kind),
    carousel = v.kind === "carousel";
  $("paper").hidden = social;
  $("social").hidden = !social;
  $("print").hidden = social;
  $("png").hidden = !social;
  $("prev").hidden = $("next").hidden = !carousel;
  $("letterFields").hidden = social;
  $("hint").textContent = carousel
    ? "Separate slides with --- on its own line. The headline repeats across slides."
    : social
      ? "Keep the message concise. The layout fits the text and flags overflow."
      : "Write the full text. Blank lines create paragraphs.";
  if (!social) {
    $("paper").srcdoc = doc(v);
    $("count").textContent = "";
    $("exportHint").textContent =
      "Choose A4 and disable browser headers and footers in the print dialog. Long documents flow onto additional pages.";
    return;
  }
  const pages = carousel ? v.body.split(/\n\s*---\s*\n/) : [v.body];
  slide = Math.max(0, Math.min(slide, pages.length - 1));
  $("count").textContent = carousel ? slide + 1 + " / " + pages.length : "";
  const c = $("social").getContext("2d"),
    dark = v.theme === "dark";
  c.fillStyle = dark ? "#29150e" : "#f7f2e9";
  c.fillRect(0, 0, 1080, 1350);
  c.fillStyle = dark ? "#c9a66c" : "#876e50";
  c.font = "24px Arial";
  c.fillText("hm hamzury", 90, 95);
  if (carousel) c.fillText(slide + 1 + " / " + pages.length, 920, 95);
  const t = fit(c, v.title, 66, 30, 220, "Georgia"),
    b = fit(c, pages[slide], 50, 26, 580, "Arial");
  c.fillStyle = dark ? "#ecdec3" : "#29150e";
  c.font = t.size + "px Georgia";
  t.a.forEach((s, i) => c.fillText(s, 90, 230 + i * t.size * 1.35));
  c.font = b.size + "px Arial";
  b.a.forEach((s, i) => c.fillText(s, 90, 500 + i * b.size * 1.35));
  c.fillStyle = dark ? "#c9a66c" : "#876e50";
  c.fillRect(90, 1135, 80, 2);
  c.font = "27px Arial";
  c.fillText(v.author, 90, 1190);
  c.font = "19px Arial";
  c.fillText(v.contact, 90, 1225);
  if (motif.complete && motif.naturalWidth) {
    c.save();
    c.globalCompositeOperation = dark ? "screen" : "multiply";
    c.filter = dark ? "invert(1)" : "none";
    c.globalAlpha = 0.6;
    c.drawImage(motif, 260, 1240, 560, 136);
    c.restore();
  }
  ok = !t.overflow && !b.overflow;
  $("png").disabled = !ok;
  $("exportHint").textContent = ok
    ? "Export at 1080 × 1350. Carousel slides download individually."
    : "This text is too long. Shorten it or add another slide before export.";
  $("social").setAttribute("aria-label", v.title + ". " + pages[slide]);
}
fields.forEach((k) => ($(k).oninput = render));
$("kind").onchange = () => {
  slide = 0;
  render();
};
$("prev").onclick = () => {
  slide--;
  render();
};
$("next").onclick = () => {
  slide++;
  render();
};
function download(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
$("print").onclick = () => {
  $("paper").contentWindow.focus();
  $("paper").contentWindow.print();
};
$("png").onclick = () => {
  if (ok)
    $("social").toBlob((b) => {
      if (b)
        download(
          b,
          ($("name").value || "hm-design").replace(/[^a-z0-9-]/gi, "-") +
            "-" +
            (slide + 1) +
            ".png",
        );
    });
};
$("form").onsubmit = (e) => {
  e.preventDefault();
  const r = {
    ...val(),
    id: id || "hm-" + Date.now().toString(36),
    updated: new Date().toISOString(),
  };
  const next = [r, ...drafts.filter((x) => x.id !== r.id)];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    drafts = next;
    id = r.id;
    msg("Draft saved. Reopen it under Saved drafts.");
  } catch {
    msg("Could not save. Export your drafts before closing.");
  }
};
$("new").onclick = () => {
  if (
    !confirm("Start fresh and clear unsaved changes? Saved drafts will remain.")
  )
    return;
  id = null;
  slide = 0;
  $("name").value = "Untitled stationery";
  $("title").value = "";
  $("body").value = "";
  $("recipient").value = "";
  $("reference").value = "";
  render();
};
function list() {
  $("drafts").textContent = "";
  for (const r of drafts) {
    const row = document.createElement("div");
    row.className = "item";
    const title = document.createElement("strong"),
      open = document.createElement("button"),
      duplicate = document.createElement("button");
    title.textContent = r.name;
    function load(copy) {
      fields.forEach((k) => ($(k).value = r[k] || ""));
      id = copy ? null : r.id;
      if (copy) $("name").value = r.name + " copy";
      slide = 0;
      view("create");
      render();
    }
    open.textContent = "Open";
    open.onclick = () => load(false);
    duplicate.textContent = "Duplicate";
    duplicate.onclick = () => load(true);
    row.append(title, open, duplicate);
    $("drafts").append(row);
  }
  if (!drafts.length) $("drafts").textContent = "No saved drafts yet.";
}
$("backup").onclick = () =>
  download(
    new Blob([JSON.stringify({ version: 1, drafts }, null, 2)], {
      type: "application/json",
    }),
    "hm-stationery-backup.json",
  );
$("restore").onclick = () => $("importFile").click();
$("importFile").onchange = async (e) => {
  try {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5000000) throw Error();
    const p = JSON.parse(await f.text());
    if (!Array.isArray(p.drafts)) throw Error();
    const next = [...drafts];
    let n = 0;
    for (const r of p.drafts) {
      if (
        !r ||
        typeof r.id !== "string" ||
        !["letter", "document", "flyer", "carousel"].includes(r.kind) ||
        next.some((x) => x.id === r.id)
      )
        continue;
      const x = { id: r.id, updated: String(r.updated || "") };
      fields.forEach((k) => (x[k] = String(r[k] || "")));
      next.push(x);
      n++;
    }
    localStorage.setItem(KEY, JSON.stringify(next));
    drafts = next;
    list();
    msg(n + " drafts imported. Existing drafts kept.");
  } catch {
    msg("Choose a valid stationery backup.");
  }
  e.target.value = "";
};
const assets = [
  [
    "Complete ASSSS book",
    "40 pages · In review",
    "ASSSS_From_Questions_to_Useful_Action_In_Review.pdf",
  ],
  ["Introductory essay", "Before We Solve It", "assss-essay.pdf"],
  ["Teaching guide", "Classroom activities", "assss-teaching-guide.pdf"],
  ["Research concept", "Proposed study", "assss-research-concept.pdf"],
];
$("resources").innerHTML = assets
  .map(
    ([t, n, f]) =>
      '<article class="card"><h3>' +
      t +
      "</h3><p>" +
      n +
      '</p><a href="../downloads/' +
      f +
      '" target="_blank" rel="noopener">Open PDF ↗</a> · <a href="../downloads/' +
      f +
      '" download>Download ↓</a></article>',
  )
  .join("");
const requested = new URLSearchParams(location.search).get("template");
if (["letter", "document", "flyer", "carousel"].includes(requested))
  $("kind").value = requested;
if (["flyer", "carousel"].includes(requested)) {
  $("name").value =
    requested === "flyer" ? "A useful question" : "From question to action";
  $("title").value = "Start with a better question.";
  $("body").value =
    requested === "flyer"
      ? "Understanding the problem is the beginning of useful action."
      : "What are we trying to understand?\n---\nWho is affected, and what can we learn from them?\n---\nWhat useful step can we take next?";
}
if (location.hash === "#assets") view("assets");
render();
