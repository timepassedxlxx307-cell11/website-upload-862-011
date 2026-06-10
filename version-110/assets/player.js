(function () {
  const video = document.querySelector(".movie-video");
  const cover = document.querySelector(".player-cover");
  let started = false;
  let hls = null;

  function attachStream() {
    if (!video || started) {
      return;
    }

    const streamUrl = video.getAttribute("data-stream");
    if (!streamUrl) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    started = true;
  }

  function playMovie() {
    attachStream();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    if (video) {
      video.controls = true;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }
  }

  if (cover) {
    cover.addEventListener("click", playMovie);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (!started || video.paused) {
        playMovie();
      }
    });
  }

  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
})();
