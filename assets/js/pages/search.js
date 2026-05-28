import {
  ICON_PATH,
  midMixes,
  popularPlaylists,
  latestPlaylists,
} from "../data.js";

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

  const searchData = [
    ...midMixes.map((item) => ({
      title: item.title,
      description: "Playlist",
      cover: item.cover,
    })),
    ...popularPlaylists,
    ...latestPlaylists,
  ];

  const filteredItems = searchData.filter((item) => {
    const title = item.title.toLowerCase();
    const description = item.description.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();

    return title.includes(lowerKeyword) || description.includes(lowerKeyword);
  });

  return `
    <section class="search-page">
      <h1 class="search-page__title">Search Results</h1>

      ${
        keyword
          ? `<p class="search-page__keyword">"${keyword}" 검색 결과</p>`
          : `<p class="search-page__keyword">검색어를 입력해주세요.</p>`
      }

      <div class="section__grid">
        ${
          filteredItems.length > 0
            ? filteredItems
                .map(
                  (item) => `
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
                  `,
                )
                .join("")
            : `<p class="search-page__empty">검색 결과가 없습니다.</p>`
        }
      </div>
    </section>
  `;
}
