(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    restart();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot") || 0));
                    restart();
                });
            });

            show(0);
            restart();
        });

        document.querySelectorAll("[data-movie-rail]").forEach(function (rail) {
            var section = rail.closest(".section-block");
            if (!section) {
                return;
            }
            var prev = section.querySelector("[data-rail-prev]");
            var next = section.querySelector("[data-rail-next]");
            function scrollByCard(direction) {
                rail.scrollBy({ left: direction * Math.max(260, rail.clientWidth * 0.72), behavior: "smooth" });
            }
            if (prev) {
                prev.addEventListener("click", function () {
                    scrollByCard(-1);
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    scrollByCard(1);
                });
            }
        });

        document.querySelectorAll(".page-main, .detail-main, main").forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card-wrap"));
            var empty = scope.querySelector("[data-empty-state]");
            var activeFilter = "";

            function applyFilter() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = String(card.getAttribute("data-search") || "").toLowerCase();
                    var tags = String(card.getAttribute("data-tags") || "").toLowerCase();
                    var year = String(card.getAttribute("data-year") || "").toLowerCase();
                    var region = String(card.getAttribute("data-region") || "").toLowerCase();
                    var matchQuery = !query || haystack.indexOf(query) !== -1 || tags.indexOf(query) !== -1 || year.indexOf(query) !== -1 || region.indexOf(query) !== -1;
                    var filter = activeFilter.toLowerCase();
                    var matchFilter = !filter || haystack.indexOf(filter) !== -1 || tags.indexOf(filter) !== -1 || year.indexOf(filter) !== -1 || region.indexOf(filter) !== -1;
                    var visible = matchQuery && matchFilter;
                    card.style.display = visible ? "" : "none";
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", shown === 0);
                }
            }

            if (input && cards.length) {
                input.addEventListener("input", applyFilter);
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    activeFilter = chip.getAttribute("data-filter-value") || "";
                    chips.forEach(function (item) {
                        item.classList.toggle("active", item === chip);
                    });
                    applyFilter();
                });
            });
        });
    });
})();

function setupPlayer(videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    if (!video || !sourceUrl) {
        return;
    }
    var shell = video.closest(".video-shell");
    var overlay = shell ? shell.querySelector(".video-overlay") : null;
    var started = false;
    var hlsInstance = null;

    function attachSource() {
        if (started) {
            return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", attachSource);
    }

    video.addEventListener("click", function () {
        if (!started) {
            attachSource();
        }
    });

    video.addEventListener("error", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
