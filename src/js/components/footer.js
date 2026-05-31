// =========================
// 초기 푸터 상태
// =========================
const EMPTY_TRACK = {
  cover: "/assets/icon/logo.svg",
  title: "재생 중인 곡이 없습니다",
  artist: "원하는 음악을 선택해보세요",
  currentTime: "0:00",
  duration: "0:00",
  progress: "0%",
};

// =========================
// API 주소
// =========================
const API_BASE_URL = "http://127.0.0.1:8080";

// =========================
// 테스트 재생 목록
// =========================
const testTrackUris = [
  "spotify:track:4cOdK2wGLETKBW3PvgPWqT",
  "spotify:track:11dFghVXANMlKmJXsNCbNl",
  "spotify:track:7ouMYWpwJ422jRcDASZB7P",
  "spotify:track:6habFhsOp2NvshLv26DqMb",
];

let spotifyAccessToken = null;
let spotifyPlayer = null;
let spotifyDeviceId = null;
let isSpotifyReady = false;
let isPlaying = false;
let hasStartedPlayback = false;
let isTrackCardEventBound = false;
let isPlayerPopoverEventBound = false;

let isShuffleOn = false;
let repeatMode = "off";

let currentVolume = 0.5;
let previousVolume = 0.5;
let currentDuration = 0;
let currentPosition = 0;
let lastProgressUpdatedAt = 0;
let progressTimer = null;

// =========================
// Spotify Access Token 가져오기
// =========================
async function getSpotifyAccessToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/spotify/access-token`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Spotify access token 요청 실패");
    }

    const data = await response.json();

    spotifyAccessToken = data.accessToken;

    console.log("Spotify access token 받아오기 성공");
    console.log("토큰 길이:", spotifyAccessToken.length);

    return spotifyAccessToken;
  } catch (error) {
    console.error("Spotify access token 받아오기 실패:", error);
    return null;
  }
}

// =========================
// Spotify Web Playback SDK 스크립트 로드
// =========================
function loadSpotifySDK() {
  return new Promise((resolve) => {
    if (window.Spotify) {
      console.log("Spotify SDK 이미 로드됨");
      resolve();
      return;
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log("Spotify Web Playback SDK 로드 완료");
      resolve();
    };

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);
  });
}

// =========================
// Spotify Web API 요청 공통 함수
// =========================
async function spotifyRequest(url, options = {}) {
  const token = spotifyAccessToken || (await getSpotifyAccessToken());

  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

// =========================
// Spotify 요청 실패 처리
// =========================
async function handleSpotifyError(response, actionName) {
  if (response.ok || response.status === 204) {
    return true;
  }

  const errorText = await response.text();

  console.error(`${actionName} 실패:`, response.status, errorText);

  if (response.status === 403) {
    alert(
      `${actionName} 실패: Spotify 권한(scope) 또는 Premium 계정을 확인해주세요.`,
    );
  } else {
    alert(`${actionName} 실패`);
  }

  return false;
}

// =========================
// Spotify Player 준비 확인
// =========================
function checkSpotifyPlayerReady() {
  if (!spotifyPlayer || !isSpotifyReady) {
    console.log("로그인 후 이용 가능합니다.");
    alert("로그인 후 이용 가능합니다.");
    return false;
  }

  return true;
}

// =========================
// HTML 특수문자 변환 함수
// =========================
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => {
    const escapeMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return escapeMap[char];
  });
}

// =========================
// Spotify 트랙 ID 검증
// =========================
function isValidSpotifyTrackId(id) {
  return /^[A-Za-z0-9]{22}$/.test(id);
}

// =========================
// 재생 가능한 Spotify URI 만들기
// =========================
function getPlayableTrackUri(track) {
  const uri = track.uri?.trim();
  const id = track.id?.trim();

  if (uri) {
    const spotifyTrackPrefix = "spotify:track:";

    if (!uri.startsWith(spotifyTrackPrefix)) {
      return null;
    }

    const trackIdFromUri = uri.replace(spotifyTrackPrefix, "");

    if (!isValidSpotifyTrackId(trackIdFromUri)) {
      return null;
    }

    return uri;
  }

  if (id && isValidSpotifyTrackId(id)) {
    return `spotify:track:${id}`;
  }

  return null;
}

// =========================
// 현재 화면의 재생 가능한 곡 목록 가져오기
// =========================
function getCurrentPageTrackQueue(clickedTrack) {
  const trackElements = document.querySelectorAll("[data-play-track]");

  const tracks = Array.from(trackElements).map((trackElement) => {
    return {
      id: trackElement.dataset.id || "",
      uri: trackElement.dataset.uri || "",
      title: trackElement.dataset.title || "",
      artist: trackElement.dataset.artist || "",
      cover: trackElement.dataset.cover || "",
    };
  });

  const playableTracks = tracks
    .map((track) => {
      const uri = getPlayableTrackUri(track);

      if (!uri) return null;

      return {
        ...track,
        uri,
      };
    })
    .filter(Boolean);

  const clickedUri = getPlayableTrackUri(clickedTrack);

  const clickedIndex = playableTracks.findIndex((track) => {
    return track.uri === clickedUri;
  });

  return {
    uris: playableTracks.map((track) => track.uri),
    startIndex: clickedIndex >= 0 ? clickedIndex : 0,
  };
}

// =========================
// 더미 카드 데이터를 Spotify 검색 결과로 변환
// =========================
async function searchTrackFromBackend(track) {
  const keyword = `${track.title || ""} ${track.artist || ""}`.trim();

  if (!keyword) {
    return null;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/home/search?keyword=${encodeURIComponent(keyword)}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("Spotify 검색 요청 실패");
    }

    const data = await response.json();
    const tracks = Array.isArray(data) ? data : data.tracks || [];

    if (tracks.length === 0) {
      console.log("검색 결과가 없습니다:", keyword);
      return null;
    }

    const firstTrack = tracks[0];

    return {
      id: firstTrack.id || "",
      uri: firstTrack.uri || "",
      title: firstTrack.title || firstTrack.name || track.title,
      artist:
        firstTrack.artist ||
        firstTrack.description ||
        firstTrack.artistName ||
        track.artist,
      cover:
        firstTrack.cover ||
        firstTrack.imageUrl ||
        firstTrack.image ||
        track.cover,
    };
  } catch (error) {
    console.error("카드 곡 검색 실패:", error);
    return null;
  }
}

// =========================
// 푸터 빈 상태 설정 함수
// =========================
function setFooterEmptyState(isEmpty) {
  const player = document.querySelector(".player");

  if (player) {
    player.classList.toggle("player--empty", isEmpty);
  }

  const disabledButtonIds = [
    "shuffleButton",
    "prevButton",
    "nextButton",
    "repeatButton",
    "queueButton",
  ];

  disabledButtonIds.forEach((id) => {
    const button = document.querySelector(`#${id}`);

    if (!button) return;

    button.disabled = isEmpty;
  });
}

