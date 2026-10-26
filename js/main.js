const form = document.querySelector("#search-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
});

const reviewTrack = document.querySelector(".review-grid");
const reviewCards = [...reviewTrack.children];
const reviewStatus = document.querySelector("#review-status");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let reviewTimer = 0;
let reviewVisible = false;

function reviewIndex() {
  const width = reviewTrack.clientWidth || 1;
  return Math.max(0, Math.min(reviewCards.length - 1, Math.round(reviewTrack.scrollLeft / width)));
}

function updateReview() {
  reviewStatus.textContent = `${reviewIndex() + 1} of ${reviewCards.length}`;
}

function showReview(index) {
  const wrap = index === 0 && reviewIndex() === reviewCards.length - 1;
  reviewTrack.scrollTo({
    left: index * reviewTrack.clientWidth,
    behavior: reduceMotion.matches || wrap ? "auto" : "smooth"
  });
}

function advanceReview() {
  if (!reviewVisible || document.hidden || reduceMotion.matches) return;
  showReview((reviewIndex() + 1) % reviewCards.length);
}

function startReviews() {
  window.clearInterval(reviewTimer);
  if (reduceMotion.matches) return;
  reviewTimer = window.setInterval(advanceReview, 5500);
}

reviewTrack.addEventListener("scroll", updateReview, { passive: true });
new IntersectionObserver((entries) => {
  reviewVisible = entries.some((entry) => entry.isIntersecting);
}, { threshold: 0.45 }).observe(reviewTrack);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) window.clearInterval(reviewTimer);
  else startReviews();
});
reduceMotion.addEventListener("change", startReviews);
updateReview();
startReviews();

const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");

toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });
});

const shots = [...document.querySelectorAll(".shot")];
const lightbox = document.querySelector("#lightbox");
const lightboxImg = document.querySelector("#lightbox-img");
let shotIndex = 0;

function showShot(index) {
  shotIndex = (index + shots.length) % shots.length;
  const shot = shots[shotIndex];
  lightboxImg.src = shot.dataset.full;
  lightboxImg.alt = shot.dataset.alt;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeShot() {
  lightbox.hidden = true;
  lightboxImg.src = "";
  document.body.style.overflow = "";
}

shots.forEach((shot, index) => {
  shot.addEventListener("click", () => showShot(index));
});

lightbox.querySelector(".lightbox-close").addEventListener("click", closeShot);
lightbox.querySelector(".prev").addEventListener("click", () => showShot(shotIndex - 1));
lightbox.querySelector(".next").addEventListener("click", () => showShot(shotIndex + 1));

document.addEventListener("keydown", (event) => {
  if (lightbox.hidden) return;
  if (event.key === "Escape") closeShot();
  if (event.key === "ArrowRight") showShot(shotIndex + 1);
  if (event.key === "ArrowLeft") showShot(shotIndex - 1);
});

const contact = document.querySelector("#contact-form");
const formError = document.querySelector("#form-error");
const formSuccess = document.querySelector("#form-success");

contact.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(contact);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  formError.hidden = true;

  if (!name || !email) {
    formError.hidden = false;
    formError.textContent = "Name and email are required.";
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    formError.hidden = false;
    formError.textContent = "Enter an email address Marci can reply to.";
    return;
  }

  contact.hidden = true;
  formSuccess.hidden = false;
  formSuccess.innerHTML = `<strong>Thank you, ${escapeHtml(name)}.</strong> Marci will follow up at ${escapeHtml(email)}.`;
});

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function officeStatus() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const minutes = now.getHours() * 60 + now.getMinutes();
  const open = minutes >= 8 * 60 && minutes < 19 * 60;
  const status = document.querySelector("#hours-status");
  status.classList.add(open ? "is-open" : "is-closed");
  status.innerHTML = open
    ? "Open today <span>08:00 am – 07:00 pm</span>"
    : "After hours <span>Opens daily at 8:00 am</span>";
}

officeStatus();

const cookie = document.querySelector("#cookie");
if (!localStorage.getItem("mm-cookie")) cookie.hidden = false;

document.querySelector("#cookie-accept").addEventListener("click", () => {
  localStorage.setItem("mm-cookie", "accepted");
  cookie.hidden = true;
});
