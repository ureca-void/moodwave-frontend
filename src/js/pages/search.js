import { ICON_PATH } from "../data.js";
import { HOME_API_URL } from "../config/api.js";
import { escapeHTML } from "../utils/escapeHTML.js";

// =========================
// 검색어 가져오기
// =========================
function getSearchKeyword() {
  const queryString = location.hash.split("?")[1];

  if (!queryString) return "";

  const params = new URLSearchParams(queryString);

  return params.get("q") || "";
}

// =========================
// 검색 상태 메시지 렌더링 함수
// =========================
function renderSearchMessage(message, className = "search-page__empty") {
  const searchResult = document.querySelector("#searchResult");

  if (!searchResult) return;

  searchResult.innerHTML = `
    <p class="${className}">${escapeHTML(message)}</p>
  `;
}

// =========================
// 검색 페이지 HTML 렌더링 함수
// =========================
export function renderSearch() {
  const keyword = getSearchKeyword();

  return `
    <section class="search-page">
      <h1 class="search-page__title">Search Results</h1>

      ${
        keyword
          ? `<p class="search-page__keyword">"${escapeHTML(keyword)}" 검색 결과</p>`
          : `<p class="search-page__keyword">검색어를 입력해주세요.</p>`
      }

      <div id="searchResult" class="section__grid">
        <p class="search-page__loading">검색 중...</p>
      </div>
    </section>
  `;
}

// =========================
// 검색 API 호출 함수
// =========================
async function fetchSearchTracks(keyword) {
  const response = await fetch(
    `${HOME_API_URL}/search?keyword=${encodeURIComponent(keyword)}`,
  );

  if (!response.ok) {
    throw new Error("SEARCH_API_ERROR");
  }

  return response.json();
}

// =========================
// 검색 결과 카드 생성 함수
// =========================
function createSearchCard(item) {
  const id = item.id || "";
  const uri = item.uri || (id ? `spotify:track:${id}` : "");
  const title = item.title || "Unknown Title";
  const artist = item.artist || item.description || "Unknown Artist";
  const cover = item.cover || "/assets/icon/logo.svg";

  return `
    <article
      class="music-card"
      data-play-track
      data-id="${escapeHTML(id)}"
      data-uri="${escapeHTML(uri)}"
      data-title="${escapeHTML(title)}"
      data-artist="${escapeHTML(artist)}"
      data-cover="${escapeHTML(cover)}"
    >
      <div class="music-card__image-wrap">
        <img 
          class="music-card__image" 
          src="${escapeHTML(cover)}" 
          alt="${escapeHTML(title)}" 
        />

        <button class="music-card__play" type="button" aria-label="재생">
          <img
            src="${ICON_PATH}Play_Greem Hover.svg"
            width="62"
            height="62"
            alt=""
          />
        </button>
      </div>

      <h3 class="music-card__title">${escapeHTML(title)}</h3>
      <p class="music-card__description">${escapeHTML(artist)}</p>
    </article>
  `;
}

// =========================
// 검색 결과 렌더링 함수
// =========================
function renderSearchResult(items) {
  const searchResult = document.querySelector("#searchResult");

  if (!searchResult) return;

  if (!items || items.length === 0) {
    renderSearchMessage("검색 결과가 없습니다.");
    return;
  }

  searchResult.innerHTML = items.map(createSearchCard).join("");
}

// =========================
// 검색 페이지 초기화 함수
// =========================
export async function initSearch() {
  const keyword = getSearchKeyword();

  if (!keyword) {
    renderSearchResult([]);
    return;
  }

  renderSearchMessage("검색 중...", "search-page__loading");

  try {
    const tracks = await fetchSearchTracks(keyword);

    renderSearchResult(tracks);
  } catch (error) {
    console.error("검색 데이터 조회 실패:", error);

    renderSearchMessage("검색 결과를 불러오지 못했습니다.");
  }
}
