import { ICON_PATH } from "../data.js";

// =========================
// 홈 데이터 요청 함수
// =========================
async function getHomeData() {
  const response = await fetch("http://localhost:8080/api/home");

  if (!response.ok) {
    throw new Error("홈 데이터 요청 실패");
  }

  return response.json();
}

// =========================
// 홈 HTML 렌더링 함수
// =========================
export function renderHome() {
  return `
    <h1 id="greeting" class="main__greeting"></h1>

    <div id="midMixes" class="mid-mixes"></div>

    <section class="section">
      <div class="section__header">
        <h2 class="section__title">Popular</h2>
        <button type="button" id="popularSeeAllBtn" class="section__see-all">
          SEE ALL
        </button>
      </div>

      <div id="popularGrid" class="section__grid"></div>
    </section>

    <section class="section">
      <div class="section__header">
        <h2 class="section__title">Latest</h2>
        <button type="button" id="latestSeeAllBtn" class="section__see-all">
          SEE ALL
        </button>
      </div>

      <div id="latestGrid" class="section__grid"></div>
    </section>
  `;
}

// =========================
// 중간 믹스 카드 생성 함수
// =========================
function createMidMixCard(item) {
  return `
    <article
      class="mid-mix"
      data-play-track
      data-id="${item.id || ""}"
      data-uri="${item.uri || ""}"
      data-title="${item.title || ""}"
      data-artist="${item.artist || item.description || ""}"
      data-cover="${item.cover || item.imageUrl || ""}"
    >
      <img
        class="mid-mix__cover"
        src="${item.cover || item.imageUrl || ""}"
        width="82"
        height="82"
        alt=""
      />

      <span class="mid-mix__title">${item.title}</span>

      <button class="mid-mix__play" type="button" aria-label="재생">
        <img
          src="${ICON_PATH}Play_Greem Hover.svg"
          width="62"
          height="62"
          alt=""
        />
      </button>
    </article>
  `;
}

// =========================
// 중간 믹스 렌더링 함수
// =========================
function renderMidMixes(data) {
  const midMixesElement = document.querySelector("#midMixes");
  const rowSize = 3;
  let html = "";

  if (!midMixesElement) return;

  for (let i = 0; i < data.length; i += rowSize) {
    const rowItems = data.slice(i, i + rowSize);

    html += `
      <div class="mid-mixes__row">
        ${rowItems.map(createMidMixCard).join("")}
      </div>
    `;
  }

  midMixesElement.innerHTML = html;
}

// =========================
// 그리드 카드 생성 함수
// =========================
function createGridCard(item) {
  return `
    <article
      class="grid-card"
      data-play-track
      data-id="${item.id || ""}"
      data-uri="${item.uri || ""}"
      data-title="${item.title || ""}"
      data-artist="${item.artist || item.description || ""}"
      data-cover="${item.cover || item.imageUrl || ""}"
    >
      <div class="grid-card__art-wrap">
        <img
          class="grid-card__art"
          src="${item.cover || item.imageUrl || ""}"
          width="182"
          height="182"
          alt=""
        />

        <button class="grid-card__play" type="button" aria-label="재생">
          <img
            src="${ICON_PATH}Play_Greem Hover.svg"
            width="62"
            height="62"
            alt=""
          />
        </button>
      </div>

      <div class="grid-card__info">
        <span class="grid-card__name">${item.title}</span>
        <span class="grid-card__desc">
          ${item.artist || item.description || ""}
        </span>
      </div>
    </article>
  `;
}

// =========================
// 그리드 렌더링 함수
// =========================
function renderGrid(selector, data) {
  const grid = document.querySelector(selector);

  if (!grid) return;

  grid.innerHTML = data.map(createGridCard).join("");
}

// =========================
// 인사말 렌더링 함수
// =========================
function renderGreeting() {
  const greeting = document.querySelector("#greeting");

  if (!greeting) return;

  greeting.textContent = "Ureca's Pick";
}

// =========================
// Mid Mix 스켈레톤 생성 함수
// =========================
function createMidMixSkeleton() {
  return `
    <article class="mid-mix mid-mix--skeleton">
      <span class="mid-mix__cover skeleton"></span>
      <span class="mid-mix__title-skeleton skeleton"></span>
    </article>
  `;
}

// =========================
// Mid Mix 스켈레톤 렌더링 함수
// =========================
function renderMidMixSkeleton(count = 6) {
  const rowSize = 3;
  let html = "";

  for (let i = 0; i < count; i += rowSize) {
    const rowItems = Array.from({
      length: Math.min(rowSize, count - i),
    });

    html += `
      <div class="mid-mixes__row">
        ${rowItems.map(createMidMixSkeleton).join("")}
      </div>
    `;
  }

  return html;
}

// =========================
// Grid Card 스켈레톤 생성 함수
// =========================
function createGridSkeleton() {
  return `
    <article class="grid-card grid-card--skeleton">
      <div class="grid-card__art-wrap">
        <span class="grid-card__art skeleton"></span>
      </div>

      <div class="grid-card__info">
        <span class="grid-card__name-skeleton skeleton"></span>
        <span class="grid-card__desc-skeleton skeleton"></span>
        <span class="grid-card__desc-skeleton grid-card__desc-skeleton--short skeleton"></span>
      </div>
    </article>
  `;
}

// =========================
// Grid Card 스켈레톤 렌더링 함수
// =========================
function renderGridSkeleton(count = 5) {
  return Array.from({ length: count }).map(createGridSkeleton).join("");
}

// =========================
// 홈 스켈레톤 렌더링 함수
// =========================
function renderHomeSkeleton() {
  const midMixesElement = document.querySelector("#midMixes");
  const popularGrid = document.querySelector("#popularGrid");
  const latestGrid = document.querySelector("#latestGrid");

  if (midMixesElement) {
    midMixesElement.innerHTML = renderMidMixSkeleton(6);
  }

  if (popularGrid) {
    popularGrid.innerHTML = renderGridSkeleton(5);
  }

  if (latestGrid) {
    latestGrid.innerHTML = renderGridSkeleton(5);
  }
}

// =========================
// SEE ALL 버튼 이벤트 등록 함수
// =========================
function bindSeeAllEvents() {
  const popularSeeAllBtn = document.querySelector("#popularSeeAllBtn");
  const latestSeeAllBtn = document.querySelector("#latestSeeAllBtn");

  popularSeeAllBtn?.addEventListener("click", () => {
    location.hash = "#/popular";
  });

  latestSeeAllBtn?.addEventListener("click", () => {
    location.hash = "#/latest";
  });
}

// =========================
// 홈 초기 실행 함수
// =========================
export async function initHome() {
  bindSeeAllEvents();
  renderGreeting();
  renderHomeSkeleton();

  try {
    const homeData = await getHomeData();

    console.log("백엔드 홈 데이터:", homeData);

    renderMidMixes(homeData.midMixes || []);
    renderGrid("#popularGrid", homeData.popular || []);
    renderGrid("#latestGrid", homeData.latest || []);
  } catch (error) {
    console.error(error);
  }
}