// =========================
// 초기 푸터 렌더링 함수
// =========================
function renderEmptyFooter() {
  const currentCover = document.querySelector("#currentCover");
  const currentTitle = document.querySelector("#currentTitle");
  const currentArtist = document.querySelector("#currentArtist");
  const currentTime = document.querySelector("#currentTime");
  const durationTime = document.querySelector("#durationTime");
  const progressBar = document.querySelector("#progressBar");

  setFooterEmptyState(true);

  currentDuration = 0;
  currentPosition = 0;
  lastProgressUpdatedAt = Date.now();

  if (currentCover) {
    currentCover.src = EMPTY_TRACK.cover;
    currentCover.alt = "MOOD WAVE 기본 커버";
  }

  if (currentTitle) {
    currentTitle.textContent = EMPTY_TRACK.title;
  }

  if (currentArtist) {
    currentArtist.textContent = EMPTY_TRACK.artist;
  }

  if (currentTime) {
    currentTime.textContent = EMPTY_TRACK.currentTime;
  }

  if (durationTime) {
    durationTime.textContent = EMPTY_TRACK.duration;
  }

  if (progressBar) {
    progressBar.style.width = EMPTY_TRACK.progress;
  }

  updatePlayButtonIcon();
  updateVolumeUI();
}

// =========================
// 재생 기기를 MOOD WAVE Player로 전환
// =========================
async function transferPlaybackToMoodWave() {
  if (!spotifyDeviceId) {
    console.log("Spotify device_id가 아직 없습니다.");
    return;
  }

  const response = await spotifyRequest(
    "https://api.spotify.com/v1/me/player",
    {
      method: "PUT",
      body: JSON.stringify({
        device_ids: [spotifyDeviceId],
        play: false,
      }),
    },
  );

  if (response.ok || response.status === 204) {
    console.log("MOOD WAVE Player로 재생 기기 전환 성공");
    return;
  }

  console.error("재생 기기 전환 실패:", response.status);
}

