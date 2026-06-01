import { renderSongTable, initSongTable } from "../components/songTable.js";
import { playlistMap, weatherTracks } from "../data.js";

// =========================
// Weather Playlist 페이지 HTML 렌더링
// =========================
export function renderWeatherPlaylistPage() {
  return `
    <!-- 플레이리스트 히어로 섹션 -->
    <div class="playlist-hero-container">
      <div class="playlist-cover" id="weatherPlaylistCover"></div>

      <div class="playlist-info">
        <p class="section-label" id="weatherPlaylistLabel">
          PUBLIC PLAYLIST
        </p>

        <h1 class="playlist-title" id="weatherPlaylistTitle">
          Overcast Vibes
        </h1>

        <p class="playlist-desc" id="weatherPlaylistDesc">
          차분하게 하루를 정리하고 싶을 때
        </p>

        <p class="playlist-genre" id="weatherPlaylistGenre">
          Lo-fi • Jazz • Acoustic
        </p>
      </div>
    </div>

    <div class="playlist-content-container">
      <div class="playlist-actions">
        <div class="playlist-actions-btn">
          <button type="button" class="play-btn">
            <img src="/assets/icon/Play_Greem Hover.svg" alt="" />
          </button>

          <button type="button" class="liked-btn">
            <img src="/assets/icon/Heart_XS.svg" alt="" />
          </button>

          <button type="button" class="download-btn">
            <img src="/assets/icon/Download_XS.svg" alt="" />
          </button>
        </div>

        <button type="button" class="playlist-sort">
          Custom order
          <img src="/assets/icon/sort-btn.svg" alt="" class="sort-icon" />
        </button>
      </div>

      <!-- 플레이리스트 목록 -->
      <section class="playlist-section">
        <div class="playlist-list" id="weatherPlaylistSongTable"></div>
      </section>
    </div>
  `;
}

// =========================
// Weather Playlist 페이지 초기화
// =========================
export function initWeatherPlaylistPage() {
  const playlistType = getPlaylistTypeFromHash();
  const playlist = playlistMap[playlistType];

  if (!playlist) {
    renderEmptyPlaylist();
    return;
  }

  renderPlaylistHero(playlist);
  renderWeatherTracks(playlistType, playlist);
  initSongTable();

  console.log("Weather Playlist page loaded");
}

// =========================
// hash에서 playlist 값 가져오기
// 예: #/weather-playlist?playlist=Rain
// =========================
function getPlaylistTypeFromHash() {
  const queryString = location.hash.split("?")[1];
  const params = new URLSearchParams(queryString);

  const playlistType = params.get("playlist");

  if (playlistMap[playlistType]) {
    return playlistType;
  }

  return "Rain";
}

// =========================
// 히어로 섹션 렌더링
// =========================
function renderPlaylistHero(playlist) {
  const playlistCover = document.querySelector("#weatherPlaylistCover");
  const playlistLabel = document.querySelector("#weatherPlaylistLabel");
  const playlistTitle = document.querySelector("#weatherPlaylistTitle");
  const playlistDesc = document.querySelector("#weatherPlaylistDesc");
  const playlistGenre = document.querySelector("#weatherPlaylistGenre");

  if (
    !playlistCover ||
    !playlistLabel ||
    !playlistTitle ||
    !playlistDesc ||
    !playlistGenre
  ) {
    return;
  }

  playlistLabel.textContent = playlist.label;
  playlistTitle.textContent = playlist.title;
  playlistDesc.textContent = playlist.desc;
  playlistGenre.textContent = playlist.genre;

  playlistCover.style.backgroundImage = `url(${playlist.image})`;
  playlistCover.style.backgroundSize = "cover";
  playlistCover.style.backgroundPosition = "center";
}

// =========================
// 재생시간 문자열을 ms로 변환
// 예: "4:12" -> 252000
// =========================
function convertDurationToMs(duration) {
  if (!duration) return 0;

  const [minutes, seconds] = duration.split(":").map(Number);

  if (Number.isNaN(minutes) || Number.isNaN(seconds)) {
    return 0;
  }

  return (minutes * 60 + seconds) * 1000;
}

// =========================
// songTable.js에 맞는 곡 데이터로 변환
// =========================
function convertToSongTableTracks(tracks, playlistType, playlist) {
  return tracks.map((track) => ({
    id: `${playlistType}-${track.id}`,
    title: track.title,
    artist: track.artist,
    durationMs: convertDurationToMs(track.duration),
    cover: playlist.image,
    releaseDate: playlist.weather,
    album: playlist.title,
  }));
}

// =========================
// 날씨 플레이리스트 곡 목록 렌더링
// songTable.js 사용
// =========================
function renderWeatherTracks(playlistType, playlist) {
  const tableContainer = document.querySelector("#weatherPlaylistSongTable");
  const tracks = weatherTracks[playlistType] || [];

  if (!tableContainer) return;

  const songTableTracks = convertToSongTableTracks(
    tracks,
    playlistType,
    playlist,
  );

  tableContainer.innerHTML = renderSongTable(songTableTracks, {
    actionType: "playlist",
    actionHeader: "Add",
    emptyMessage: "아직 추천된 곡이 없습니다.",
  });
}

// =========================
// 비어있는 플레이리스트 처리
// =========================
function renderEmptyPlaylist() {
  const main = document.querySelector("#main");

  if (!main) return;

  main.innerHTML = `
    <section class="playlist-section">
      <p class="empty-state">존재하지 않는 플레이리스트입니다.</p>
    </section>
  `;
}
