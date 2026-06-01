import { ICON_PATH, navItems, playlistMenuItems } from "../data.js";
import { isLoggedIn, requireLogin } from "../utils/auth.js";
import {
  deletePlaylistTracks,
  renamePlaylistTracks,
} from "../utils/playlistStorage.js";
import { escapeHTML } from "../utils/escapeHTML.js";

let currentPage = 0;
const DEFAULT_LIMIT = 10;
let isLoading = false;
let hasMore = true;
let selectedTrack = null;
let isSongTableEventBound = false;
let activeObserver = null;

// =========================
// 아이콘 경로
// =========================
const PLAYLIST_ICON_PATH = "/assets/icon/+Library_S.svg";
const HEART_ICON_PATH = "/assets/icon/Heart_Fill_XS.svg";

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
// 트랙 데이터 파싱 함수
// =========================
function parseTrackData(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("트랙 데이터 파싱 실패:", error);
    return null;
  }
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
// 곡 데이터 정리 함수
// =========================
function normalizeTrack(item) {
  const title = item.title || item.name || "-";

  const artist =
    item.artist ||
    item.artistName ||
    item.description ||
    item.artists?.map((artist) => artist.name).join(", ") ||
    "-";

  const cover =
    item.cover ||
    item.imageUrl ||
    item.albumCover ||
    item.album?.images?.[0]?.url ||
    "";

  const durationMs = item.durationMs || item.duration_ms || 0;

  const releaseDate =
    item.releaseDate || item.release_date || item.album?.release_date || "-";

  const id = item.id || item.trackId || item.spotifyId || `${title}-${artist}`;
  const uri = item.uri || (id ? `spotify:track:${id}` : "");

  return {
    id,
    uri,
    title,
    artist,
    releaseDate,
    durationMs,
    cover,
  };
}

// =========================
// 데이터 요청 함수
// =========================
async function getTracks(apiUrl, page, limit) {
  const url = new URL(apiUrl, window.location.origin);

  url.searchParams.set("page", page);
  url.searchParams.set("limit", limit);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("곡 데이터 요청 실패");
  }

  return response.json();
}

// =========================
// 액션 버튼 생성 함수
// =========================
function createActionButton(track, actionType) {
  if (actionType === "playlist-remove") {
    return `
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
    `;
  }

  if (actionType === "like-remove") {
    return `
      <button
        type="button"
        class="playlist-track-remove-button"
        data-no-play
        data-track-id="${escapeHTML(track.id)}"
        aria-label="좋아요 삭제"
        title="삭제"
      >
        <img
          src="${HEART_ICON_PATH}"
          width="24"
          height="24"
          alt=""
        />
      </button>
    `;
  }

  return `
    <button
      type="button"
      class="song-action song-action--playlist"
      data-no-play
      data-add-song-playlist
      data-track="${escapeHTML(JSON.stringify(track))}"
      aria-label="플레이리스트 추가"
    >
      <img
        src="${PLAYLIST_ICON_PATH}"
        width="24"
        height="24"
        alt=""
      />
    </button>
  `;
}

// =========================
// 테이블 row 생성 함수
// =========================
function createSongRow(item, index, options = {}) {
  const { actionType = "playlist" } = options;

  const rowNumber = index + 1;
  const track = normalizeTrack(item);

  return `
    <tr
      class="song-row"
      data-play-track
      data-id="${escapeHTML(track.id)}"
      data-uri="${escapeHTML(track.uri)}"
      data-title="${escapeHTML(track.title)}"
      data-artist="${escapeHTML(track.artist)}"
      data-cover="${escapeHTML(track.cover)}"
    >
      <td>${rowNumber}</td>

      <td>
        <div class="song-info">
          <img
            class="song-info__cover"
            src="${escapeHTML(track.cover)}"
            alt=""
          />

          <div class="song-info__text">
            <span class="song-info__title">${escapeHTML(track.title)}</span>
            <span class="song-info__artist">${escapeHTML(track.artist)}</span>
          </div>
        </div>
      </td>

      <td>${escapeHTML(track.releaseDate)}</td>
      <td>${formatDuration(track.durationMs)}</td>

      <td>
        ${createActionButton(track, actionType)}
      </td>
    </tr>
  `;
}