// =========================
// 테스트 재생 목록 재생
// =========================
async function playTestTrack() {
  if (!spotifyDeviceId) {
    console.log("Spotify device_id가 아직 없습니다.");
    return;
  }

  const response = await spotifyRequest(
    `https://api.spotify.com/v1/me/player/play?device_id=${spotifyDeviceId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        uris: testTrackUris,
      }),
    },
  );

  if (response.ok || response.status === 204) {
    setFooterEmptyState(false);

    hasStartedPlayback = true;
    isPlaying = true;
    updatePlayButtonIcon();

    console.log("테스트 재생 목록 재생 성공");
    return;
  }

  const errorText = await response.text();
  console.error("테스트 재생 목록 재생 실패:", response.status, errorText);
}

// =========================
// 선택한 카드의 곡 재생
// =========================
async function playSelectedTrack(track) {
  if (!checkSpotifyPlayerReady()) return;

  if (!spotifyDeviceId) {
    console.log("Spotify device_id가 아직 없습니다.");
    return;
  }

  let playableTrack = track;
  let uri = getPlayableTrackUri(playableTrack);

  if (!uri) {
    console.log("Spotify ID가 없어서 제목/아티스트로 검색합니다:", track);

    const searchedTrack = await searchTrackFromBackend(track);

    if (!searchedTrack) {
      console.log("재생 가능한 Spotify 트랙을 찾지 못했습니다.");
      return;
    }

    playableTrack = searchedTrack;
    uri = getPlayableTrackUri(playableTrack);
  }

  if (!uri) {
    console.log("재생 가능한 Spotify URI를 만들 수 없습니다.");
    console.log("현재 track 데이터:", playableTrack);
    return;
  }

  const currentCover = document.querySelector("#currentCover");
  const currentTitle = document.querySelector("#currentTitle");
  const currentArtist = document.querySelector("#currentArtist");

  setFooterEmptyState(false);

  if (currentCover) {
    currentCover.src = playableTrack.cover || "";
    currentCover.alt = `${playableTrack.title || "곡"} 앨범 커버`;
  }

  if (currentTitle) {
    currentTitle.textContent = playableTrack.title || "";
  }

  if (currentArtist) {
    currentArtist.textContent = playableTrack.artist || "";
  }

  await transferPlaybackToMoodWave();

  const queue = getCurrentPageTrackQueue(playableTrack);

  const response = await spotifyRequest(
    `https://api.spotify.com/v1/me/player/play?device_id=${spotifyDeviceId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        uris: queue.uris.length > 0 ? queue.uris : [uri],
        offset: {
          position: queue.startIndex,
        },
      }),
    },
  );

  if (response.ok || response.status === 204) {
    hasStartedPlayback = true;
    isPlaying = true;
    updatePlayButtonIcon();

    console.log("선택한 곡 재생 성공:", playableTrack.title);
    console.log("현재 재생목록:", queue.uris);
    return;
  }

  const errorText = await response.text();
  console.error("선택한 곡 재생 실패:", response.status, errorText);
}

// =========================
// 재생 버튼 아이콘 변경
// =========================
function updatePlayButtonIcon() {
  const playButtonIcon = document.querySelector("#playButtonIcon");

  if (!playButtonIcon) return;

  playButtonIcon.src = isPlaying
    ? "/assets/icon/Pause_XS.svg"
    : "/assets/icon/Play_XS.svg";
}

// =========================
// 셔플 버튼 UI 변경
// =========================
function updateShuffleButtonUI() {
  const shuffleButton = document.querySelector("#shuffleButton");

  if (!shuffleButton) return;

  shuffleButton.classList.toggle("is-active", isShuffleOn);
  shuffleButton.setAttribute(
    "aria-label",
    isShuffleOn ? "셔플 켜짐" : "셔플 꺼짐",
  );
}

