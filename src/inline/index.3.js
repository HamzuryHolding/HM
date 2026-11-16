const moments = [
  {
    key: "speaking",
    category: "Speaking",
    title: "Sharing ideas, starting conversations.",
    description:
      "Photographs from my personal archive. Event names, dates and individual stories will be added as the collection is documented.",
    image: "assets/moments/moment-10.jpg",
    photos: [
      "assets/moments/moment-10.jpg",
      "assets/moments/moment-07.jpg",
      "assets/moments/moment-31.jpg",
      "assets/moments/moment-43.jpg",
      "assets/moments/moment-44.jpg",
      "assets/moments/moment-20.jpg",
    ],
    number: "01",
  },
  {
    key: "governance",
    category: "Policy & governance",
    title: "In the room, in the conversation.",
    description:
      "Photographs from my personal archive. Event names, dates and individual stories will be added as the collection is documented.",
    image: "assets/moments/moment-22.jpg",
    photos: [
      "assets/moments/moment-22.jpg",
      "assets/moments/moment-23.jpg",
      "assets/moments/moment-24.jpg",
      "assets/moments/moment-25.jpg",
      "assets/moments/moment-05.jpg",
      "assets/moments/moment-06.jpg",
      "assets/moments/moment-14.jpg",
      "assets/moments/moment-19.jpg",
      "assets/moments/moment-27.jpg",
      "assets/moments/moment-28.jpg",
      "assets/moments/moment-29.jpg",
      "assets/moments/moment-32.jpg",
      "assets/moments/moment-33.jpg",
      "assets/moments/moment-34.jpg",
    ],
    number: "02",
  },
  {
    key: "community",
    category: "Teaching & community",
    title: "Learning and building together.",
    description:
      "Photographs from my personal archive. Event names, dates and individual stories will be added as the collection is documented.",
    image: "assets/moments/moment-41.jpg",
    photos: [
      "assets/moments/moment-41.jpg",
      "assets/moments/moment-11.jpg",
      "assets/moments/moment-12.jpg",
      "assets/moments/moment-18.jpg",
      "assets/moments/moment-30.jpg",
      "assets/moments/moment-36.jpg",
      "assets/moments/moment-37.jpg",
      "assets/moments/moment-39.jpg",
      "assets/moments/moment-40.jpg",
      "assets/moments/moment-45.jpg",
      "assets/moments/moment-46.jpg",
      "assets/moments/moment-47.jpg",
    ],
    number: "03",
  },
  {
    key: "recognition",
    category: "Recognition",
    title: "Celebrating progress together.",
    description:
      "Photographs from my personal archive. Event names, dates and individual stories will be added as the collection is documented.",
    image: "assets/moments/moment-03.jpg",
    photos: [
      "assets/moments/moment-03.jpg",
      "assets/moments/moment-04.jpg",
      "assets/moments/moment-08.jpg",
      "assets/moments/moment-09.jpg",
      "assets/moments/moment-13.jpg",
      "assets/moments/moment-15.jpg",
    ],
    number: "04",
  },
  {
    key: "life",
    category: "Life & people",
    title: "The moments between the work.",
    description:
      "Photographs from my personal archive. Event names, dates and individual stories will be added as the collection is documented.",
    image: "assets/moments/moment-16.jpg",
    photos: [
      "assets/moments/moment-16.jpg",
      "assets/moments/moment-17.jpg",
      "assets/moments/moment-38.jpg",
      "assets/moments/moment-01.jpg",
    ],
    number: "05",
  },
  {
    key: "research",
    category: "Research & ideas",
    title: "From a question to useful work.",
    description:
      "Photographs from my personal archive. Event names, dates and individual stories will be added as the collection is documented.",
    image: "assets/moments/moment-00.jpg",
    photos: ["assets/moments/moment-00.jpg", "assets/moments/moment-42.jpg"],
    number: "06",
  },
];
let momentIndex = 0,
  photoIndex = 0;
const momentDialog = document.getElementById("momentDialog");
function openMoment(i) {
  momentIndex = (i + moments.length) % moments.length;
  photoIndex = 0;
  renderMoment();
  if (!momentDialog.open) momentDialog.showModal();
}
function showMomentPhoto(i) {
  const m = moments[momentIndex];
  photoIndex = (i + m.photos.length) % m.photos.length;
  renderMoment();
}
function renderMoment() {
  const m = moments[momentIndex];
  document.getElementById("momentDetail").innerHTML =
    `<div class="moment-photos"><a href="${m.photos[photoIndex]}" target="_blank" rel="noopener" aria-label="Open photograph full size"><img class="active-photo" src="${m.photos[photoIndex]}" alt="${m.category}: archive photograph ${photoIndex + 1}"></a><div class="photo-controls"><button onclick="showMomentPhoto(photoIndex-1)" aria-label="Previous photograph">←</button><span>${photoIndex + 1} / ${m.photos.length}</span><button onclick="showMomentPhoto(photoIndex+1)" aria-label="Next photograph">→</button></div><div class="photo-thumbs">${m.photos.map((src, i) => `<button onclick="showMomentPhoto(${i})" aria-label="Photograph ${i + 1}" aria-pressed="${i === photoIndex}"><img src="${src}" alt="" loading="lazy"></button>`).join("")}</div></div><div class="moment-story"><span class="eyebrow">${m.number} / ${m.category}</span><h2>${m.title}</h2><p>${m.description}</p><p>${m.photos.length} photographs in this collection.</p><dl class="moment-meta"><div><dt>Event & location</dt><dd>Details being curated</dd></div><div><dt>Date & role</dt><dd>Details being curated</dd></div></dl><div class="moment-pager"><button onclick="openMoment(momentIndex-1)">← Collection</button><button onclick="openMoment(momentIndex+1)">Collection →</button></div></div>`;
}
momentDialog.addEventListener("click", (e) => {
  if (e.target === momentDialog) momentDialog.close();
});
momentDialog.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") showMomentPhoto(photoIndex + 1);
  if (e.key === "ArrowLeft") showMomentPhoto(photoIndex - 1);
});
document.querySelectorAll("[data-filter]").forEach((b) =>
  b.addEventListener("click", () => {
    const key = b.dataset.filter;
    document
      .querySelectorAll("[data-filter]")
      .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    let count = 0;
    document.querySelectorAll(".moment-card").forEach((c) => {
      c.hidden = key !== "all" && c.dataset.category !== key;
      if (!c.hidden) count++;
    });
    document.getElementById("archiveCount").textContent =
      count +
      " " +
      (count === 1 ? "collection" : "collections") +
      " · Select a collection to explore";
  }),
);
