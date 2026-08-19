const dataPaths = {
    settings: "/test/data/settings.json",
    performances: "/test/data/performances.json",
    releases: "/test/data/releases.json"
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
});

const releaseDateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
});

async function loadJson(path) {
    const response = await fetch(path, { cache: "no-store" });

    if (!response.ok) {
        throw new Error(`Could not load ${path} (${response.status})`);
    }

    return response.json();
}

function showEmptyState(container, message) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = message;
    container.appendChild(emptyState);
}

function renderPerformances(performances) {
    const now = new Date();
    const published = performances
        .filter((performance) => performance.published)
        .map((performance) => ({ ...performance, parsedDate: new Date(performance.date) }))
        .filter((performance) => !Number.isNaN(performance.parsedDate.getTime()));

    const upcoming = published
        .filter((performance) => performance.parsedDate >= now)
        .sort((a, b) => a.parsedDate - b.parsedDate);
    const past = published
        .filter((performance) => performance.parsedDate < now)
        .sort((a, b) => b.parsedDate - a.parsedDate);

    const upcomingContainer = document.getElementById("upcomingPerformances");
    const pastContainer = document.getElementById("pastPerformances");
    const performanceTemplate = document.getElementById("performanceTemplate");
    const historyTemplate = document.getElementById("historyTemplate");

    document.getElementById("upcomingCount").textContent = `${upcoming.length} upcoming`;
    document.getElementById("pastCount").textContent = `${past.length} past`;

    if (!upcoming.length) {
        showEmptyState(upcomingContainer, "No upcoming performances are currently published.");
    }

    upcoming.forEach((performance) => {
        const card = performanceTemplate.content.cloneNode(true);
        const image = card.querySelector(".performance-image");
        const ticketLink = card.querySelector(".performance-link");

        image.src = performance.image || "/img/GazKelly2.jpg";
        image.alt = `${performance.title} promotional image`;
        card.querySelector(".performance-date").dateTime = performance.date;
        card.querySelector(".performance-date").textContent = dateFormatter.format(performance.parsedDate);
        card.querySelector(".performance-title").textContent = performance.title;
        card.querySelector(".performance-venue").textContent = `${performance.venue}, ${performance.location}`;
        card.querySelector(".performance-details").textContent = performance.details || "";

        if (performance.ticketUrl) {
            ticketLink.href = performance.ticketUrl;
        } else {
            ticketLink.remove();
        }

        upcomingContainer.appendChild(card);
    });

    if (!past.length) {
        showEmptyState(pastContainer, "No past performances are currently published.");
    }

    past.forEach((performance) => {
        const item = historyTemplate.content.cloneNode(true);
        item.querySelector(".history-date").dateTime = performance.date;
        item.querySelector(".history-date").textContent = dateFormatter.format(performance.parsedDate);
        item.querySelector(".history-title").textContent = performance.title;
        item.querySelector(".history-venue").textContent = `${performance.venue}, ${performance.location}`;
        item.querySelector(".history-details").textContent = performance.details || "";
        pastContainer.appendChild(item);
    });
}

function renderReleases(releases) {
    const releaseContainer = document.getElementById("releases");
    const releaseTemplate = document.getElementById("releaseTemplate");
    const published = releases
        .filter((release) => release.published)
        .map((release) => ({ ...release, parsedDate: new Date(`${release.releaseDate}T12:00:00`) }))
        .sort((a, b) => b.parsedDate - a.parsedDate);

    document.getElementById("releaseCount").textContent = `${published.length} releases`;

    if (!published.length) {
        showEmptyState(releaseContainer, "No music releases are currently published.");
    }

    published.forEach((release) => {
        const card = releaseTemplate.content.cloneNode(true);
        const artwork = card.querySelector(".release-artwork");
        const releaseLink = card.querySelector(".release-link");
        const releaseDate = card.querySelector(".release-date");

        releaseLink.href = release.listenUrl;
        artwork.src = release.artwork;
        artwork.alt = `${release.title} artwork`;
        card.querySelector(".release-type").textContent = release.releaseType;
        card.querySelector(".release-title").textContent = release.title;
        releaseDate.dateTime = release.releaseDate;
        releaseDate.textContent = releaseDateFormatter.format(release.parsedDate);
        releaseContainer.appendChild(card);
    });
}

async function initialiseTestPage() {
    const status = document.getElementById("loadStatus");

    try {
        const [settings, performances, releases] = await Promise.all([
            loadJson(dataPaths.settings),
            loadJson(dataPaths.performances),
            loadJson(dataPaths.releases)
        ]);

        document.getElementById("pageHeading").textContent = settings.heading;
        document.getElementById("pageIntroduction").textContent = settings.introduction;
        renderPerformances(performances);
        renderReleases(releases);

        status.className = "load-status success";
        status.textContent = "All content loaded successfully from JSON.";
    } catch (error) {
        status.className = "load-status error";
        status.textContent = `Content could not be loaded: ${error.message}`;
        document.getElementById("pageHeading").textContent = "Content test failed to load";
    }
}

initialiseTestPage();