// =========================
// 반복 버튼 UI 변경
// =========================
function updateRepeatButtonUI() {
  const repeatButton = document.querySelector("#repeatButton");
  const repeatBadge = document.querySelector("#repeatBadge");

  if (!repeatButton || !repeatBadge) return;

  repeatButton.classList.toggle("is-active", repeatMode !== "off");
  repeatBadge.classList.toggle("is-visible", repeatMode === "track");

  if (repeatMode === "track") {
    repeatButton.setAttribute("aria-label", "한 곡 반복");
    repeatButton.title = "한 곡 반복";
  } else if (repeatMode === "context") {
    repeatButton.setAttribute("aria-label", "전체 반복");
    repeatButton.title = "전체 반복";
  } else {
    repeatButton.setAttribute("aria-label", "반복 꺼짐");
    repeatButton.title = "반복 꺼짐";
  }
}

// =========================
// 볼륨 UI 변경
// =========================
function updateVolumeUI() {
  const volumeFill = document.querySelector("#volumeFill");

  if (!volumeFill) return;

  volumeFill.style.width = `${currentVolume * 100}%`;
}

// =========================
// 플레이어 작은 모달 닫기
// =========================
function closePlayerPopover() {
  const popover = document.querySelector("#playerPopover");

  if (popover) {
    popover.remove();
  }
}

// =========================
// 플레이어 작은 모달 열기
// =========================
function openPlayerPopover(anchorElement, title, contentHTML) {
  closePlayerPopover();

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div id="playerPopover" class="player-popover" role="dialog">
        <div class="player-popover__header">
          <strong class="player-popover__title">${escapeHTML(title)}</strong>

          <button
            type="button"
            class="player-popover__close"
            data-close-player-popover
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div class="player-popover__body custom-scrollbar">
          ${contentHTML}
        </div>
      </div>
    `,
  );

  const popover = document.querySelector("#playerPopover");
  const rect = anchorElement.getBoundingClientRect();

  const popoverWidth = 300;
  const margin = 12;

  let left = rect.left + rect.width / 2 - popoverWidth / 2;
  let top = rect.top - margin;

  left = Math.max(
    margin,
    Math.min(left, window.innerWidth - popoverWidth - margin),
  );

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

// =========================
// 현재 재생곡 UI 업데이트
// =========================
function updateCurrentTrackUI(track) {
  const currentCover = document.querySelector("#currentCover");
  const currentTitle = document.querySelector("#currentTitle");
  const currentArtist = document.querySelector("#currentArtist");

  if (!track) return;

  setFooterEmptyState(false);

  if (currentCover) {
    currentCover.src = track.album?.images?.[0]?.url || "";
    currentCover.alt = `${track.name} 앨범 커버`;
  }

  if (currentTitle) {
    currentTitle.textContent = track.name || "";
  }

  if (currentArtist) {
    currentArtist.textContent =
      track.artists?.map((artist) => artist.name).join(", ") || "";
  }
}

// =========================
// 시간 포맷 변환
// =========================
function formatTime(ms) {
  if (!ms) return "0:00";

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// =========================
// 진행바 UI 업데이트
// =========================
function updateProgressUI(position, duration) {
  const currentTime = document.querySelector("#currentTime");
  const durationTime = document.querySelector("#durationTime");
  const progressBar = document.querySelector("#progressBar");

  currentPosition = position || 0;
  currentDuration = duration || 0;
  lastProgressUpdatedAt = Date.now();

  if (currentTime) {
    currentTime.textContent = formatTime(currentPosition);
  }

  if (durationTime) {
    durationTime.textContent = formatTime(currentDuration);
  }

  if (progressBar) {
    const progress = currentDuration
      ? (currentPosition / currentDuration) * 100
      : 0;

    progressBar.style.width = `${progress}%`;
  }
}

// =========================
// 진행바 실시간 업데이트 시작
// =========================
function startProgressTimer() {
  if (progressTimer) return;

  progressTimer = window.setInterval(() => {
    if (!isPlaying || !currentDuration) return;

    const elapsed = Date.now() - lastProgressUpdatedAt;
    const nextPosition = Math.min(currentPosition + elapsed, currentDuration);

    updateProgressUI(nextPosition, currentDuration);
  }, 500);
}

// =========================
// 진행바 실시간 업데이트 중지
// =========================
function stopProgressTimer() {
  if (!progressTimer) return;

  clearInterval(progressTimer);
  progressTimer = null;
}

// =========================
// 셔플 토글
// =========================
async function toggleShuffle() {
  if (!checkSpotifyPlayerReady()) return;

  const nextShuffleState = !isShuffleOn;

  const response = await spotifyRequest(
    `https://api.spotify.com/v1/me/player/shuffle?state=${nextShuffleState}&device_id=${spotifyDeviceId}`,
    {
      method: "PUT",
    },
  );

  const isSuccess = await handleSpotifyError(response, "셔플 변경");

  if (!isSuccess) return;

  isShuffleOn = nextShuffleState;
  updateShuffleButtonUI();

  console.log("셔플 상태:", isShuffleOn);
}

