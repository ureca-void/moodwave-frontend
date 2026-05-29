import { ICON_PATH } from "../data.js";

// =========================
// API 주소
// =========================
const API = "http://127.0.0.1:8080/api/home";

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
// 검색 페이지 HTML 렌더링 함수
// =========================
export function renderSearch() {
  const keyword = getSearchKeyword();

  return `
    <section class="search-page">
      <h1 class="search-page__title">Search Results</h1>

      ${
        keyword
          ? `<p class="search-page__keyword">"${keyword}" 검색 결과</p>`
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
    `${API}/search?keyword=${encodeURIComponent(keyword)}`,
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
  return `
    <article class="music-card">
      <div class="music-card__image-wrap">
        <img 
          class="music-card__image" 
          src="${item.cover}" 
          alt="${item.title}" 
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

      <h3 class="music-card__title">${item.title}</h3>
      <p class="music-card__description">${item.description}</p>
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
    searchResult.innerHTML = `
      <p class="search-page__empty">검색 결과가 없습니다.</p>
    `;
    return;
  }

  searchResult.innerHTML = items.map(createSearchCard).join("");
}

// =========================
// 검색 페이지 초기화 함수
// =========================
export async function initSearch() {
  const keyword = getSearchKeyword();
  const searchResult = document.querySelector("#searchResult");

  if (!keyword) {
    renderSearchResult([]);
    return;
  }

  if (searchResult) {
    searchResult.innerHTML = `
      <p class="search-page__loading">검색 중...</p>
    `;
  }

  try {
    const tracks = await fetchSearchTracks(keyword);
    renderSearchResult(tracks);
  } catch (error) {
    console.error("검색 데이터 조회 실패:", error);

    if (searchResult) {
      searchResult.innerHTML = `
        <p class="search-page__empty">검색 결과를 불러오지 못했습니다.</p>
      `;
    }
  }
}
