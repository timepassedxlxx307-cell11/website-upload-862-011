(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function textOf(value) {
        return String(value || "").toLowerCase();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var backTop = document.querySelector("[data-back-top]");

        if (backTop) {
            backTop.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

        var hero = document.querySelector("[data-hero]");

        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }

            function play() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    play();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    play();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    play();
                });
            }

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", play);
            show(0);
            play();
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var regionSelect = document.querySelector("[data-filter-region]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector("[data-filter-empty]");

        function applyFilter() {
            if (!cards.length) {
                return;
            }

            var query = textOf(filterInput && filterInput.value).trim();
            var region = textOf(regionSelect && regionSelect.value).trim();
            var type = textOf(typeSelect && typeSelect.value).trim();
            var year = textOf(yearSelect && yearSelect.value).trim();
            var visible = 0;

            cards.forEach(function (card) {
                var bag = textOf([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));

                var matched = true;

                if (query && bag.indexOf(query) === -1) {
                    matched = false;
                }

                if (region && textOf(card.getAttribute("data-region")).indexOf(region) === -1) {
                    if (!(region === "其他" && ["中国", "日本", "韩国", "美国", "英国", "法国"].every(function (item) {
                        return textOf(card.getAttribute("data-region")).indexOf(item) === -1;
                    }))) {
                        matched = false;
                    }
                }

                if (type && textOf(card.getAttribute("data-type")).indexOf(type) === -1 && bag.indexOf(type) === -1) {
                    matched = false;
                }

                if (year && textOf(card.getAttribute("data-year")).indexOf(year) === -1) {
                    matched = false;
                }

                card.classList.toggle("is-hidden", !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [filterInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });
    });
})();
