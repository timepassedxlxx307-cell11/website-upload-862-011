(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === activeIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      const nextIndex = Number(dot.getAttribute("data-hero-dot"));
      showSlide(nextIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  function filterCards(input) {
    const target = input.getAttribute("data-target");
    const container = target ? document.querySelector(target) : document;
    if (!container) {
      return;
    }

    const value = input.value.trim().toLowerCase();
    const cards = Array.from(container.querySelectorAll(".movie-card"));
    cards.forEach(function (card) {
      const haystack = card.getAttribute("data-filter") || "";
      card.classList.toggle("hidden", value.length > 0 && !haystack.includes(value));
    });
  }

  const filters = Array.from(document.querySelectorAll(".movie-filter"));
  filters.forEach(function (input) {
    input.addEventListener("input", function () {
      filterCards(input);
    });
  });

  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  const searchInput = document.getElementById("site-search-input");
  if (query && searchInput) {
    searchInput.value = query;
    filterCards(searchInput);
  }
})();
