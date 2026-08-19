(function () {
    const dataPaths = {
        performances: "/data/performances.json",
        releases: "/data/releases.json"
    };

    const performanceDateFormatter = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    async function loadJson(path) {
        const response = await fetch(path, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Unable to load ${path}`);
        }

        return response.json();
    }

    function createElement(tagName, className, text) {
        const element = document.createElement(tagName);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    function setError(containers, message) {
        containers.forEach((container) => {
            container.replaceChildren(createElement("p", "cms-data-message cms-data-error", message));
            container.dataset.cmsState = "error";
        });
    }

    function renderReleases(containers, releases) {
        const publishedReleases = releases
            .filter((release) => release.published)
            .map((release) => ({
                ...release,
                parsedDate: new Date(`${release.releaseDate}T12:00:00`)
            }))
            .filter((release) => !Number.isNaN(release.parsedDate.getTime()))
            .sort((a, b) => b.parsedDate - a.parsedDate);

        containers.forEach((container) => {
            container.replaceChildren();

            if (!publishedReleases.length) {
                container.appendChild(createElement("p", "cms-data-message", "No releases are currently published."));
                container.dataset.cmsState = "empty";
                return;
            }

            publishedReleases.forEach((release) => {
                const card = createElement("article", "release-card reveal visible");
                const link = createElement("a");
                const artwork = createElement("img");
                const metadata = createElement("div", "release-meta");
                const year = release.parsedDate.getFullYear();

                link.href = release.listenUrl;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.setAttribute("aria-label", `Listen to ${release.title}`);

                artwork.src = release.artwork;
                artwork.alt = `${release.title} artwork`;
                artwork.loading = "lazy";

                metadata.append(
                    createElement("h3", "", release.title),
                    createElement("p", "", `${release.releaseType} · ${year}`)
                );
                link.appendChild(artwork);
                card.append(link, metadata);
                container.appendChild(card);
            });

            container.dataset.cmsState = "loaded";
        });
    }

    function createUpcomingCard(performance, layout) {
        const cardClass = layout === "mobile"
            ? "live-page-card reveal visible"
            : "live-event-card reveal visible";
        const card = createElement("article", cardClass);

        if (performance.image) {
            const poster = createElement("div", "live-poster");
            const image = createElement("img");
            image.src = performance.image;
            image.alt = `${performance.title} promotional image`;
            image.loading = "lazy";
            poster.appendChild(image);
            card.appendChild(poster);
        } else {
            card.classList.add("live-event-without-image");
        }

        const content = createElement("div", "live-text");
        const show = createElement("div", "show-block");
        const date = createElement("p");
        const venue = [performance.venue, performance.location].filter(Boolean).join(", ");

        date.textContent = performanceDateFormatter.format(performance.parsedDate);
        show.append(
            createElement("h3", "", performance.title),
            date,
            createElement("p", "", venue)
        );

        if (performance.details) {
            show.appendChild(createElement("p", "", performance.details));
        }

        content.append(createElement("p", "kicker", "Upcoming performance"), show);

        if (performance.ticketUrl) {
            const ticketLink = createElement("a", "btn btn-solid", "Get tickets");
            ticketLink.href = performance.ticketUrl;
            ticketLink.target = "_blank";
            ticketLink.rel = "noopener noreferrer";
            content.appendChild(ticketLink);
        }

        card.appendChild(content);
        return card;
    }

    function createPastPerformances(pastPerformances) {
        const section = createElement("div", "past-performances reveal visible");
        const list = createElement("div", "past-show-list");
        section.append(createElement("p", "kicker past-kicker", "Past performances"), list);

        if (!pastPerformances.length) {
            list.appendChild(createElement("p", "cms-data-message", "No past performances are currently published."));
            return section;
        }

        pastPerformances.forEach((performance) => {
            const item = createElement("article", "past-show-item");
            const venue = [performance.venue, performance.location].filter(Boolean).join(", ");
            item.append(
                createElement("h3", "", performance.title),
                createElement("p", "", performanceDateFormatter.format(performance.parsedDate)),
                createElement("p", "", venue)
            );

            if (performance.details) {
                item.appendChild(createElement("p", "", performance.details));
            }

            list.appendChild(item);
        });

        return section;
    }

    function renderPerformances(containers, performances) {
        const now = new Date();
        const publishedPerformances = performances
            .filter((performance) => performance.published)
            .map((performance) => ({ ...performance, parsedDate: new Date(performance.date) }))
            .filter((performance) => !Number.isNaN(performance.parsedDate.getTime()));
        const upcoming = publishedPerformances
            .filter((performance) => performance.parsedDate >= now)
            .sort((a, b) => a.parsedDate - b.parsedDate);
        const past = publishedPerformances
            .filter((performance) => performance.parsedDate < now)
            .sort((a, b) => b.parsedDate - a.parsedDate);

        containers.forEach((container) => {
            const layout = container.dataset.layout || "desktop";
            const upcomingList = createElement("div", "cms-performance-list");
            container.replaceChildren();

            if (upcoming.length) {
                upcoming.forEach((performance) => {
                    upcomingList.appendChild(createUpcomingCard(performance, layout));
                });
            } else {
                const emptyState = createElement("div", "cms-live-empty reveal visible");
                emptyState.append(
                    createElement("p", "kicker", "Live"),
                    createElement("h3", "", "No upcoming performances announced"),
                    createElement("p", "", "Check back soon for new live dates.")
                );
                upcomingList.appendChild(emptyState);
            }

            container.append(upcomingList, createPastPerformances(past));
            container.dataset.cmsState = "loaded";
        });
    }

    async function initialiseCmsContent() {
        const releaseContainers = Array.from(document.querySelectorAll("[data-cms-releases]"));
        const performanceContainers = Array.from(document.querySelectorAll("[data-cms-performances]"));

        if (releaseContainers.length) {
            loadJson(dataPaths.releases)
                .then((releases) => renderReleases(releaseContainers, releases))
                .catch(() => setError(releaseContainers, "Music is temporarily unavailable. Please try again shortly."));
        }

        if (performanceContainers.length) {
            loadJson(dataPaths.performances)
                .then((performances) => renderPerformances(performanceContainers, performances))
                .catch(() => setError(performanceContainers, "Live dates are temporarily unavailable. Please try again shortly."));
        }
    }

    initialiseCmsContent();
}());
