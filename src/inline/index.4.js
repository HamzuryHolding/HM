if (new URLSearchParams(location.search).has("workspace-preview")) {
  try {
    const p = JSON.parse(
      sessionStorage.getItem("hm_website_preview") || "null",
    );
    if (p) {
      document.getElementById("workspace-preview").hidden = false;
      document.getElementById("preview-title").textContent = p.title;
      document.getElementById("preview-copy").textContent = p.note;
    }
  } catch (e) {}
}
