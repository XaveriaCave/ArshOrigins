/* === TYPEWRITER === */
const titles = [
  "Software Engineer",
  "Full-Stack Developer",
  "ML / AI Enthusiast",
  "Data Science Explorer",
  "Indie Builder"
];
let titleIndex = 0, charIndex = 0, deleting = false;
const typedEl = document.getElementById("typed-text");

function typeLoop() {
  const current = titles[titleIndex];
  if (deleting) {
    typedEl.textContent = current.substring(0, charIndex--);
    if (charIndex < 0) { deleting = false; titleIndex = (titleIndex + 1) % titles.length; setTimeout(typeLoop, 400); return; }
    setTimeout(typeLoop, 45);
  } else {
    typedEl.textContent = current.substring(0, charIndex++);
    if (charIndex > current.length) { deleting = true; setTimeout(typeLoop, 1600); return; }
    setTimeout(typeLoop, 80);
  }
}
typeLoop();

/* === NAV SCROLL === */
const nav = document.querySelector("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 40);
});

/* === HAMBURGER === */
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("nav-links");
hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  const spans = hamburger.querySelectorAll("span");
  if (navLinks.classList.contains("open")) {
    spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
    spans[1].style.opacity = "0";
    spans[2].style.transform = "rotate(-45deg) translate(5px, -5px)";
  } else {
    spans.forEach(s => { s.style.transform = ""; s.style.opacity = ""; });
  }
});
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  navLinks.classList.remove("open");
  hamburger.querySelectorAll("span").forEach(s => { s.style.transform = ""; s.style.opacity = ""; });
}));

/* === INTERSECTION OBSERVER === */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(
  ".timeline-item, .project-card, .achievement-item, .fade-up, .skill-category"
).forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  observer.observe(el);
});

/* === CONTACT FORM === */
document.getElementById("contact-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const toast = document.getElementById("toast");
  toast.classList.add("show");
  this.reset();
  setTimeout(() => toast.classList.remove("show"), 4000);
});

/* === SMOOTH ACTIVE NAV === */
const sections = document.querySelectorAll("section[id]");
const navAs = document.querySelectorAll(".nav-links a[href^='#']");
const activateNav = () => {
  let current = "";
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
  navAs.forEach(a => {
    a.style.color = a.getAttribute("href") === `#${current}` ? "var(--text-primary)" : "";
  });
};
window.addEventListener("scroll", activateNav, { passive: true });