// =========================
// 일반 곡 테이블 렌더링 함수
// 좋아요 페이지처럼 이미 데이터가 있는 경우 사용
// =========================
export function renderSongTable(tracks, options = {}) {
  const {
    actionType = "playlist",
    actionHeader = "Add",
    emptyMessage = "곡이 없습니다.",
  } = options;

  if (!tracks || tracks.length === 0) {
    return `<p>${escapeHTML(emptyMessage)}</p>`;
  }

  return `
    <table class="song-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Release Date</th>
          <th>Duration</th>
          <th>${escapeHTML(actionHeader)}</th>
        </tr>
      </thead>

      <tbody>
        ${tracks
          .map((track, index) =>
            createSongRow(track, index, {
              actionType,
            }),
          )
          .join("")}
      </tbody>
    </table>
  `;
}

// =========================
// 플레이리스트 추가 모달 렌더링 함수
// =========================
function renderAddPlaylistModal() {
  if (document.querySelector("#addPlaylistModal")) return;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div id="addPlaylistModal" class="add-playlist-modal" aria-hidden="true">
        <div
          class="add-playlist-modal__overlay"
          data-close-add-playlist-modal
        ></div>

        <div class="add-playlist-modal__content" role="dialog" aria-modal="true">
          <h2 class="add-playlist-modal__title">플레이리스트에 추가</h2>

          <p id="addPlaylistTrackTitle" class="add-playlist-modal__track"></p>

          <div id="addPlaylistList" class="add-playlist-modal__list"></div>

          <button
            type="button"
            class="add-playlist-modal__cancel"
            data-close-add-playlist-modal
          >
            취소
          </button>
        </div>
      </div>
    `,
  );
}

// =========================
// 플레이리스트 추가 모달 열기 함수
// =========================
function openAddPlaylistModal(track) {
  selectedTrack = track;

  const modal = document.querySelector("#addPlaylistModal");
  const trackTitle = document.querySelector("#addPlaylistTrackTitle");
  const playlistList = document.querySelector("#addPlaylistList");

  if (!modal || !trackTitle || !playlistList) return;

  const playlistNames = loadPlaylistNames();

  trackTitle.textContent = `${track.title} - ${track.artist}`;

  if (playlistNames.length === 0) {
    playlistList.innerHTML = `
      <p class="add-playlist-modal__empty">
        생성된 플레이리스트가 없습니다.
      </p>
    `;
  } else {
    playlistList.innerHTML = playlistNames
      .map((playlistName) => {
        return `
          <button
            type="button"
            class="add-playlist-modal__item"
            data-select-add-playlist="${escapeHTML(playlistName)}"
          >
            <span class="add-playlist-modal__item-icon">♪</span>
            <span>${escapeHTML(playlistName)}</span>
          </button>
        `;
      })
      .join("");
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

// =========================
// 플레이리스트 추가 모달 닫기 함수
// =========================
function closeAddPlaylistModal() {
  const modal = document.querySelector("#addPlaylistModal");

  if (!modal) return;

  selectedTrack = null;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

// =========================
// 선택한 플레이리스트에 곡 추가 함수
// =========================
function addSelectedTrackToPlaylist(playlistName) {
  if (!selectedTrack) return;

  const result = addTrackToPlaylist(playlistName, selectedTrack);

  alert(result.message);
  closeAddPlaylistModal();
}

// =========================
// 공통 플레이리스트 추가 이벤트
// =========================
function initSongTableEvents() {
  if (isSongTableEventBound) return;

  isSongTableEventBound = true;

  document.addEventListener(
    "click",
    (event) => {
      const playlistButton = event.target.closest("[data-add-song-playlist]");
      const closeModalButton = event.target.closest(
        "[data-close-add-playlist-modal]",
      );
      const selectPlaylistButton = event.target.closest(
        "[data-select-add-playlist]",
      );

      if (playlistButton) {
        event.preventDefault();
        event.stopPropagation();

        const track = parseTrackData(playlistButton.dataset.track);

        if (!track) return;

        openAddPlaylistModal(track);
        return;
      }

      if (closeModalButton) {
        event.preventDefault();

        closeAddPlaylistModal();
        return;
      }

      if (selectPlaylistButton) {
        event.preventDefault();

        const playlistName = selectPlaylistButton.dataset.selectAddPlaylist;

        addSelectedTrackToPlaylist(playlistName);
      }
    },
    true,
  );

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    closeAddPlaylistModal();
  });
}

// =========================
// 곡 추가 렌더링 함수
// =========================
async function renderMoreSongs({
  apiUrl,
  tableBodyId,
  observerId,
  loadingId,
  limit = DEFAULT_LIMIT,
}) {
  if (isLoading || !hasMore) return;

  const tableBody = document.querySelector(`#${tableBodyId}`);
  const observerTarget = document.querySelector(`#${observerId}`);

  if (!tableBody) return;

  isLoading = true;
  setLoading(loadingId, true);

  try {
    const tracks = await getTracks(apiUrl, currentPage, limit);

    if (tracks.length === 0) {
      hasMore = false;
      observerTarget?.remove();
      return;
    }

    const startIndex = currentPage * limit;

    tableBody.insertAdjacentHTML(
      "beforeend",
      tracks
        .map((item, index) => createSongRow(item, startIndex + index))
        .join(""),
    );

    currentPage++;

    if (tracks.length < limit) {
      hasMore = false;
      observerTarget?.remove();
    }
  } catch (error) {
    console.error("곡 데이터 로딩 실패:", error);
    hasMore = false;
    observerTarget?.remove();
  } finally {
    isLoading = false;
    setLoading(loadingId, false);
  }
}

