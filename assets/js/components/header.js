import { user } from "../data.js";

// =========================
// 헤더 HTML 렌더링 함수
// =========================
export function renderHeader() {
  return `
    <!-- 메뉴 버튼 -->
    <button class="header__nav-btn" type="button" aria-label="뒤로">
      <img src="assets/icon/Back.svg" width="40" height="40" alt="" />
    </button>

    <button class="header__nav-btn" type="button" aria-label="앞으로">
      <img src="assets/icon/Forward.svg" width="40" height="40" alt="" />
    </button>

    <!-- 검색창 -->
    <form class="header__search" role="search">
      <img
        class="header__search-icon"
        src="assets/icon/Search_S.svg"
        width="32"
        height="32"
        alt=""
      />

      <input
        class="header__search-input"
        type="search"
        placeholder="Artists, songs, or podcasts"
      />
    </form>

    <span class="header__spacer" aria-hidden="true"></span>

    <!-- 프로필 -->
    <div class="header__profile">
      <img
        id="userAvatar"
        class="header__user-avatar"
        src=""
        width="34"
        height="34"
        alt=""
      />

      <span id="userName" class="header__user-name"></span>

      <!-- 드롭다운 버튼 -->
      <button
        class="header__profile-arrow-btn"
        type="button"
        aria-label="프로필 메뉴 열기"
      >
        <span class="header__profile-arrow" aria-hidden="true"></span>
      </button>

      <div class="header__dropdown">
        <button class="header__logout-btn" type="button">Logout</button>
      </div>
    </div>
  `;
}

// =========================
// 유저 렌더링 함수
// =========================
function renderUser() {
  const userName = document.querySelector("#userName");
  const userAvatar = document.querySelector("#userAvatar");

  userName.textContent = user.name;
  userAvatar.src = user.avatar;
}

// =========================
// 프로필 드롭다운 함수
// =========================
function initProfileDropdown() {
  const profile = document.querySelector(".header__profile");
  const profileArrowButton = document.querySelector(
    ".header__profile-arrow-btn",
  );

  profileArrowButton.addEventListener("click", () => {
    profile.classList.toggle("is-open");
  });
}

// =========================
// 검색창 기능 함수
// =========================
function initSearchForm() {
  const searchForm = document.querySelector(".header__search");
  const searchInput = document.querySelector(".header__search-input");

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const keyword = searchInput.value.trim();

    if (!keyword) return;

    location.hash = `#/search?q=${encodeURIComponent(keyword)}`;
  });
}

// =========================
// 헤더 초기 실행 함수
// =========================
export function initHeader() {
  renderUser();
  initProfileDropdown();
  initSearchForm();
}
