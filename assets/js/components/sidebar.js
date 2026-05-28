import { ICON_PATH, navItems, playlistMenuItems, playlists } from "../data.js";

// =========================
// 사이드바 HTML 렌더링 함수
// =========================
export function renderSidebar() {
  return `
    <div class="sidebar__header">
      <!-- 로고 -->
      <div class="sidebar__brand">
        <a href="index.html" class="sidebar__brand-link">
          <img src="/assets/icon/logo.svg" alt="MOOD WAVE 로고" />
          <span>MOOD WAVE</span>
        </a>
      </div>

      <!-- 주요 메뉴 -->
      <nav
        id="primaryNav"
        class="sidebar__nav-primary"
        aria-label="주요 메뉴"
      ></nav>

      <!-- 플레이리스트 메뉴 -->
      <nav
        id="secondaryNav"
        class="sidebar__nav-secondary"
        aria-label="플레이리스트 메뉴"
      ></nav>
    </div>

    <div class="sidebar__divider" aria-hidden="true"></div>

    <!-- 플레이리스트 목록 -->
    <div id="playlistList" class="sidebar__playlist-list"></div>
  `;
}

// =========================
// 메뉴 아이템 작성 함수
// =========================
function createNavItem(item) {
  return `
    <a href="${item.href}" class="sidebar__nav-item">
      <img
        class="sidebar__icon"
        src="${ICON_PATH}${item.icon}"
        width="32"
        height="32"
        alt=""
      />
      <span class="sidebar__label">${item.label}</span>
    </a>
  `;
}

// =========================
// 메뉴 렌더링 함수
// =========================
function renderNav() {
  const primaryNav = document.querySelector("#primaryNav");
  const secondaryNav = document.querySelector("#secondaryNav");

  primaryNav.innerHTML = navItems.map(createNavItem).join("");
  secondaryNav.innerHTML = playlistMenuItems.map(createNavItem).join("");
}

// =========================
// 플레이리스트 목록 렌더링 함수
// =========================
function renderPlaylists() {
  const playlistList = document.querySelector("#playlistList");

  playlistList.innerHTML = playlists
    .map((playlist) => {
      return `
        <a href="#" class="sidebar__playlist-item">
          ${playlist}
        </a>
      `;
    })
    .join("");
}

// =========================
// 사이드바 초기 실행 함수
// =========================
export function initSidebar() {
  renderNav();
  renderPlaylists();
}
