document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.nav-links');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(open));
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]')).forEach(function (input) {
        var target = document.querySelector(input.getAttribute('data-filter-target')) || document;
        var cards = Array.prototype.slice.call(target.querySelectorAll('[data-search-card]'));
        input.addEventListener('input', function () {
            var value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-title') || card.textContent || '').toLowerCase();
                card.classList.toggle('is-hidden-card', value !== '' && text.indexOf(value) === -1);
            });
        });
    });
});
