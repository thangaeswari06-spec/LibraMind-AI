// Task 4: simple client-side routing using hash-based navigation
const routes = ["home", "dashboard", "books", "login"];

function navigate(pageId) {
  routes.forEach((r) => {
    const el = document.getElementById("page-" + r);
    if (el) el.classList.toggle("active", r === pageId);
  });
  document.querySelectorAll(".sidebar a, .navbar a").forEach((a) => {
    a.classList.toggle("active", a.dataset.route === pageId);
  });
  window.location.hash = pageId;
}

function initRouting() {
  const initial = window.location.hash.replace("#", "") || "home";
  navigate(routes.includes(initial) ? initial : "home");

  document.querySelectorAll("[data-route]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(link.dataset.route);
    });
  });

  window.addEventListener("hashchange", () => {
    const page = window.location.hash.replace("#", "");
    if (routes.includes(page)) navigate(page);
  });
}

document.addEventListener("DOMContentLoaded", initRouting);
