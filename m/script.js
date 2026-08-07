const header = document.getElementById("siteHeader");
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
const revealElements = document.querySelectorAll(".reveal");

window.addEventListener("scroll", () => {
    if (header) {
        if (window.scrollY > 10) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }
});

if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
        siteNav.classList.toggle("open");
    });
}

document.querySelectorAll(".site-nav a").forEach((link) => {
    link.addEventListener("click", () => {
        if (siteNav) {
            siteNav.classList.remove("open");
        }
    });
});

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        },
        {
            threshold: 0.12
        }
    );

    revealElements.forEach((element) => {
        observer.observe(element);
    });
} else {
    revealElements.forEach((element) => {
        element.classList.add("visible");
    });
}

const notificationConfig = window.siteNotificationConfig || {};

if (notificationConfig.enabled && notificationConfig.message) {
    const notificationId = notificationConfig.id || "default";
    const notificationKey = `gaz-kelly-notification-dismissed-${notificationId}`;
    let notificationDismissed = false;

    try {
        notificationDismissed = sessionStorage.getItem(notificationKey) === "true";
    } catch (error) {
        notificationDismissed = false;
    }

    if (!notificationDismissed) {
        const notification = document.createElement("aside");
        notification.className = "site-notice";
        notification.setAttribute("aria-label", "Site announcement");

        const content = document.createElement(notificationConfig.url ? "a" : "div");
        content.className = "site-notice-content";

        if (notificationConfig.url) {
            content.href = notificationConfig.url;
            content.target = "_blank";
            content.rel = "noopener noreferrer";
        }

        if (notificationConfig.label) {
            const label = document.createElement("span");
            label.className = "site-notice-label";
            label.textContent = notificationConfig.label;
            content.appendChild(label);
        }

        const message = document.createElement("span");
        message.className = "site-notice-text";
        message.textContent = notificationConfig.message;
        content.appendChild(message);

        if (notificationConfig.url) {
            const arrow = document.createElement("span");
            arrow.className = "site-notice-arrow";
            arrow.setAttribute("aria-hidden", "true");
            arrow.textContent = "→";
            content.appendChild(arrow);
        }

        const closeButton = document.createElement("button");
        closeButton.className = "site-notice-close";
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", "Dismiss announcement");
        closeButton.textContent = "×";

        notification.append(content, closeButton);
        document.body.appendChild(notification);

        window.setTimeout(() => {
            notification.classList.add("show");
        }, Number(notificationConfig.delay) || 0);

        closeButton.addEventListener("click", () => {
            notification.classList.remove("show");

            try {
                sessionStorage.setItem(notificationKey, "true");
            } catch (error) {
                // The notification can still be dismissed when storage is unavailable.
            }

            window.setTimeout(() => notification.remove(), 450);
        });
    }
}