// =========================
// 반복 모드 변경
// =========================
async function toggleRepeat() {
  if (!checkSpotifyPlayerReady()) return;

  const repeatModes = ["off", "context", "track"];
  const currentIndex = repeatModes.indexOf(repeatMode);
  const nextRepeatMode = repeatModes[(currentIndex + 1) % repeatModes.length];

  const response = await spotifyRequest(
    `https://api.spotify.com/v1/me/player/repeat?state=${nextRepeatMode}&device_id=${spotifyDeviceId}`,
    {
      method: "PUT",
    },
  );

  const isSuccess = await handleSpotifyError(response, "반복 모드 변경");

  if (!isSuccess) return;

  repeatMode = nextRepeatMode;
  updateRepeatButtonUI();

  console.log("반복 모드:", repeatMode);
}

// =========================
// 대기열 보기
// =========================
async function showQueue(anchorElement) {
  try {
    const response = await spotifyRequest(
      "https://api.spotify.com/v1/me/player/queue",
    );

    if (!response.ok) {
      await handleSpotifyError(response, "대기열 조회");
      return;
    }

    const data = await response.json();

    const currentlyPlaying = data.currently_playing;
    const queue = data.queue || [];

    const currentHTML = currentlyPlaying
      ? `
        <div class="player-popover__current">
          <span class="player-popover__label">현재 재생 중</span>
          <strong>${escapeHTML(currentlyPlaying.name)}</strong>
          <span>
            ${escapeHTML(
              currentlyPlaying.artists
                ?.map((artist) => artist.name)
                .join(", ") || "-",
            )}
          </span>
        </div>
      `
      : `
        <p class="player-popover__empty">
          현재 재생 중인 곡이 없습니다.
        </p>
      `;

    const queueHTML =
      queue.length > 0
        ? `
          <div class="player-popover__section">
            <span class="player-popover__label">다음 곡</span>

            <ul class="player-popover__list">
              ${queue
                .map((track, index) => {
                  const artistNames =
                    track.artists?.map((artist) => artist.name).join(", ") ||
                    "-";

                  return `
                    <li class="player-popover__item">
                      <span class="player-popover__index">${index + 1}</span>

                      <div class="player-popover__text">
                        <strong>${escapeHTML(track.name)}</strong>
                        <span>${escapeHTML(artistNames)}</span>
                      </div>
                    </li>
                  `;
                })
                .join("")}
            </ul>
          </div>
        `
        : `
          <p class="player-popover__empty">
            대기열이 비어 있습니다.
          </p>
        `;

    openPlayerPopover(anchorElement, "대기열", currentHTML + queueHTML);
  } catch (error) {
    console.error("대기열 조회 실패:", error);
    alert("대기열을 불러올 수 없습니다.");
  }
}

// =========================
// 연결 가능한 기기 보기
// =========================
async function showDevices(anchorElement) {
  try {
    const response = await spotifyRequest(
      "https://api.spotify.com/v1/me/player/devices",
    );

    if (!response.ok) {
      await handleSpotifyError(response, "연결 기기 조회");
      return;
    }

    const data = await response.json();
    const devices = data.devices || [];

    const devicesHTML =
      devices.length > 0
        ? `
          <ul class="player-popover__list">
            ${devices
              .map((device) => {
                const activeText = device.is_active
                  ? "현재 사용 중"
                  : "대기 중";
                const volumeText =
                  typeof device.volume_percent === "number"
                    ? `${device.volume_percent}%`
                    : "볼륨 정보 없음";

                return `
                  <li class="player-popover__item">
                    <span class="player-popover__device-dot ${
                      device.is_active ? "is-active" : ""
                    }"></span>

                    <div class="player-popover__text">
                      <strong>${escapeHTML(device.name)}</strong>
                      <span>
                        ${escapeHTML(device.type)} · ${escapeHTML(activeText)} · ${escapeHTML(volumeText)}
                      </span>
                    </div>
                  </li>
                `;
              })
              .join("")}
          </ul>
        `
        : `
          <p class="player-popover__empty">
            연결 가능한 Spotify 기기가 없습니다.
          </p>
        `;

    openPlayerPopover(anchorElement, "연결 기기", devicesHTML);
  } catch (error) {
    console.error("연결 기기 조회 실패:", error);
    alert("연결 기기를 불러올 수 없습니다.");
  }
}

