import { H as Hls } from './hls-vendor.js';

const players = document.querySelectorAll('[data-player]');

players.forEach(function (player) {
  const video = player.querySelector('video');
  const startButton = player.querySelector('[data-player-start]');
  const message = player.querySelector('[data-player-message]');
  const source = player.dataset.videoUrl;
  let initialized = false;

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function initializePlayer() {
    if (!video || !source || initialized) {
      return;
    }

    initialized = true;

    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setMessage('播放源加载完成，可以开始播放。');
        video.play().catch(function () {
          setMessage('播放源已加载，请再次点击播放按钮。');
        });
      });

      hls.on(Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setMessage('播放器遇到网络或媒体错误，请刷新页面后重试。');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        setMessage('播放源加载完成，可以开始播放。');
        video.play().catch(function () {
          setMessage('播放源已加载，请再次点击播放按钮。');
        });
      }, { once: true });
    } else {
      video.src = source;
      setMessage('当前浏览器可能不支持 HLS，请使用支持 m3u8 的浏览器访问。');
    }
  }

  function startPlayback() {
    initializePlayer();

    if (startButton) {
      startButton.classList.add('is-hidden');
    }

    if (video) {
      video.play().catch(function () {
        setMessage('播放源正在初始化，请稍后再次点击视频播放。');
      });
    }
  }

  if (startButton) {
    startButton.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('play', function () {
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
    });
  }
});
