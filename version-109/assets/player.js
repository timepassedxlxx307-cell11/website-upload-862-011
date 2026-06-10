(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function preparePlayer(shell) {
        var source = shell.getAttribute("data-source");
        var video = shell.querySelector("video");
        var overlay = shell.querySelector(".player-overlay");
        var button = shell.querySelector(".player-start");
        var prepared = false;
        var hls = null;

        function attach() {
            if (prepared || !source || !video) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            attach();
            shell.classList.add("is-playing");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!prepared) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        document.querySelectorAll("[data-player]").forEach(preparePlayer);
    });
})();