// =========================
// 공통 곡 테이블 페이지 HTML 렌더링 함수
// =========================
export function renderSongTablePage({
  title,
  description,
  tableBodyId,
  loadingId,
  observerId,
}) {
  return `
    <section class="song-table-page">
      <div class="song-table-page__header">
        <h2 class="song-table-page__title">${escapeHTML(title)}</h2>
        <p class="song-table-page__desc">${escapeHTML(description)}</p>
      </div>

      <table class="song-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Release Date</th>
            <th>Duration</th>
            <th>Add</th>
          </tr>
        </thead>

        <tbody id="${escapeHTML(tableBodyId)}"></tbody>
      </table>

      ${renderLoading(loadingId)}

      <div id="${escapeHTML(observerId)}" class="song-table-page__observer"></div>
    </section>
  `;
}

// =========================
// 공통 곡 테이블 페이지 초기화 함수
// =========================
export function initSongTablePage({
  apiUrl,
  tableBodyId,
  loadingId,
  observerId,
  limit = DEFAULT_LIMIT,
}) {
  currentPage = 0;
  isLoading = false;
  hasMore = true;
  selectedTrack = null;

  if (activeObserver) {
    activeObserver.disconnect();
    activeObserver = null;
  }

  renderAddPlaylistModal();
  initSongTableEvents();

  initTopButton({
    targetSelector: "#main",
    showAfter: 400,
  });

  const options = {
    apiUrl,
    tableBodyId,
    observerId,
    loadingId,
    limit,
  };

  renderMoreSongs(options);

  const observerTarget = document.querySelector(`#${observerId}`);
  const scrollRoot = document.querySelector("#main");

  activeObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        renderMoreSongs(options);
      }
    },
    {
      root: scrollRoot,
      rootMargin: "200px",
      threshold: 0,
    },
  );

  if (observerTarget) {
    activeObserver.observe(observerTarget);
  }
}