// =========================
// 볼륨 음소거 / 복구
// =========================
async function toggleMute() {
  if (!checkSpotifyPlayerReady()) return;

  try {
    const nextVolume = currentVolume > 0 ? 0 : previousVolume || 0.5;

    if (currentVolume > 0) {
      previousVolume = currentVolume;
    }

    await spotifyPlayer.setVolume(nextVolume);

    currentVolume = nextVolume;
    updateVolumeUI();

    console.log("볼륨:", currentVolume);
  } catch (error) {
    console.error("볼륨 변경 실패:", error);
    alert("볼륨을 변경할 수 없습니다.");
  }
}

// =========================
// 볼륨바 클릭으로 볼륨 조절
// =========================
async function handleVolumeBarClick(event) {
  if (!checkSpotifyPlayerReady()) return;

  const volumeBar = event.currentTarget;
  const rect = volumeBar.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const nextVolume = Math.max(0, Math.min(1, clickX / rect.width));

  try {
    await spotifyPlayer.setVolume(nextVolume);

    currentVolume = nextVolume;

    if (nextVolume > 0) {
      previousVolume = nextVolume;
    }

    updateVolumeUI();

    console.log("볼륨:", currentVolume);
  } catch (error) {
    console.error("볼륨 조절 실패:", error);
    alert("볼륨을 조절할 수 없습니다.");
  }
}

// =========================
// 진행바 클릭으로 재생 위치 이동
// =========================
async function handleProgressBarClick(event) {
  if (!checkSpotifyPlayerReady()) return;

  if (!currentDuration) {
    console.log("곡 재생 시간이 없습니다.");
    return;
  }

  const progressTrack = event.currentTarget;
  const rect = progressTrack.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percent = Math.max(0, Math.min(1, clickX / rect.width));
  const nextPosition = Math.floor(currentDuration * percent);

  try {
    await spotifyPlayer.seek(nextPosition);
    updateProgressUI(nextPosition, currentDuration);

    if (isPlaying) {
      startProgressTimer();
    }

    console.log("재생 위치 이동:", nextPosition);
  } catch (error) {
    console.error("재생 위치 이동 실패:", error);
    alert("재생 위치를 이동할 수 없습니다.");
  }
}

// =========================
// 전체화면 토글
// =========================
async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      return;
    }

    await document.exitFullscreen();
  } catch (error) {
    console.error("전체화면 변경 실패:", error);
    alert("전체화면을 변경할 수 없습니다.");
  }
}

