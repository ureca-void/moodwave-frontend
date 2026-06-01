import { user } from "../data.js";
import { requireLogin } from "../utils/auth.js";

// =========================
// API 주소
// =========================
const API_BASE_URL = "http://127.0.0.1:8080";

const API = `${API_BASE_URL}/api/user`;
const SPOTIFY_LOGIN_URL = `${API_BASE_URL}/oauth2/authorization/spotify`;
const LOGOUT_URL = `${API_BASE_URL}/logout`;

const SPOTIFY_LOGO_URL =
  "https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Black.png";

// =========================
// 헤더 HTML 렌더링 함수
// =========================
export function renderHeader() {
  return `
    <!-- 모바일 / 태블릿 햄버거 버튼 -->
    <button
      id="mobileMenuBtn"
      class="header__hamburger-btn"
      type="button"
      aria-label="사이드바 열기"
      aria-expanded="false"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- 메뉴 버튼 -->
    <button
      id="backBtn"
      class="header__nav-btn"
      type="button"
      aria-label="뒤로"
    >
      <img src="/assets/icon/Back.svg" width="40" height="40" alt="" />
    </button>
    <button
      id="forwardBtn"
      class="header__nav-btn"
      type="button"
      aria-label="앞으로"
    >
      <img src="/assets/icon/Forward.svg" width="40" height="40" alt="" />
    </button>

    <!-- 검색창 -->
    <form class="header__search" role="search">
      <img
        class="header__search-icon"
        src="/assets/icon/Search_S.svg"
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

    <!-- 로그인 / 프로필 영역 -->
    <div id="headerAuth" class="header__auth"></div>
  `;
}

// =========================
// Spotify 로그인 URL 생성 함수
// =========================
function getSpotifyLoginUrl() {
  const redirectUrl = window.location.href;

  return `${SPOTIFY_LOGIN_URL}?redirect=${encodeURIComponent(redirectUrl)}`;
}

// =========================
// 로그아웃 URL 생성 함수
// =========================
function getLogoutUrl() {
  const redirectUrl = window.location.href;

  return `${LOGOUT_URL}?redirect=${encodeURIComponent(redirectUrl)}`;
}

// =========================
// Spotify 연동 버튼 렌더링 함수
// =========================
function renderSpotifyConnectButton() {
  const headerAuth = document.querySelector("#headerAuth");
  if (!headerAuth) return;

  headerAuth.innerHTML = `
    <button id="spotifyConnectBtn" class="spotify-connect-btn" type="button">
      <img
        class="spotify-connect-btn__logo"
        src="${SPOTIFY_LOGO_URL}"
        alt="Spotify"
      />
      <strong>연동</strong>
    </button>
  `;

  const spotifyConnectBtn = document.querySelector("#spotifyConnectBtn");
  if (!spotifyConnectBtn) return;

  spotifyConnectBtn.addEventListener("click", () => {
    spotifyConnectBtn.disabled = true;

    spotifyConnectBtn.innerHTML = `
      <img
        class="spotify-connect-btn__logo"
        src="${SPOTIFY_LOGO_URL}"
        alt="Spotify"
      />
      <strong>연동 중...</strong>
    `;

    window.location.href = getSpotifyLoginUrl();
  });
}

