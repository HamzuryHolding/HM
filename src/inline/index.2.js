function showPortrait() {
  document.getElementById("portraitView").showModal();
}
document.getElementById("portraitView").addEventListener("click", function (e) {
  if (e.target === this) this.close();
});
document
  .querySelectorAll(".nav a")
  .forEach((a) =>
    a.addEventListener("click", () =>
      document.querySelector(".nav").classList.remove("mobile"),
    ),
  );
