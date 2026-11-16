const navs = [
  ["overview", "◫", "Overview"],
  ["calendar", "▦", "Calendar"],
  ["tasks", "✓", "Tasks & priorities"],
  ["ideas", "✧", "Idea lab"],
  ["research", "▤", "Research & ASSSS"],
  ["content", "▣", "Content studio"],
  ["opportunities", "◎", "Opportunities"],
  ["people", "♡", "People & relationships"],
  ["work", "▥", "Institutions & finance"],
  ["publications", "↗", "Publications & website"],
  ["stationery", "▧", "Stationery Forge"],
  ["accounts", "⌑", "Account vault"],
];
const seed = {
  tasks: [
    {
      title: "Review the first ASSSS chapter",
      note: "My thinking",
      date: "Today",
      done: false,
    },
    {
      title: "Prepare Hub entrepreneurship lesson",
      note: "Teaching",
      date: "Monday",
      done: false,
    },
    {
      title: "Review weekly business cash position",
      note: "Financial oversight",
      date: "Friday",
      done: false,
    },
  ],
  ideas: [
    {
      title: "Family lineage platform",
      note: "Preserve histories with consent and privacy",
      stage: "Investigate",
    },
    {
      title: "Shifa AI safety research",
      note: "Explore evidence-based health information with clinical review",
      stage: "Research",
    },
  ],
  opportunities: [],
  people: [],
  content: [
    {
      title: "Before you solve it, understand it",
      note: "Opening introduction video",
      stage: "Script",
    },
    {
      title: "Busy does not mean progress",
      note: "Teaching video",
      stage: "Idea",
    },
  ],
  research: [
    {
      title: "ASSSS foundational framework",
      note: "Definitions, evidence and limitations",
      stage: "Draft",
    },
  ],
  publications: [],
  work: [],
};
const STORE = "hm_os_design_v1";
let data;
try {
  data = JSON.parse(localStorage.getItem(STORE)) || structuredClone(seed);
} catch {
  data = JSON.parse(JSON.stringify(seed));
}
Object.keys(seed).forEach((k) => {
  if (!Array.isArray(data[k])) data[k] = [];
});
const save = () => localStorage.setItem(STORE, JSON.stringify(data));
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const card = (title, body, action = "") =>
  `<div class="card"><div class="cardhead"><h3>${title}</h3>${action}</div>${body}</div>`;
const sampleNote =
  '<div class="notice">Connected local workspace. Starter entries are examples. Records stay in this browser; export backups regularly. Website previews do not publish online. Keep login and recovery details in the encrypted Account vault.</div>';
const stat = (num, name, detail) =>
  `<div class="stat"><div class="stat-label">${name}</div><div class="stat-number">${num}</div><div class="stat-detail">${detail}</div></div>`;
const taskItem = (t, i) =>
  `<div class="task"><input class="checkbox" type="checkbox" ${t.done ? "checked" : ""} onchange="data.tasks[${i}].done=this.checked;save();render()"><div class="task-main"><b style="${t.done ? "text-decoration:line-through;color:#aaa" : ""}">${esc(t.title)}</b><small>${esc(t.note || "Personal task")}</small></div><span class="tag">${esc(t.date || "No date")}</span><button class="link" onclick="editRecord('tasks',${i})">Edit</button>${t.applicationId ? `<a class="link" href="applications.html?id=${encodeURIComponent(t.applicationId)}">Application ↗</a>` : ""}${t.source ? `<button class="link" onclick="go('${t.source}')">Source ↗</button>` : ""}</div>`;
