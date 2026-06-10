(function () {
  var navButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');
  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.addEventListener('error', function (event) {
    var target = event.target;
    if (target && target.tagName === 'IMG') {
      target.classList.add('is-hidden-image');
    }
  }, true);

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function startHeroTimer() {
    if (timer || slides.length < 2) {
      return;
    }
    timer = window.setInterval(nextSlide, 5000);
  }

  function resetHeroTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    startHeroTimer();
  }

  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      resetHeroTimer();
    });
  }
  if (next) {
    next.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      resetHeroTimer();
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
      resetHeroTimer();
    });
  });
  startHeroTimer();

  var queryParams = new URLSearchParams(window.location.search);
  var initialQuery = queryParams.get('q') || '';
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search-input'));
  var filterControls = Array.prototype.slice.call(document.querySelectorAll('.movie-filter'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .ranking-row'));
  var emptyBox = document.querySelector('.filter-empty');

  function matchesCard(card, query, filters) {
    var haystack = [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-genre') || '',
      card.getAttribute('data-tags') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
    if (query && haystack.indexOf(query) === -1) {
      return false;
    }
    if (filters.region && (card.getAttribute('data-region') || '') !== filters.region) {
      return false;
    }
    if (filters.year && (card.getAttribute('data-year') || '') !== filters.year) {
      return false;
    }
    if (filters.type && (card.getAttribute('data-type') || '') !== filters.type) {
      return false;
    }
    return true;
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var query = searchInputs.length ? searchInputs[0].value.trim().toLowerCase() : '';
    var filters = { region: '', year: '', type: '' };
    filterControls.forEach(function (control) {
      filters[control.getAttribute('data-filter')] = control.value;
    });
    var anyVisible = false;
    cards.forEach(function (card) {
      var visible = matchesCard(card, query, filters);
      card.hidden = !visible;
      if (visible) {
        anyVisible = true;
      }
    });
    if (emptyBox) {
      emptyBox.hidden = anyVisible;
    }
  }

  if (initialQuery && searchInputs.length) {
    searchInputs[0].value = initialQuery;
  }
  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });
  filterControls.forEach(function (control) {
    control.addEventListener('change', applyFilters);
  });
  applyFilters();

  var player = document.querySelector('.video-player');
  if (player) {
    var url = player.getAttribute('data-hls');
    var overlay = document.querySelector('.play-cover');
    var message = document.querySelector('.player-message');
    var ready = false;

    function showMessage() {
      if (message) {
        message.hidden = false;
      }
    }

    function preparePlayer() {
      if (ready || !url) {
        return;
      }
      ready = true;
      if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = url;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(player);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage();
          }
        });
        return;
      }
      player.src = url;
    }

    function playVideo() {
      preparePlayer();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var request = player.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    player.addEventListener('click', function () {
      if (player.paused) {
        playVideo();
      }
    });
    player.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    preparePlayer();
  }
}());
