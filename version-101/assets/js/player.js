(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");

            if (!video || !button) {
                return;
            }

            var stream = video.getAttribute("data-stream");
            var hls = null;
            var attached = false;

            function attach() {
                if (attached || !stream) {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    attached = true;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    attached = true;
                    return;
                }

                video.src = stream;
                attached = true;
            }

            function start() {
                attach();
                button.classList.add("is-hidden");
                var result = video.play();

                if (result && typeof result.catch === "function") {
                    result.catch(function () {
                        button.classList.remove("is-hidden");
                    });
                }
            }

            button.addEventListener("click", start);

            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });

            video.addEventListener("play", function () {
                button.classList.add("is-hidden");
            });

            video.addEventListener("pause", function () {
                if (!video.ended) {
                    button.classList.remove("is-hidden");
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    });
})();
