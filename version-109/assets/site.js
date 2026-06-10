(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var toggle = document.querySelector(".mobile-menu-toggle");
        if (!toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = !document.body.classList.contains("mobile-open");
            document.body.classList.toggle("mobile-open", open);
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
        document.querySelectorAll(".mobile-nav a").forEach(function (link) {
            link.addEventListener("click", function () {
                document.body.classList.remove("mobile-open");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function activate(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }
        function restart(next) {
            window.clearInterval(timer);
            activate(next);
            start();
        }
        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener("click", function () {
                restart(itemIndex);
            });
        });
        start();
    }

    function setupCategoryFilter() {
        var form = document.querySelector("[data-filter-form]");
        if (!form) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
        var keyword = form.querySelector("[data-filter-keyword]");
        var type = form.querySelector("[data-filter-type]");
        var year = form.querySelector("[data-filter-year]");
        function includes(value, query) {
            return String(value || "").toLowerCase().indexOf(String(query || "").toLowerCase()) !== -1;
        }
        function apply() {
            var q = keyword ? keyword.value.trim().toLowerCase() : "";
            var t = type ? type.value : "";
            var y = year ? year.value : "";
            cards.forEach(function (card) {
                var text = [card.dataset.title, card.dataset.genre, card.dataset.type, card.dataset.year, card.dataset.tags].join(" ").toLowerCase();
                var ok = true;
                if (q) {
                    ok = text.indexOf(q) !== -1;
                }
                if (ok && t) {
                    ok = includes(card.dataset.type, t) || includes(card.dataset.genre, t) || includes(card.dataset.tags, t);
                }
                if (ok && y) {
                    ok = card.dataset.year === y;
                }
                card.style.display = ok ? "" : "none";
            });
        }
        [keyword, type, year].forEach(function (field) {
            if (field) {
                field.addEventListener("input", apply);
                field.addEventListener("change", apply);
            }
        });
        apply();
    }

    function createCard(movie) {
        var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<article class=\"movie-card\">",
            "<a class=\"movie-card-link\" href=\"" + escapeAttr(movie.url) + "\">",
            "<span class=\"movie-poster-wrap\">",
            "<img src=\"" + escapeAttr(movie.image) + "\" alt=\"" + escapeAttr(movie.title) + "\" loading=\"lazy\" decoding=\"async\">",
            "<span class=\"movie-card-shade\"></span>",
            "<span class=\"movie-badge movie-badge-left\">" + escapeHtml(movie.category) + "</span>",
            "<span class=\"movie-badge movie-badge-right\">" + escapeHtml(movie.type) + "</span>",
            "</span>",
            "<span class=\"movie-card-body\">",
            "<strong>" + escapeHtml(movie.title) + "</strong>",
            "<em>" + escapeHtml(movie.oneLine) + "</em>",
            "<span class=\"movie-card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></span>",
            "<span class=\"movie-card-tags\">" + tags + "</span>",
            "</span>",
            "</a>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>]/g, function (char) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char];
        });
    }

    function escapeAttr(value) {
        return escapeHtml(value).replace(/"/g, "&quot;");
    }

    function setupSearchPage() {
        var shell = document.querySelector("[data-search-page]");
        if (!shell || !window.MOVIE_INDEX) {
            return;
        }
        var input = shell.querySelector("[data-search-input]");
        var grid = shell.querySelector("[data-search-results]");
        var empty = shell.querySelector("[data-search-empty]");
        var params = new URLSearchParams(window.location.search);
        var current = params.get("q") || "";
        input.value = current;
        function render() {
            var query = input.value.trim().toLowerCase();
            var matched = window.MOVIE_INDEX.filter(function (movie) {
                if (!query) {
                    return true;
                }
                return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase().indexOf(query) !== -1;
            }).slice(0, 120);
            grid.innerHTML = matched.map(createCard).join("");
            empty.hidden = matched.length > 0;
        }
        shell.addEventListener("submit", function (event) {
            event.preventDefault();
            var url = new URL(window.location.href);
            var value = input.value.trim();
            if (value) {
                url.searchParams.set("q", value);
            } else {
                url.searchParams.delete("q");
            }
            window.history.replaceState(null, "", url.toString());
            render();
        });
        input.addEventListener("input", render);
        render();
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupCategoryFilter();
        setupSearchPage();
    });
})();
