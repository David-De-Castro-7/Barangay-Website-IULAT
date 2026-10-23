
document.addEventListener("DOMContentLoaded", () => {
    const feed = document.getElementById("announcementFeed");
    const searchInput = document.getElementById("announcementSearch");
    const searchButton = document.getElementById("searchButton");
    const filters = document.querySelectorAll(".announcement-filter");

    const emptyState = document.getElementById("announcementEmpty");
    const emptyTitle = document.getElementById("announcementEmptyTitle");
    const emptyMessage = document.getElementById("announcementEmptyMessage");

    const mobileMenuButton = document.getElementById("mobileMenuBtn");
    const navigationLinks = document.getElementById("navLinks");

    if (!feed || !searchInput || !emptyState) {
        return;
    }

    let selectedCategory = "all";

    /*
     * PUBLIC ANNOUNCEMENTS
     *
     * The feed starts empty intentionally.
     * Later, published announcements will be loaded
     * from the backend and database.
     */

    function getAnnouncementCards() {
        return Array.from(
            feed.querySelectorAll(".announcement-feed-card")
        );
    }

    /*
     * SEARCH AND CATEGORY FILTERING
     *
     * This works with real announcement cards when
     * they are added to the feed by the backend.
     */

    function filterAnnouncements() {
        const searchTerm = searchInput.value
            .trim()
            .toLowerCase();

        const cards = getAnnouncementCards();
        let visibleCount = 0;

        cards.forEach((card) => {
            const category = (
                card.dataset.category || ""
            ).toLowerCase();

            const searchableText = (
                card.dataset.search || card.textContent || ""
            ).toLowerCase();

            const categoryMatches =
                selectedCategory === "all" ||
                category === selectedCategory;

            const searchMatches =
                searchableText.includes(searchTerm);

            const shouldShow =
                categoryMatches && searchMatches;

            card.hidden = !shouldShow;

            if (shouldShow) {
                visibleCount++;
            }
        });

        updateEmptyState(visibleCount, cards.length);
    }

    /*
     * EMPTY STATE
     *
     * Never insert sample content to fill the feed.
     */

    function updateEmptyState(visibleCount, totalCount) {
        if (totalCount === 0) {
            emptyState.hidden = false;
            emptyTitle.textContent = "No Announcements Yet";
            emptyMessage.textContent =
                "There are currently no published barangay announcements. " +
                "Please check again later for official community updates.";

            return;
        }

        if (visibleCount === 0) {
            emptyState.hidden = false;
            emptyTitle.textContent = "No Announcements Found";
            emptyMessage.textContent =
                "Try another search term or select a different category.";

            return;
        }

        emptyState.hidden = true;
    }

    /*
     * CATEGORY FILTER BUTTONS
     */

    filters.forEach((filter) => {
        filter.addEventListener("click", () => {
            filters.forEach((button) => {
                button.classList.remove("active");
                button.setAttribute("aria-pressed", "false");
            });

            filter.classList.add("active");
            filter.setAttribute("aria-pressed", "true");

            selectedCategory = filter.dataset.category || "all";

            filterAnnouncements();
        });
    });

    /*
     * SEARCH
     */

    if (searchButton) {
        searchButton.addEventListener("click", filterAnnouncements);
    }

    searchInput.addEventListener("input", filterAnnouncements);

    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            filterAnnouncements();
        }
    });

    /*
     * MOBILE NAVIGATION
     */

    if (mobileMenuButton && navigationLinks) {
        mobileMenuButton.addEventListener("click", () => {
            const isOpen =
                navigationLinks.classList.toggle("active");

            mobileMenuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });

        navigationLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navigationLinks.classList.remove("active");

                mobileMenuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );
            });
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                navigationLinks.classList.remove("active");

                mobileMenuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        });
    }

    /*
     * INITIALIZE
     */

    filterAnnouncements();
});
