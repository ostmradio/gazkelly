(function () {
    async function loadNotificationConfig() {
        const response = await fetch("/data/notification.json", { cache: "no-store" });

        if (!response.ok) {
            throw new Error("Unable to load notification settings");
        }

        return response.json();
    }

    function showNotification(config) {
        if (!config.enabled || !config.message) {
            return;
        }

        const notificationId = config.id || "default";
        const notificationKey = `gaz-kelly-notification-dismissed-${notificationId}`;
        let notificationDismissed = false;

        try {
            notificationDismissed = sessionStorage.getItem(notificationKey) === "true";
        } catch (error) {
            notificationDismissed = false;
        }

        if (notificationDismissed) {
            return;
        }

        const notification = document.createElement("aside");
        const content = document.createElement(config.url ? "a" : "div");
        const closeButton = document.createElement("button");

        notification.className = "site-notice";
        notification.setAttribute("aria-label", "Site announcement");
        content.className = "site-notice-content";

        if (config.url) {
            content.href = config.url;
            content.target = "_blank";
            content.rel = "noopener noreferrer";
        }

        if (config.label) {
            const label = document.createElement("span");
            label.className = "site-notice-label";
            label.textContent = config.label;
            content.appendChild(label);
        }

        const message = document.createElement("span");
        message.className = "site-notice-text";
        message.textContent = config.message;
        content.appendChild(message);

        if (config.url) {
            const arrow = document.createElement("span");
            arrow.className = "site-notice-arrow";
            arrow.setAttribute("aria-hidden", "true");
            arrow.textContent = "\u2192";
            content.appendChild(arrow);
        }

        closeButton.className = "site-notice-close";
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", "Dismiss announcement");
        closeButton.textContent = "\u00D7";

        notification.append(content, closeButton);
        document.body.appendChild(notification);

        window.setTimeout(() => {
            notification.classList.add("show");
        }, Math.max(0, Number(config.delay) || 0));

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

    loadNotificationConfig()
        .then((config) => {
            window.siteNotificationConfig = config;
            showNotification(config);
        })
        .catch(() => {
            // A missing notification must never prevent the rest of the website loading.
        });
}());
