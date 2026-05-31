import {
  loadPlaylistNames,
  loadPlaylistTrackMap,
  removeTrackFromPlaylist,
} from "../utils/playlistStorage.js";

import { showConfirm } from "../utils/confirm.js";

// =========================
// 현재 hash에서 플레이리스트 이름 가져오기
// =========================
function getPlaylistNameFromHash() {
  const hash = window.location.hash || "";
  const queryString = hash.split("?")[1] || "";
  const params = new URLSearchParams(queryString);

  return params.get("name") || "";
}

// =========================
// 재생시간 포맷 함수
// =========================
function formatDuration(durationMs) {
  if (!durationMs) return "-";

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
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
// 휴지통 아이콘 함수
// =========================
function trashIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 7H20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
      <path
        d="M10 11V17M14 11V17"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
      <path
        d="M6 7L7 20H17L18 7"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
      />
      <path
        d="M9 7V4H15V7"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

// =========================
// 플레이리스트 목록 카드 생성 함수
// =========================
function createPlaylistCard(playlistName) {
  return `
    <a
      href="#/playlist?name=${encodeURIComponent(playlistName)}"
      class="playlist-card"
    >
      <div class="playlist-card__cover">
        <img src="/assets/icon/Library_S.svg" alt="" />
      </div>

      <div class="playlist-card__info">
        <strong class="playlist-card__title">
          ${escapeHTML(playlistName)}
        </strong>
        <span class="playlist-card__desc">Playlist</span>
      </div>
    </a>
  `;
}

// =========================
// 플레이리스트 곡 row 생성 함수
// =========================
function createPlaylistTrackRow(track, index) {
  const rowNumber = index + 1;

  return `
    <tr
      class="song-row"
      data-play-track
      data-id="${escapeHTML(track.id)}"
      data-uri="${escapeHTML(track.uri || "")}"
      data-title="${escapeHTML(track.title)}"
      data-artist="${escapeHTML(track.artist)}"
      data-cover="${escapeHTML(track.cover || "")}"
    >
      <td>${rowNumber}</td>

      <td>
        <div class="song-info">
          <img
            class="song-info__cover"
            src="${escapeHTML(track.cover || "")}"
            alt=""
          />

          <div class="song-info__text">
            <span class="song-info__title">
              ${escapeHTML(track.title)}
            </span>
            <span class="song-info__artist">
              ${escapeHTML(track.artist)}
            </span>
          </div>
        </div>
      </td>

      <td>${escapeHTML(track.releaseDate || "-")}</td>
      <td>${formatDuration(track.durationMs || track.duration_ms)}</td>

      <td>
        <button
          type="button"
          class="playlist-track-remove-button"
          data-no-play
          data-remove-playlist-track
          data-track-id="${escapeHTML(track.id)}"
          aria-label="플레이리스트에서 제거"
          title="제거"
        >
          ${trashIcon()}
        </button>
      </td>
    </tr>
  `;
}

// =========================
// 플레이리스트 페이지 HTML 렌더링 함수
// =========================
export function renderPlaylistPage() {
  return `
    <section class="playlist-page">
      <div id="playlistPageContent"></div>
    </section>
  `;
}

// =========================
// 전체 플레이리스트 목록 렌더링 함수
// =========================
function renderPlaylistOverview() {
  const content = document.querySelector("#playlistPageContent");
  const playlistNames = loadPlaylistNames();

  if (!content) return;

  if (playlistNames.length === 0) {
    content.innerHTML = `
      <div class="playlist-page__empty">
        <h2>플레이리스트가 없습니다.</h2>
        <p>사이드바에서 Create Playlist를 눌러 플레이리스트를 만들어보세요.</p>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="playlist-page__header">
      <h2 class="playlist-page__title">Your Playlists</h2>
      <p class="playlist-page__desc">생성한 플레이리스트를 확인해보세요.</p>
    </div>

    <div class="playlist-card-grid">
      ${playlistNames.map(createPlaylistCard).join("")}
    </div>
  `;
}

// =========================
// 플레이리스트 상세 렌더링 함수
// =========================
function renderPlaylistDetail(playlistName) {
  const content = document.querySelector("#playlistPageContent");
  const playlistTrackMap = loadPlaylistTrackMap();
  const tracks = playlistTrackMap[playlistName] || [];

  if (!content) return;

  if (!playlistName) {
    renderPlaylistOverview();
    return;
  }

  if (tracks.length === 0) {
    content.innerHTML = `
      <div class="playlist-page__header">
        <h2 class="playlist-page__title">${escapeHTML(playlistName)}</h2>
        <p class="playlist-page__desc">아직 추가된 곡이 없습니다.</p>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="playlist-page__header">
      <h2 class="playlist-page__title">${escapeHTML(playlistName)}</h2>
      <p class="playlist-page__desc">${tracks.length}곡</p>
    </div>

    <table class="song-table">
      <thead>
        <tr>
          <th>#</th>
          <th>제목</th>
          <th>발매일</th>
          <th>재생시간</th>
          <th>제거</th>
        </tr>
      </thead>

      <tbody>
        ${tracks.map(createPlaylistTrackRow).join("")}
      </tbody>
    </table>
  `;
}

// =========================
// 플레이리스트 곡 제거 이벤트 등록 함수
// =========================
function bindPlaylistTrackRemoveEvents() {
  const content = document.querySelector("#playlistPageContent");

  if (!content) return;

  content.addEventListener("click", async (event) => {
    const removeButton = event.target.closest("[data-remove-playlist-track]");

    if (!removeButton) return;

    event.preventDefault();
    event.stopPropagation();

    const playlistName = getPlaylistNameFromHash();
    const trackId = removeButton.dataset.trackId;

    const isConfirmed = await showConfirm(
      "이 곡을 플레이리스트에서 제거하시겠습니까?",
      {
        title: "곡 제거",
        cancelText: "취소",
        confirmText: "제거",
      },
    );

    if (!isConfirmed) return;

    removeTrackFromPlaylist(playlistName, trackId);
    renderPlaylistDetail(playlistName);
  });
}

// =========================
// 플레이리스트 페이지 초기 실행 함수
// =========================
export function initPlaylistPage() {
  const playlistName = getPlaylistNameFromHash();

  renderPlaylistDetail(playlistName);
  bindPlaylistTrackRemoveEvents();
}
