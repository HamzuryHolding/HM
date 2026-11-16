const $ = (id) => document.getElementById(id);
const KEY = "hm_os_preview_v1";
let state = {
  tasks: [],
  ideas: [],
  writing: [],
  opportunities: [],
  engagements: [],
  content: [],
};
try {
  state = { ...state, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
} catch (e) {}
const persist = () => localStorage.setItem(KEY, JSON.stringify(state));
const escapeHTML = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function openAdmin() {
  document.body.querySelector("main").style.display = "none";
  $("publicHeader").style.display = "none";
  $("publicFooter").style.display = "none";
  $("admin").classList.add("active");
  render("dashboard");
  window.scrollTo(0, 0);
}
function closeAdmin() {
  $("admin").classList.remove("active");
  document.body.querySelector("main").style.display = "";
  $("publicHeader").style.display = "";
  $("publicFooter").style.display = "";
  window.scrollTo(0, 0);
}
function render(tab) {
  document
    .querySelectorAll(".admin-side button")
    .forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  let h = "";
  if (tab === "dashboard") {
    h = `<div class="admcard"><h2>Good morning, hm.</h2><p>Your ideas, commitments and public work in one calm workspace.</p><div class="notice"><b>Local prototype only.</b> Information entered here stays in this browser. This is not a secure account or a synced production admin. Do not enter passwords, personal client records, or other sensitive information.</div></div><div class="admcard"><h2>Your overview</h2><p>${state.tasks.length} tasks · ${state.ideas.length} ideas · ${state.writing.length} writing pieces · ${state.opportunities.length} opportunities · ${state.engagements.length} engagements · ${state.content.length} content ideas</p></div><div class="admcard"><h2>Today’s focus</h2><p>Communication practice · ASSSS research · opportunity review · X engagement · leadership · gym/football 4–6 PM. Content creation only 8–10 AM or 6–9 PM, optional</p></div>`;
  } else {
    const cfg = {
      tasks: ["Task", "Next action"],
      ideas: ["Idea", "Problem, hypothesis or next experiment"],
      writing: ["Writing & publications", "Abstract, notes or draft"],
      opportunities: ["Opportunity", "Eligibility, deadline and next step"],
      content: [
        "Content studio",
        "Hook, script, shooting notes, editing and proposed posting; publish only after review",
      ],
      engagements: [
        "Professional record",
        "Role, award or event; attach evidence in the production system",
      ],
    };
    const [title, placeholder] = cfg[tab];
    h = `<div class="admcard"><h2>${title}</h2><label>Title<input id="entryTitle" placeholder="Give this record a clear title"></label><label>Details<textarea id="entryDetail" rows="4" placeholder="${placeholder}"></textarea></label>${tab === "content" ? '<div class="scheduler-note">Record, edit and schedule only in the 8–10 AM or 6–9 PM windows. If no content was prepared, skip publishing. This local demo does not post to social media.</div>' : ""}${tab === "writing" ? '<label>Status<select id="entryStatus"><option>Draft</option><option>In review</option><option>Ready for publication</option></select></label>' : ""}<button class="action" onclick="saveEntry('${tab}')">Save private record</button></div><div class="admcard"><h2>Saved records</h2>${state[tab].length ? state[tab].map((x, i) => `<div class="item"><strong>${escapeHTML(x.title)}</strong><small>${escapeHTML(x.date)}${x.status ? " · " + escapeHTML(x.status) : ""}</small><p>${escapeHTML(x.detail)}</p><button onclick="removeEntry('${tab}',${i})">Remove</button></div>`).join("") : "<p>No records yet. Your workspace starts empty.</p>"}</div>`;
  }
  $("adminBody").innerHTML = h;
}
function saveEntry(t) {
  let title = $("entryTitle").value.trim(),
    detail = $("entryDetail").value.trim();
  if (!title) {
    alert("Please enter a title.");
    return;
  }
  state[t].unshift({
    title,
    detail,
    date: new Date().toLocaleDateString(),
    status: t === "writing" ? $("entryStatus").value : "",
  });
  persist();
  render(t);
}
function removeEntry(t, i) {
  if (confirm("Remove this record from this browser?")) {
    state[t].splice(i, 1);
    persist();
    render(t);
  }
}
function exportRecords() {
  const a = document.createElement("a"),
    b = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
  a.href = URL.createObjectURL(b);
  a.download = "hm-os-local-preview-export.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function openDiscovery() {
  $("discovery").classList.add("open");
  $("discoveryStep").innerHTML =
    '<h2>What challenge are you facing?</h2><label>Choose a starting point<select id="challenge"><option>Business or organisation</option><option>Learning or career</option><option>Technology or systems</option><option>Community project</option><option>Other</option></select></label><button class="btn" onclick="discoveryNext()">Continue</button>';
}
function discoveryNext() {
  const c = $("challenge").value;
  $("discoveryStep").innerHTML =
    `<h2>Let's understand the situation.</h2><p>Starting point: ${escapeHTML(c)}</p><label>What is happening?<textarea id="problem" rows="4" class="formfield" placeholder="Describe the situation without sharing confidential information"></textarea></label><button class="btn" onclick="downloadBrief()">Create my starting brief</button>`;
  window.chosenChallenge = c;
}
function downloadBrief() {
  const prob = $("problem").value.trim();
  if (!prob) {
    alert("Please describe the challenge");
    return;
  }
  const body = [
    "hm hamzury — ASSSS Starting Brief",
    "",
    "Challenge area: " + window.chosenChallenge,
    "What you described: " + prob,
    "",
    "A — Awareness: What evidence confirms the problem?",
    "S — Strategy: What options are available?",
    "S — Structure: Which people and resources are needed?",
    "S — Systems: What process can you test?",
    "S — Success: How will you measure a change?",
    "",
    "This is a self-guided starting worksheet, not individually reviewed advice.",
    "Contact: hm@hamzury.com",
  ];
  const w = window.open("", "_blank");
  if (!w) {
    alert("Allow a new tab to print your brief.");
    return;
  }
  w.document.write(
    '<html><head><title>ASSSS Starting Brief</title><style>.page-hero{padding:80px 0 45px}.page-hero h1{font:500 clamp(42px,6vw,76px)/1.13 Manrope,sans-serif;letter-spacing:-3px;max-width:900px;margin:22px 0}.page-hero p{max-width:760px;line-height:1.85;color:#c7b4a2}.detail{padding:34px;border:1px solid #795b4070;margin:20px 0;background:#41261b}.detail p,.detail li{font-size:15px;line-height:1.85;color:#d0bcab}.detail h2{font:500 30px Manrope;margin:10px 0}.metric{font:500 clamp(64px,9vw,110px) Manrope;letter-spacing:-5px;color:#c9a66c}.page-nav{display:flex;gap:18px;flex-wrap:wrap;font-size:12px}.book-cover{background:#e8dac1;color:#29150e;min-height:380px;padding:45px;display:flex;flex-direction:column;justify-content:space-between;border:12px solid #41261b}.book-cover h2{font:500 48px/1.1 Manrope;letter-spacing:-2px}.portrait-roles{display:block!important}.portrait-roles strong{display:block;font:500 23px Manrope}.portrait-roles p{font-size:12px!important;line-height:1.8!important;margin:10px 0}.hero-portrait{animation:portraitDrift 12s ease-in-out infinite}@keyframes portraitDrift{0%,100%{transform:rotate(1deg) translateY(0)}50%{transform:rotate(0deg) translateY(-5px)}}@media(prefers-reduced-motion:reduce){.hero-portrait{animation:none}}.project-image{width:100%;height:200px;object-fit:cover;margin-bottom:15px}@media(max-width:600px){.detail{padding:24px}.page-hero{padding-top:50px}.page-hero h1{letter-spacing:-2px}}</style><style>.hm-signature{display:block;width:min(420px,75%);height:auto;margin:30px auto 5px;filter:invert(1);mix-blend-mode:screen;opacity:.5}</style></head><body style="font:16px/1.7 Arial;max-width:760px;margin:55px auto;padding:20px">' +
      body.map((line) => "<p>" + escapeHTML(line) + "</p>").join("") +
      '<button onclick="window.print()">Print / Save as PDF</button></bo' +
      "dy></html>",
  );
  w.document.close();
  $("discovery").classList.remove("open");
}
function openLogin() {
  location.href = "os/";
}
function openDemo() {
  $("login").classList.remove("open");
  openAdmin();
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape")
    document
      .querySelectorAll(".modal")
      .forEach((m) => m.classList.remove("open"));
});