// =========================
// Spotify Player 생성
// =========================
function createSpotifyPlayer() {
  spotifyPlayer = new window.Spotify.Player({
    name: "MOOD WAVE Player",

    getOAuthToken: async (callback) => {
      const token = spotifyAccessToken || (await getSpotifyAccessToken());
      callback(token);
    },

    volume: 0.5,
  });

  spotifyPlayer.addListener("ready", async ({ device_id }) => {
    spotifyDeviceId = device_id;
    isSpotifyReady = true;

    console.log("Spotify Player 준비 완료");
    console.log("device_id:", spotifyDeviceId);

    await transferPlaybackToMoodWave();

    currentVolume = await spotifyPlayer.getVolume();
    previousVolume = currentVolume || 0.5;
    updateVolumeUI();
  });

  spotifyPlayer.addListener("not_ready", ({ device_id }) => {
    isSpotifyReady = false;

    console.log("Spotify Player 연결 끊김");
    console.log("device_id:", device_id);
  });

  spotifyPlayer.addListener("player_state_changed", (state) => {
    if (!state) return;

    isPlaying = !state.paused;
    updatePlayButtonIcon();

    const currentSpotifyTrack = state.track_window.current_track;

    updateCurrentTrackUI(currentSpotifyTrack);
    updateProgressUI(state.position, state.duration);

    if (isPlaying) {
      startProgressTimer();
    } else {
      stopProgressTimer();
    }

    console.log(isPlaying ? "현재 재생 중" : "현재 일시정지");
  });

  spotifyPlayer.addListener("initialization_error", ({ message }) => {
    console.error("Spotify 초기화 에러:", message);
  });

  spotifyPlayer.addListener("authentication_error", ({ message }) => {
    console.error("Spotify 인증 에러:", message);
  });

  spotifyPlayer.addListener("account_error", ({ message }) => {
    console.error("Spotify 계정 에러:", message);
    console.error("Premium 계정이 아니면 여기서 막힐 수 있음");
  });

  spotifyPlayer.addListener("playback_error", ({ message }) => {
    console.error("Spotify 재생 에러:", message);
  });

  spotifyPlayer.connect().then((success) => {
    if (success) {
      console.log("Spotify Player 연결 성공");
    } else {
      console.log("Spotify Player 연결 실패");
    }
  });
}

// =========================
// 노래 카드 / 테이블 row 클릭 이벤트 등록
// =========================
function initTrackCardEvents() {
  if (isTrackCardEventBound) return;

  isTrackCardEventBound = true;

  document.addEventListener("click", async (event) => {
    if (event.target.closest("[data-no-play]")) return;

    const trackCard = event.target.closest("[data-play-track]");

    if (!trackCard) return;

    const track = {
      id: trackCard.dataset.id || "",
      uri: trackCard.dataset.uri || "",
      title: trackCard.dataset.title || "",
      artist: trackCard.dataset.artist || "",
      cover: trackCard.dataset.cover || "",
    };

    console.log("클릭한 트랙 데이터:", track);

    await playSelectedTrack(track);
  });
}

// =========================
// 플레이어 작은 모달 전역 이벤트 등록
// =========================
function initPlayerPopoverEvents() {
  if (isPlayerPopoverEventBound) return;

  isPlayerPopoverEventBound = true;

  document.addEventListener("click", (event) => {
    if (event.target.closest("#playerPopover")) return;
    if (event.target.closest("#queueButton")) return;
    if (event.target.closest("#deviceButton")) return;

    closePlayerPopover();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-close-player-popover]")) return;

    closePlayerPopover();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    closePlayerPopover();
  });
}

// =========================
// Spotify Player 초기 준비
// =========================
async function initSpotifyPlayer() {
  const token = await getSpotifyAccessToken();

  if (!token) {
    console.log("Spotify 로그인이 필요합니다.");
    return;
  }

  await loadSpotifySDK();

  console.log("Spotify Player SDK 준비 완료");

  createSpotifyPlayer();
}