const rows = (key, headers) => {
  const items = data[key];
  return items.length
    ? `<div class="tablewrap"><table class="gridtable"><thead><tr><th>Title</th><th>Details</th><th>Status</th><th></th></tr></thead><tbody>${items.map((r, i) => `<tr><td>${esc(r.title)}</td><td>${esc(r.note || "—")}</td><td><span class="tag">${esc(r.stage || r.date || "Active")}</span></td><td><div class="rowactions"><button class="link" onclick="editRecord('${key}',${i})">Edit</button>${actions(key, i)}<button class="link" onclick="removeRecord('${key}',${i})">Remove</button></div></td></tr>`).join("")}</tbody></table></div>`
    : `<div class="empty"><strong>No records here yet.</strong><p>Add your first real entry when you're ready.</p><button class="btn primary" onclick="openModal('${key}')">+ Add record</button></div>`;
};
function sectionPage(key, kicker, title, description, cards) {
  return `<section class="page" id="page-${key}"><div class="headrow"><div><div class="eyebrow">${kicker}</div><h1 class="title">${title}</h1><p class="intro">${description}</p></div><button class="btn primary" onclick="openModal('${key}')">+ New ${key === "people" ? "contact" : key === "content" ? "content" : key === "publications" ? "publication" : "record"}</button></div>${cards ? `<div class="cards3" style="margin-bottom:22px">${cards.map((c) => `<div class="work-card"><div class="symbol">${c[0]}</div><h3>${c[1]}</h3><p>${c[2]}</p></div>`).join("")}</div>` : ""}${rows(key)}${sampleNote}</section>`;
}
const calendarDays = [
  [
    "Mon",
    "Hub teaching 10–2",
    "Research & opportunities",
    "Gym / football 4–6",
  ],
  ["Tue", "Hub teaching 10–2", "Read / connect", "Gym / football 4–6"],
  ["Wed", "Hub Arena 11–2", "Research review", "Gym / football 4–6"],
  [
    "Thu",
    "Business & RIDLI review",
    "Content session 8–10",
    "Gym / football 4–6",
  ],
  ["Fri", "Revenue + debt review", "Contact follow-ups", "Gym / football 4–6"],
  ["Sat", "Writing / content batch", "Visit people", "Gym / football 4–6"],
  [
    "Sun",
    "Family / faith / rest",
    "Weekly reflection",
    "New experience if planned",
  ],
];
function applicationCount() {
  try {
    const a = JSON.parse(localStorage.getItem("hm_applications_v1"));
    return Array.isArray(a) ? a.length : data.opportunities.length;
  } catch {
    return data.opportunities.length;
  }
}
function render() {
  document.querySelector("#nav").innerHTML = navs
    .map(
      (n, i) =>
        `${i === 0 || i === 3 || i === 6 ? `<div class="section-label">${i === 0 ? "My day" : i === 3 ? "Create & learn" : "Grow & lead"}</div>` : ""}<button class="navitem ${active === n[0] ? "active" : ""}" data-nav="${n[0]}" onclick="go('${n[0]}')"><span style="font-size:17px;width:17px;text-align:center">${n[1]}</span>${n[2]}${n[0] === "opportunities" && applicationCount() ? `<small>${applicationCount()}</small>` : ""}</button>`,
    )
    .join("");
  let pending = data.tasks.filter((t) => !t.done).length;
  const overview = `<section class="page" id="page-overview"><div class="headrow"><div><div class="eyebrow">Your day. Your direction.</div><h1 class="title">Good to have you here, hm.</h1><p class="intro">A quieter way to manage your life, thinking, institutions and relationships. Start with what matters most.</p></div><button class="btn primary" onclick="openModal('tasks')">+ Add a priority</button></div><div class="card hero-card"><div class="eyebrow">Today's guiding thought</div><h2>Make progress on what matters. Let the rest be organised.</h2><p>Protect your thinking time. Honour commitments. Build useful things. Leave room to live.</p><button class="btn" onclick="go('calendar')">See your week →</button></div><div class="statgrid">${stat(pending, "Open tasks", "Complete one priority at a time")}${stat(data.ideas.length, "Ideas captured", "Investigate before building")}${stat(applicationCount(), "Opportunities", "Track next actions and deadlines")}${stat(data.content.length, "Content items", "Publish only after approval")}</div><div class="layout"><div style="display:grid;gap:20px">${card("Your priorities", data.tasks.map(taskItem).join("") || '<p class="intro">Nothing scheduled yet.</p>', `<button class="link" onclick="go('tasks')">View all →</button>`)}${card(
    "Quick capture",
    `<div class="quickgrid">${[
      ["✧", "New idea", "ideas"],
      ["▣", "Content idea", "content"],
      ["◎", "Opportunity", "opportunities"],
      ["♡", "New person", "people"],
      ["▤", "Research note", "research"],
      ["✓", "New task", "tasks"],
    ]
      .map(
        (q) =>
          `<button class="quick" onclick="openModal('${q[2]}')"><span class="qicon">${q[0]}</span><b>${q[1]}</b><small>Save and develop →</small></button>`,
      )
      .join("")}</div>`,
  )}</div><div style="display:grid;gap:20px">${card("Today, with intention", `<div class="timeitem"><div class="hour">Morning</div><div class="timeline"></div><div><b>Solitude, reading & deep thinking</b><p>Protect time to learn and develop ASSSS.</p></div></div><div class="timeitem"><div class="hour">Mon–Wed</div><div class="timeline"></div><div><b>Hub: entrepreneurship & technology</b><p>Teach, mentor and listen to questions.</p></div></div><div class="timeitem"><div class="hour">4–6 PM</div><div class="timeline"></div><div><b>Gym or football</b><p>Personal health. Protected time.</p></div></div><div class="timeitem"><div class="hour">Evening</div><div class="timeline"></div><div><b>People and reflection</b><p>Family, gratitude, good conversations.</p></div></div>`, `<button class="link" onclick="go('calendar')">Calendar →</button>`)}${card("Remember", `<div style="color:#706053;font-size:13px;line-height:1.9">Not every idea must become a business.<br>Not every day needs a post.<br>Not every relationship needs an outcome.<br><br><b>Build a life worth experiencing.</b></div>`)}</div></div>${sampleNote}</section>`;
  const calendar = `<section class="page" id="page-calendar"><div class="headrow"><div><div class="eyebrow">A balanced life</div><h1 class="title">Your seven-day rhythm.</h1><p class="intro">A sample weekly structure that respects your Hub teaching, personal learning, relationships, finances and 4–6 PM exercise.</p></div><button class="btn" onclick="downloadCalendar()">↓ Export sample week</button></div><div class="weekgrid">${calendarDays.map((d) => `<div class="day"><b>${d[0]}</b><small> • weekly rhythm</small><div class="block">${d[1]}</div><div class="block blue">${d[2]}</div><div class="block green">${d[3]}</div></div>`).join("")}</div><div style="margin-top:20px" class="cards3"><div class="work-card"><div class="symbol">☀</div><h3>8–10 AM</h3><p>Solitude or your optional content production window. Choose intentionally.</p></div><div class="work-card"><div class="symbol">◷</div><h3>6–9 PM</h3><p>Alternative content window, not an extra obligation.</p></div><div class="work-card"><div class="symbol">♡</div><h3>Last weekend of month</h3><p>Try an affordable new experience or visit someone important.</p></div></div>${sampleNote}</section>`;
  const tasks = `<section class="page" id="page-tasks"><div class="headrow"><div><div class="eyebrow">Action before activity</div><h1 class="title">Tasks & priorities.</h1><p class="intro">Record commitments, choose three important outcomes for the day, and finish what you can.</p></div><button class="btn primary" onclick="openModal('tasks')">+ New task</button></div>${card("Your task list", data.tasks.map(taskItem).join("") || '<div class="empty">No tasks yet.</div>')}${sampleNote}</section>`;
  const pages = {
    overview,
    calendar,
    tasks,
    ideas: sectionPage(
      "ideas",
      "Observe · question · build",
      "Your idea lab.",
      "Catch ideas before they disappear. Investigate them before deciding to build.",
      [
        [
          "✧",
          "Capture a thought",
          "Save a problem, question, voice-note summary or invention.",
        ],
        ["⌕", "Investigate", "Who is affected? What evidence is available?"],
        [
          "→",
          "Develop or archive",
          "Choose what deserves action and what can wait.",
        ],
      ],
    ),
    research: sectionPage(
      "research",
      "Study · test · write",
      "Research & ASSSS.",
      "Build a thoughtful, evidence-backed body of knowledge around your five-stage philosophy.",
      [
        [
          "A",
          "Framework builder",
          "Definitions, sub-formulas, objections and applications.",
        ],
        [
          "▤",
          "Research papers",
          "Questions, sources, methods and working drafts.",
        ],
        [
          "▦",
          "Book studio",
          "Chapters, edits and citations for your future publications.",
        ],
      ],
    ),
    content: sectionPage(
      "content",
      "Create with intention",
      "Your content studio.",
      "Scripts, video ideas, carousels and publishing decisions. No mandatory posting streak.",
      [
        ["●", "Record", "Your actual stories and teaching insights."],
        [
          "▣",
          "Review & approve",
          "Idea → Script → Recorded → Edited → Approved.",
        ],
        [
          "↗",
          "Share when ready",
          "TikTok + Instagram; Facebook + LinkedIn; X reflections.",
        ],
      ],
    ),
    opportunities: sectionPage(
      "opportunities",
      "Go where you can contribute",
      "Opportunity desk.",
      "Track fellowships, grants, speaking, policy programmes and potential partnerships.",
      [
        ["◎", "Discover", "Find opportunities matched to your roles."],
        [
          "✓",
          "Check eligibility",
          "Know the criteria before writing an application.",
        ],
        [
          "↗",
          "Apply and follow up",
          "Track submissions, references and people.",
        ],
      ],
    ),
    people: sectionPage(
      "people",
      "Relationships are not transactions",
      "People who matter.",
      "Remember friends, family, mentors, event contacts and people who helped you along the way.",
      [
        ["♡", "Family and friends", "Check in simply because they matter."],
        ["✉", "New connections", "Follow up after events and meetings."],
        [
          "✧",
          "Gratitude",
          "Remember kindness, promises and shared experiences.",
        ],
      ],
    ),
    work: sectionPage(
      "work",
      "Lead without losing your day",
      "Institutions & finance.",
      "One leadership view for your companies, RIDLI, innovation projects and financial commitments.",
      [
        [
          "▥",
          "Holding overview",
          "Venture updates, decisions, revenue and risks.",
        ],
        ["◈", "RIDLI impact", "Scholarship and community programme evidence."],
        [
          "◷",
          "Cash & commitments",
          "Separate personal debt from institutional finances.",
        ],
      ],
    ),
    publications: sectionPage(
      "publications",
      "Write · review · publish",
      "Publications & website.",
      "Prepare public resources, essays, event records and research with a deliberate review step.",
      [
        [
          "▤",
          "Journal & books",
          "Write and prepare documents for public reading.",
        ],
        [
          "▣",
          "Professional record",
          "Roles, awards and event photos with evidence.",
        ],
        ["↗", "Website publishing", "Approval before anything becomes public."],
      ],
    ),
  };
  pages.stationery = `<section class="page" id="page-stationery"><div class="eyebrow">Your personal brand, ready to use</div><h1 class="title">Stationery Forge.</h1><p class="intro">Create a letter, document, flyer or carousel from a branded layout. Your cap-inspired signature is already included.</p><div class="cards3" style="margin-top:25px">${[
    ["letter", "Letters", "A4 correspondence with your details and signature."],
    ["document", "Documents", "Branded long-form documents, ready to print."],
    ["flyer", "Flyers & quotes", "Export social designs at 1080 × 1350."],
    ["carousel", "Carousels", "Create a series and export each slide."],
  ]
    .map(
      ([k, t, d]) =>
        `<div class="work-card"><h3>${t}</h3><p>${d}</p><a class="btn" href="forge.html?template=${k}">Create →</a></div>`,
    )
    .join(
      "",
    )}</div><div class="card" style="margin-top:20px"><h3>Your PDFs & original motif</h3><p>Book, essay, teaching guide and research concept in one place.</p><a class="btn primary" href="forge.html#assets">Open brand shelf →</a></div></section>`;
  pages.accounts = `<section class="page" id="page-accounts"><div class="eyebrow">Platforms & recovery</div><h1 class="title">Your account vault.</h1><p class="intro">Keep platform logins, recovery accounts, authenticator secrets and backup files, with a manual record of when and where you last logged in.</p><div class="card" style="margin-top:25px"><h3>Locked with your vault passphrase.</h3><p>Encrypted storage and encrypted backups inside hm OS. Records stay in this browser until you export or restore them.</p><a class="btn primary" href="vault.html">Open account vault →</a></div></section>`;
  pages.opportunities = `<section class="page" id="page-opportunities"><div class="eyebrow">Discovery to outcome</div><h1 class="title">Applications & opportunities.</h1><p class="intro">Track fit, preparation, submission, follow-up, interviews, shortlisting and winning. Keep required documents, next actions and dated stage history together.</p><div class="card" style="margin-top:25px"><h3>One record for the full journey.</h3><p>Your existing opportunity entries are brought into the tracker when you open it.</p><a class="btn primary" href="applications.html">Open application tracker →</a></div></section>`;
  document.getElementById("pages").innerHTML = Object.values(pages).join("");
  document.getElementById("page-" + active).classList.add("active");
}
let active = "overview";
function go(k) {
  if (!navs.some((n) => n[0] === k)) k = "overview";
  active = k;
  history.replaceState(null, "", "#" + k);
  render();
  document.getElementById("crumb").textContent = navs.find(
    (n) => n[0] === k,
  )[2];
  document.querySelector("#sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function removeRecord(k, i) {
  if (confirm("Remove this record from this browser?")) {
    data[k].splice(i, 1);
    save();
    render();
  }
}
let modalKey = "tasks",
  editIndex = null;
function openModal(key) {
  if (key === "opportunities") {
    location.href = "applications.html";
    return;
  }
  editIndex = null;
  modalKey = key;
  const names = {
    tasks: "task",
    ideas: "idea",
    research: "research note",
    content: "content item",
    opportunities: "opportunity",
    people: "contact",
    work: "leadership record",
    publications: "publication",
  };
  document.getElementById("modalTitle").textContent =
    "New " + (names[key] || "record");
  document.getElementById("modalHint").textContent =
    "Save locally, then use the next-step actions to connect your work.";
  document.getElementById("entryForm").innerHTML =
    `<label>Title</label><input name="title" required maxlength="160" placeholder="What do you want to remember?"><label>Notes</label><textarea name="note" placeholder="A short description, outcome or next step"></textarea><label>${key === "tasks" ? "When" : "Status or stage"}</label><input name="stage" placeholder="${key === "tasks" ? "Today, Friday, next week..." : "Idea, researching, draft, approved..."}"><div class="modaltools"><button type="button" class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" type="submit">Save record</button></div>`;
  document.getElementById("modal").classList.add("show");
  document.querySelector("#entryForm input").focus();
}
function closeModal() {
  document.getElementById("modal").classList.remove("show");
}
document.getElementById("entryForm").onsubmit = (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  let item = {
    title: String(f.get("title")).trim(),
    note: String(f.get("note")).trim(),
  };
  if (!item.title) return;
  if (modalKey === "tasks") {
    item.date = String(f.get("stage")).trim() || "Flexible";
    item.done = false;
  } else item.stage = String(f.get("stage")).trim() || "New";
  if (editIndex !== null) {
    item = { ...data[modalKey][editIndex], ...item };
    if (modalKey === "tasks") item.done = data[modalKey][editIndex].done;
    data[modalKey][editIndex] = item;
  } else {
    item.id = uid();
    data[modalKey].unshift(item);
  }
  save();
  closeModal();
  go(modalKey);
};
document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
function downloadCalendar() {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//hm OS//Demo Week//EN",
  ];
  const days = [
    "20261109",
    "20261110",
    "20261111",
    "20261112",
    "20261113",
    "20261114",
    "20261115",
  ];
  days.forEach((date, i) => {
    if (i < 6) {
      lines.push(
        "BEGIN:VEVENT",
        `UID:hmos-exercise-${i}@local`,
        `DTSTART;TZID=Africa/Lagos:${date}T160000`,
        `DTEND;TZID=Africa/Lagos:${date}T180000`,
        "SUMMARY:Gym or football",
        "END:VEVENT",
      );
    }
    if (i < 3) {
      lines.push(
        "BEGIN:VEVENT",
        `UID:hmos-hub-${i}@local`,
        `DTSTART;TZID=Africa/Lagos:${date}T100000`,
        `DTEND;TZID=Africa/Lagos:${date}T140000`,
        "SUMMARY:Hub entrepreneurship and technology teaching (verify timetable)",
        "END:VEVENT",
      );
    }
  });
  lines.push("END:VCALENDAR");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([lines.join("\r\n")], { type: "text/calendar" }),
  );
  a.download = "hm-os-example-week.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}
