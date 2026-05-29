import { currentTrack } from "../data.js";

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
  if (!spotifyPlayer || !isSpotifyReady) {
    console.log("Spotify Player가 아직 준비되지 않았습니다.");
    return;
  }

  if (!spotifyDeviceId) {
    console.log("Spotify device_id가 아직 없습니다.");
    return;
  }

  let playableTrack = track;
  let uri = getPlayableTrackUri(playableTrack);

  // u1, u2, p1 같은 더미 ID면 title + artist로 검색해서 실제 Spotify 곡 찾기
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

  // 카드 클릭 즉시 푸터 UI 먼저 변경
  const currentCover = document.querySelector("#currentCover");
  const currentTitle = document.querySelector("#currentTitle");
  const currentArtist = document.querySelector("#currentArtist");

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

  const response = await spotifyRequest(
    `https://api.spotify.com/v1/me/player/play?device_id=${spotifyDeviceId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        uris: [uri],
      }),
    },
  );

  if (response.ok || response.status === 204) {
    hasStartedPlayback = true;
    isPlaying = true;
    updatePlayButtonIcon();

    console.log("선택한 곡 재생 성공:", playableTrack.title);
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
// 현재 재생곡 UI 업데이트
// =========================
function updateCurrentTrackUI(track) {
  const currentCover = document.querySelector("#currentCover");
  const currentTitle = document.querySelector("#currentTitle");
  const currentArtist = document.querySelector("#currentArtist");

  if (!track) return;

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

  if (currentTime) {
    currentTime.textContent = formatTime(position);
  }

  if (durationTime) {
    durationTime.textContent = formatTime(duration);
  }

  if (progressBar) {
    const progress = duration ? (position / duration) * 100 : 0;
    progressBar.style.width = `${progress}%`;
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
// 노래 카드 클릭 이벤트 등록
// =========================
function initTrackCardEvents() {
  if (isTrackCardEventBound) return;

  isTrackCardEventBound = true;

  document.addEventListener("click", async (event) => {
    const trackCard = event.target.closest("[data-play-track]");

    if (!trackCard) return;

    const track = {
      id: trackCard.dataset.id,
      uri: trackCard.dataset.uri,
      title: trackCard.dataset.title,
      artist: trackCard.dataset.artist,
      cover: trackCard.dataset.cover,
    };

    await playSelectedTrack(track);
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
        <button class="player__icon" type="button" aria-label="셔플">
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

        <button class="player__icon" type="button" aria-label="반복">
          <img
            src="/assets/icon/Repeat_S.svg"
            width="32"
            height="32"
            alt=""
          />
        </button>
      </div>

      <div class="player__progress">
        <span id="currentTime" class="player__time"></span>
        <div class="player__bar">
          <span id="progressBar" class="player__bar-fill"></span>
        </div>
        <span id="durationTime" class="player__time"></span>
      </div>
    </div>

    <div class="player__extras">
      <div class="player__extras-tools">
        <button class="player__icon" type="button" aria-label="가사">
          <img
            src="/assets/icon/Component 2.svg"
            width="32"
            height="32"
            alt=""
          />
        </button>

        <button class="player__icon" type="button" aria-label="대기열">
          <img
            src="/assets/icon/Queue_XS.svg"
            width="32"
            height="32"
            alt=""
          />
        </button>

        <button class="player__icon" type="button" aria-label="연결 기기">
          <img
            src="/assets/icon/Devices_XS.svg"
            width="32"
            height="32"
            alt=""
          />
        </button>

        <button class="player__icon" type="button" aria-label="볼륨">
          <img
            src="/assets/icon/Volume_XS.svg"
            width="32"
            height="32"
            alt=""
          />
        </button>
      </div>

      <div class="player__volume">
        <span class="player__volume-fill"></span>
      </div>

      <button class="player__icon" type="button" aria-label="전체 화면">
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
// 현재 재생곡 렌더링 함수
// =========================
function renderCurrentTrack() {
  document.querySelector("#currentCover").src = currentTrack.cover;
  document.querySelector("#currentTitle").textContent = currentTrack.title;
  document.querySelector("#currentArtist").textContent = currentTrack.artist;
  document.querySelector("#currentTime").textContent = currentTrack.currentTime;
  document.querySelector("#durationTime").textContent = currentTrack.duration;
  document.querySelector("#progressBar").style.width = currentTrack.progress;
}

// =========================
// 푸터 버튼 이벤트 등록
// =========================
function initFooterEvents() {
  const playButton = document.querySelector("#playButton");
  const prevButton = document.querySelector("#prevButton");
  const nextButton = document.querySelector("#nextButton");

  if (playButton) {
    playButton.addEventListener("click", async () => {
      if (!spotifyPlayer || !isSpotifyReady) {
        console.log("Spotify Player가 아직 준비되지 않았습니다.");
        return;
      }

      if (!hasStartedPlayback) {
        await playTestTrack();
        return;
      }

      await spotifyPlayer.togglePlay();
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", async () => {
      if (!spotifyPlayer || !isSpotifyReady) {
        console.log("Spotify Player가 아직 준비되지 않았습니다.");
        return;
      }

      await spotifyPlayer.previousTrack();
      console.log("이전 곡 이동");
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", async () => {
      if (!spotifyPlayer || !isSpotifyReady) {
        console.log("Spotify Player가 아직 준비되지 않았습니다.");
        return;
      }

      await spotifyPlayer.nextTrack();
      console.log("다음 곡 이동");
    });
  }
}

// =========================
// 푸터 초기 실행 함수
// =========================
export function initFooter() {
  renderCurrentTrack();
  initFooterEvents();
  initTrackCardEvents();
  initSpotifyPlayer();
}