// =========================
// 푸터 HTML 렌더링 함수
// =========================
export function renderFooter() {
  return `
    <div class="player__track">
      <img
        id="currentCover"
        class="player__cover"
        src=""
        width="56"
        height="56"
        alt=""
      />

      <div class="player__meta">
        <span id="currentTitle" class="player__title"></span>
        <span id="currentArtist" class="player__artist"></span>
      </div>

      <button
        class="player__icon player__icon--like"
        type="button"
        aria-label="좋아요"
      >
        <img
          src="/assets/icon/Heart_Fill_XS.svg"
          width="28"
          height="28"
          alt=""
        />
      </button>
    </div>

    <div class="player__controls">
      <div class="player__buttons">
        <button id="shuffleButton" class="player__icon" type="button" aria-label="셔플 꺼짐">
          <img
            src="/assets/icon/Shuffle_S.svg"
            width="32"
            height="32"
            alt=""
          />
        </button>

        <button id="prevButton" class="player__icon" type="button" aria-label="이전">
          <img src="/assets/icon/Back.svg" width="32" height="32" alt="" />
        </button>

        <button
          id="playButton"
          class="player__icon player__icon--play"
          type="button"
          aria-label="재생"
        >
          <img
            id="playButtonIcon"
            src="/assets/icon/Play_XS.svg"
            width="48"
            height="48"
            alt=""
          />
        </button>

        <button id="nextButton" class="player__icon" type="button" aria-label="다음">
          <img
            src="/assets/icon/Forward.svg"
            width="32"
            height="32"
            alt=""
          />
        </button>

        <button id="repeatButton" class="player__icon player__icon--repeat" type="button" aria-label="반복 꺼짐">
          <img
            src="/assets/icon/Repeat_S.svg"
            width="32"
            height="32"
            alt=""
          />

          <span id="repeatBadge" class="player__repeat-badge">1</span>
        </button>
      </div>

      <div class="player__progress">
        <span id="currentTime" class="player__time"></span>
        <div id="progressTrack" class="player__bar">
          <span id="progressBar" class="player__bar-fill"></span>
        </div>
        <span id="durationTime" class="player__time"></span>
      </div>
    </div>

    <div class="player__extras">
      <div class="player__extras-tools">
        <button id="queueButton" class="player__icon" type="button" aria-label="대기열">
          <img
            src="/assets/icon/Queue_XS.svg"
            width="32"
            height="32"
            alt=""
          />
        </button>

        <button id="deviceButton" class="player__icon" type="button" aria-label="연결 기기">
          <img
            src="/assets/icon/Devices_XS.svg"
            width="32"
            height="32"
            alt=""
          />
        </button>

        <button id="volumeButton" class="player__icon" type="button" aria-label="볼륨">
          <img
            src="/assets/icon/Volume_XS.svg"
            width="32"
            height="32"
            alt=""
          />
        </button>
      </div>

      <div id="volumeBar" class="player__volume">
        <span id="volumeFill" class="player__volume-fill"></span>
      </div>

      <button id="fullscreenButton" class="player__icon" type="button" aria-label="전체 화면">
        <img
          src="/assets/icon/FullScreen_S.svg"
          width="32"
          height="32"
          alt=""
        />
      </button>
    </div>
  `;
}

// =========================
// 푸터 버튼 이벤트 등록
// =========================
function initFooterEvents() {
  const shuffleButton = document.querySelector("#shuffleButton");
  const playButton = document.querySelector("#playButton");
  const prevButton = document.querySelector("#prevButton");
  const nextButton = document.querySelector("#nextButton");
  const repeatButton = document.querySelector("#repeatButton");
  const queueButton = document.querySelector("#queueButton");
  const deviceButton = document.querySelector("#deviceButton");
  const volumeButton = document.querySelector("#volumeButton");
  const volumeBar = document.querySelector("#volumeBar");
  const fullscreenButton = document.querySelector("#fullscreenButton");
  const progressTrack = document.querySelector("#progressTrack");

  if (shuffleButton) {
    shuffleButton.addEventListener("click", toggleShuffle);
  }

  if (playButton) {
    playButton.addEventListener("click", async () => {
      if (!checkSpotifyPlayerReady()) return;

      if (!hasStartedPlayback) {
        await playTestTrack();
        return;
      }

      await spotifyPlayer.togglePlay();
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", async () => {
      if (!checkSpotifyPlayerReady()) return;

      await spotifyPlayer.previousTrack();
      console.log("이전 곡 이동");
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", async () => {
      if (!checkSpotifyPlayerReady()) return;

      await spotifyPlayer.nextTrack();
      console.log("다음 곡 이동");
    });
  }

  if (repeatButton) {
    repeatButton.addEventListener("click", toggleRepeat);
  }

  if (queueButton) {
    queueButton.addEventListener("click", (event) => {
      event.stopPropagation();
      showQueue(event.currentTarget);
    });
  }

  if (deviceButton) {
    deviceButton.addEventListener("click", (event) => {
      event.stopPropagation();
      showDevices(event.currentTarget);
    });
  }

  if (volumeButton) {
    volumeButton.addEventListener("click", toggleMute);
  }

  if (volumeBar) {
    volumeBar.addEventListener("click", handleVolumeBarClick);
  }

  if (fullscreenButton) {
    fullscreenButton.addEventListener("click", toggleFullscreen);
  }

  if (progressTrack) {
    progressTrack.addEventListener("click", handleProgressBarClick);
  }
}

// =========================
// 푸터 초기 실행 함수
// =========================
export function initFooter() {
  renderEmptyFooter();
  initFooterEvents();
  initPlayerPopoverEvents();
  initTrackCardEvents();
  initSpotifyPlayer();
}