function uid() {
  return (
    "hm-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2)
  );
}
function initialise() {
  Object.values(data).forEach((a) =>
    a.forEach((x) => {
      if (!x.id) x.id = uid();
    }),
  );
  if (!localStorage.getItem("hm_migrated")) {
    try {
      const old = JSON.parse(localStorage.getItem("hm_os_preview_v1") || "{}");
      Object.entries({
        tasks: "tasks",
        ideas: "ideas",
        writing: "research",
        content: "content",
        opportunities: "opportunities",
        engagements: "publications",
      }).forEach(([a, b]) =>
        (old[a] || []).forEach((x) => {
          if (!data[b].some((y) => y.title === x.title))
            data[b].push({
              id: uid(),
              title: x.title,
              note: x.detail || "",
              stage: x.status || "Draft",
              date: x.date || "",
              done: false,
            });
        }),
      );
      localStorage.setItem("hm_migrated", "1");
    } catch (e) {}
  }
  save();
}
function editRecord(k, i) {
  openModal(k);
  editIndex = i;
  const x = data[k][i],
    f = document.getElementById("entryForm");
  document.getElementById("modalTitle").textContent = "Edit record";
  f.elements.title.value = x.title;
  f.elements.note.value = x.note || "";
  f.elements.stage.value = k === "tasks" ? x.date || "" : x.stage || "";
}
function actions(k, i) {
  let a = "";
  if (k !== "publications")
    a += `<button class="link" onclick="connect('${k}',${i},'tasks')">Create task →</button>`;
  const next = {
    ideas: "research",
    research: "content",
    content: "publications",
  };
  if (next[k])
    a += `<button class="link" onclick="connect('${k}',${i},'${next[k]}')">${{ ideas: "Develop research", research: "Create content", content: "Prepare publication" }[k]} →</button>`;
  if (k === "publications")
    a += `<button class="link" onclick="preview(${i})">Preview on website ↗</button>`;
  return a;
}
function connect(k, i, target) {
  const x = data[k][i];
  if (!data[target].some((y) => y.sourceId === x.id)) {
    data[target].unshift({
      id: uid(),
      title: (target === "tasks" ? "Next step: " : "") + x.title,
      note: x.note || "",
      source: k,
      sourceId: x.id,
      stage: "Draft",
      date: "Flexible",
      done: false,
    });
    save();
  }
  go(target);
}
function preview(i) {
  const x = data.publications[i];
  if ((x.stage || "").toLowerCase() !== "approved") {
    alert(
      "Review this publication and set its status to Approved before previewing.",
    );
    return;
  }
  sessionStorage.setItem(
    "hm_website_preview",
    JSON.stringify({ title: x.title, note: x.note }),
  );
  location.href = "../?workspace-preview=1#workspace-preview";
}
function exportWorkspace() {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob(
      [
        JSON.stringify(
          {
            version: 2,
            data,
            stationery: JSON.parse(
              localStorage.getItem("hm_stationery_forge_v1") || "[]",
            ),
            applications: JSON.parse(
              localStorage.getItem("hm_applications_v1") || "[]",
            ),
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    ),
  );
  a.download = "hm-os-backup.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
async function importWorkspace(input) {
  try {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 5000000) throw Error();
    const p = JSON.parse(await file.text()),
      inc = p.data || p;
    if (!Object.keys(seed).some((k) => Array.isArray(inc[k]))) throw Error();
    let n = 0;
    Object.keys(seed).forEach((k) =>
      (Array.isArray(inc[k]) ? inc[k] : []).forEach((x) => {
        if (
          !x ||
          typeof x.title !== "string" ||
          data[k].some((y) => (x.id ? x.id === y.id : x.title === y.title))
        )
          return;
        data[k].push({
          id: typeof x.id === "string" ? x.id : uid(),
          title: x.title.slice(0, 160),
          note: String(x.note || x.detail || ""),
          stage: String(x.stage || x.status || "Draft"),
          date: String(x.date || ""),
          done: x.done === true,
        });
        n++;
      }),
    );
    for (const [field, key] of [
      ["stationery", "hm_stationery_forge_v1"],
      ["applications", "hm_applications_v1"],
    ]) {
      if (Array.isArray(p[field])) {
        let existing = JSON.parse(localStorage.getItem(key) || "[]");
        for (const x of p[field])
          if (
            x &&
            typeof x.id === "string" &&
            !existing.some((y) => y.id === x.id)
          ) {
            existing.push(x);
            n++;
          }
        localStorage.setItem(key, JSON.stringify(existing));
      }
    }
    save();
    render();
    alert(n + " records imported. Existing records kept.");
  } catch (e) {
    alert("Please choose a valid hm OS JSON backup.");
  }
  input.value = "";
}
initialise();
go(location.hash.slice(1) || "overview");
