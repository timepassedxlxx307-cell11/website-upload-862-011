(function () {
    function hide(element) {
        if (element) {
            element.classList.add('hidden');
        }
    }

    function bind(video, source) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    }

    window.MoviePlayer = {
        init: function (videoId, source, buttonId) {
            var video = document.getElementById(videoId);
            var button = document.getElementById(buttonId);
            var ready = false;

            if (!video || !source) {
                return;
            }

            function start() {
                if (!ready) {
                    bind(video, source);
                    ready = true;
                }

                hide(button);

                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', start);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });

            video.addEventListener('play', function () {
                hide(button);
            });
        }
    };
})();
