const locations = {
  abuja: {
    title: "Hamzury · Abuja office",
    text: "Suite 4, Ajami Plaza, Plot 500B, Tafawa Balewa Way, Area 3, Garki, Abuja, Nigeria",
  },
  jos: {
    title: "Hamzury Innovation Hub · Jos",
    text: "Hamzury Innovation Hub, Jos, Plateau State, Nigeria",
  },
};
const $ = (id) => document.getElementById(id);
const base = location.origin + location.pathname;
async function copy(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    $("status").textContent = label + " copied.";
    $("shareLink").hidden = true;
  } catch {
    $("shareLink").value = text;
    $("shareLink").hidden = false;
    $("shareLink").select();
    $("status").textContent = "Select and copy the text below.";
  }
}
async function share(key) {
  const info = locations[key],
    url = base + (key ? "#" + key : "");
  const data = {
    title: info?.title || "Hamzury · Abuja and Jos locations",
    text:
      info?.text ||
      "Our Abuja office and Hamzury Innovation Hub in Jos. Addresses and directions:",
    url,
  };
  if (navigator.share) {
    try {
      await navigator.share(data);
      $("status").textContent = "Location shared.";
      return;
    } catch (e) {
      if (e.name === "AbortError") return;
    }
  }
  await copy(data.text + "\n" + url, "Location link");
}
document.querySelectorAll("[data-copy]").forEach(
  (b) =>
    (b.onclick = () => {
      const k = b.dataset.copy;
      copy(
        locations[k].text + "\n" + $(k + "Map").href,
        "Address and directions",
      );
    }),
);
document
  .querySelectorAll("[data-share]")
  .forEach((b) => (b.onclick = () => share(b.dataset.share)));
$("shareBoth").onclick = () => share();
$("copyLink").onclick = () => copy(base, "Page link");
