(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function bindMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(i);
        start();
      });
    });

    start();
  }

  function bindSearch() {
    var areas = Array.prototype.slice.call(document.querySelectorAll("[data-search-area]"));
    areas.forEach(function (area) {
      var input = area.querySelector("[data-search-input]");
      var scope = area.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var chips = Array.prototype.slice.call(area.querySelectorAll("[data-filter-chip]"));
      var active = "all";

      function matchType(card) {
        if (active === "all") {
          return true;
        }
        var type = card.getAttribute("data-type") || "";
        var meta = card.getAttribute("data-meta") || "";
        return type.indexOf(active) !== -1 || meta.indexOf(active) !== -1;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-meta") || "",
            card.textContent || ""
          ].join(" ").toLowerCase();
          var visible = (!query || text.indexOf(query) !== -1) && matchType(card);
          card.style.display = visible ? "" : "none";
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          active = chip.getAttribute("data-filter-chip") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("active", item === chip);
          });
          apply();
        });
      });
    });
  }

  ready(function () {
    bindMenu();
    bindHero();
    bindSearch();
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.querySelector("[data-player-video]");
  var button = document.querySelector("[data-player-button]");
  if (!video || !button || !streamUrl) {
    return;
  }
  var loaded = false;

  function hideButton() {
    button.classList.add("hidden");
  }

  function tryPlay() {
    hideButton();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  function loadStream() {
    if (loaded) {
      tryPlay();
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", tryPlay, { once: true });
      video.load();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsPlayer) {
        video._hlsPlayer.destroy();
      }
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      video._hlsPlayer = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, tryPlay);
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          video.src = streamUrl;
          video.load();
        }
      });
      return;
    }
    video.src = streamUrl;
    video.addEventListener("loadedmetadata", tryPlay, { once: true });
    video.load();
  }

  button.addEventListener("click", loadStream);
  video.addEventListener("click", function () {
    if (!loaded || video.paused) {
      loadStream();
    }
  });
}
