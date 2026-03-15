const header = document.getElementById("siteHeader");
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
const revealElements = document.querySelectorAll(".reveal");

window.addEventListener("scroll", () => {
    if (window.scrollY > 10) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

if (navToggle) {
    navToggle.addEventListener("click", () => {
        siteNav.classList.toggle("open");
    });
}

document.querySelectorAll(".site-nav a").forEach((link) => {
    link.addEventListener("click", () => {
        siteNav.classList.remove("open");
    });
});

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    },
    {
        threshold: 0.15
    }
);

revealElements.forEach((element) => {
    observer.observe(element);
});