// =========================
// Spotify 프로필 렌더링 함수
// =========================
function renderSpotifyProfile(data) {
  const headerAuth = document.querySelector("#headerAuth");
  if (!headerAuth) return;

  const avatar = data.avatar || user.avatar;
  const name = data.name || user.name;

  headerAuth.innerHTML = `
    <div class="header__profile">
      <img
        id="userAvatar"
        class="header__user-avatar"
        src="${avatar}"
        width="34"
        height="34"
        alt=""
      />

      <span id="userName" class="header__user-name">${name}</span>

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

  initProfileDropdown();
  initLogoutButton();
}

// =========================
// 유저 렌더링 함수
// =========================
function renderUser() {
  fetch(API, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }

      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }

      throw new Error("NETWORK_ERROR");
    })
    .then((data) => {
      if (data && data.isLoggedIn) {
        renderSpotifyProfile(data);
      } else {
        renderSpotifyConnectButton();
      }
    })
    .catch((error) => {
      console.error("인증 정보를 가져오는 데 실패했습니다:", error);
      renderSpotifyConnectButton();
    });
}

// =========================
// 로그아웃 함수
// =========================
function logout(event) {
  event.preventDefault();
  event.stopPropagation();

  alert("로그아웃 되었습니다.");

  window.location.href = getLogoutUrl();
}

// =========================
// 로그아웃 버튼 초기화 함수
// =========================
function initLogoutButton() {
  const logoutBtn = document.querySelector(".header__logout-btn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", logout);
}

// =========================
// 프로필 드롭다운 함수
// =========================
function initProfileDropdown() {
  const profile = document.querySelector(".header__profile");
  const profileArrowButton = document.querySelector(
    ".header__profile-arrow-btn",
  );

  if (!profile || !profileArrowButton) return;

  profileArrowButton.addEventListener("click", (event) => {
    event.stopPropagation();
    profile.classList.toggle("is-open");
  });
}

// =========================
// 검색창 기능 함수
// =========================
function initSearchForm() {
  const searchForm = document.querySelector(".header__search");
  const searchInput = document.querySelector(".header__search-input");

  if (!searchForm || !searchInput) return;

  let searchTimer = null;

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const keyword = searchInput.value.trim();

    if (!keyword) return;

    clearTimeout(searchTimer);
    location.hash = `#/search?q=${encodeURIComponent(keyword)}`;
  });

  searchInput.addEventListener("input", (event) => {
    const keyword = event.target.value.trim();

    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {
      if (!keyword) return;

      location.hash = `#/search?q=${encodeURIComponent(keyword)}`;
    }, 700);
  });
}

// =========================
// 뒤로가기 / 앞으로가기 버튼 기능 함수
// =========================
function initHistoryButtons() {
  const backBtn = document.querySelector("#backBtn");
  const forwardBtn = document.querySelector("#forwardBtn");

  if (!backBtn || !forwardBtn) return;

  backBtn.addEventListener("click", () => {
    window.history.back();
  });

  forwardBtn.addEventListener("click", () => {
    window.history.forward();
  });
}

// =========================
// 모바일 / 태블릿 사이드바 토글 함수
// =========================
function initMobileSidebar() {
  const mobileMenuBtn = document.querySelector("#mobileMenuBtn");
  const sidebar = document.querySelector(".sidebar");

  if (!mobileMenuBtn || !sidebar) return;

  let sidebarOverlay = document.querySelector(".sidebar-overlay");

  if (!sidebarOverlay) {
    sidebarOverlay = document.createElement("div");
    sidebarOverlay.className = "sidebar-overlay";
    document.body.appendChild(sidebarOverlay);
  }

  const openSidebar = () => {
    sidebar.classList.add("is-open");
    sidebarOverlay.classList.add("is-open");
    document.body.classList.add("is-sidebar-open");
    mobileMenuBtn.setAttribute("aria-expanded", "true");
  };

  const closeSidebar = () => {
    sidebar.classList.remove("is-open");
    sidebarOverlay.classList.remove("is-open");
    document.body.classList.remove("is-sidebar-open");
    mobileMenuBtn.setAttribute("aria-expanded", "false");
  };

  const toggleSidebar = () => {
    if (sidebar.classList.contains("is-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  mobileMenuBtn.addEventListener("click", toggleSidebar);
  sidebarOverlay.addEventListener("click", closeSidebar);

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) {
      closeSidebar();
    }
  });
}

// =========================
// 헤더 초기 실행 함수
// =========================
export function initHeader() {
  const headerContainer = document.querySelector("#header");

  if (headerContainer && !headerContainer.innerHTML.trim()) {
    headerContainer.innerHTML = renderHeader();
  }

  // 기본값: Spotify 연동 버튼
  renderSpotifyConnectButton();

  // 로그인 상태 확인 후, 로그인 상태면 프로필로 변경
  renderUser();

  initSearchForm();
  initHistoryButtons();
  initMobileSidebar();
}
