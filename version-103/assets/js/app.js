(function () {
  const header = document.querySelector('[data-site-header]');
  const mobileButton = document.querySelector('[data-mobile-nav-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }

    if (window.scrollY > 20 || document.body.classList.contains('inner-page')) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prevButton = carousel.querySelector('[data-hero-prev]');
    const nextButton = carousel.querySelector('[data-hero-next]');
    let currentIndex = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === currentIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5600);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(currentIndex - 1);
        startTimer();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(currentIndex + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        startTimer();
      });
    });

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    startTimer();
  }

  const filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    const input = filterPanel.querySelector('[data-filter-input]');
    const yearSelect = filterPanel.querySelector('[data-filter-year]');
    const regionSelect = filterPanel.querySelector('[data-filter-region]');
    const countLabel = filterPanel.querySelector('[data-filter-count]');
    const cards = Array.from(document.querySelectorAll('.primary-movie-card'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
      const keyword = normalize(input && input.value);
      const year = normalize(yearSelect && yearSelect.value);
      const region = normalize(regionSelect && regionSelect.value);
      let visibleCount = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.genre,
          card.textContent
        ].join(' '));
        const yearMatched = !year || normalize(card.dataset.year) === year;
        const regionMatched = !region || normalize(card.dataset.region) === region;
        const keywordMatched = !keyword || haystack.includes(keyword);
        const visible = yearMatched && regionMatched && keywordMatched;

        card.style.display = visible ? '' : 'none';
        if (visible) {
          visibleCount += 1;
        }
      });

      if (countLabel) {
        countLabel.textContent = '显示 ' + visibleCount + ' 部影片';
      }
    }

    [input, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });
  }

  const searchInput = document.querySelector('[data-search-input]');
  const searchResults = document.querySelector('[data-search-results]');
  const searchSummary = document.querySelector('[data-search-summary]');
  const searchClear = document.querySelector('[data-search-clear]');

  if (searchInput && searchResults && window.MOVIE_SEARCH_DATA) {
    const movies = window.MOVIE_SEARCH_DATA;

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderCard(movie) {
      const tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="movie-card-link" href="movies/' + escapeHtml(movie.file) + '">',
        '    <div class="poster-frame">',
        '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
        '      <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
        '      <span class="poster-region">' + escapeHtml(movie.region) + '</span>',
        '      <span class="poster-play">▶</span>',
        '    </div>',
        '    <div class="movie-card-body">',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p class="movie-meta">' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</p>',
        '      <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
        '      <div class="tag-list">' + tags + '</div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('\n');
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function runSearch() {
      const keyword = normalize(searchInput.value);
      let results = movies;

      if (keyword) {
        results = movies.filter(function (movie) {
          return normalize(movie.searchText).includes(keyword);
        });
      } else {
        results = movies.slice(0, 18);
      }

      const limited = results.slice(0, 120);
      searchResults.innerHTML = limited.map(renderCard).join('\n');

      if (searchSummary) {
        if (keyword) {
          searchSummary.textContent = '找到 ' + results.length + ' 部匹配影片，当前显示前 ' + limited.length + ' 部。';
        } else {
          searchSummary.textContent = '默认显示前 18 部影片，输入关键词后实时筛选全站 2000 条影片。';
        }
      }
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (initialQuery) {
      searchInput.value = initialQuery;
    }

    searchInput.addEventListener('input', runSearch);

    if (searchClear) {
      searchClear.addEventListener('click', function () {
        searchInput.value = '';
        runSearch();
        searchInput.focus();
      });
    }

    runSearch();
  }
})();
