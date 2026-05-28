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
const API = "http://127.0.0.1:8080/api/user";
let profileBox;

// 유저 렌더링 함수
function renderUser() {
  fetch(API, {
    method: "GET",
    credentials: "include",
    // 브라우저가 자동 리다이렉트(302)를 따라가지 않도록 설정
    redirect: "manual",
  })
    .then((response) => {
      // 1. 정상 응답 (200 OK)
      if (response.ok) {
        return response.json();
      }

      // 2. 인증 안됨 (401) 또는 리다이렉트 감지 (0 또는 302)
      // redirect: "manual" 설정 시 리다이렉트는 response.type이 'opaqueredirect'가 됩니다.
      if (response.status === 401 || response.type === "opaqueredirect") {
        throw new Error("UNAUTHORIZED");
      }

      throw new Error("NETWORK_ERROR");
    })
    .then((data) => {
      if (data && data.isLoggedIn) {
        // 로그인 성공 UI

        document.querySelector("#userName").textContent = data.name;
        if (data.avatar === null) {
          document.querySelector("#userAvatar").src = user.avatar;
        } else {
          document.querySelector("#userAvatar").src = data.avatar;
        }
      } else {
        showLoginButton();
      }
    })
    .catch((error) => {
      console.error("인증 정보를 가져오는 데 실패했습니다:", error);

      if (error.message === "UNAUTHORIZED") {
        alert("로그인 세션이 만료되었습니다. 다시 로그인해 주세요.");
        showLoginButton();
      } else {
        showLoginButton();
      }
    });
}

//로그인 버튼 보여주기
function showLoginButton() {
  profileBox.classList.toggle("is-logged-out");
  const nameTag = document.querySelector("#userName");
  nameTag.textContent = nameTag.textContent === "연동" ? user.name : "연동";
}
//로그아웃 함수
function logout(e) {
  // 1. 이벤트 객체(e)가 있어야 전파를 막을 수 있습니다.
  if (e) {
    e.preventDefault(); // 혹시 모를 기본 동작 방지
    e.stopPropagation(); // ⭐ 부모(profileBox)의 로그인 클릭 이벤트로 퍼지는 것을 방지
  }

  const currentUrl = window.location.href;
  // 백엔드로 로그아웃 요청
  location.href = `http://127.0.0.1:8080/logout?redirect=${encodeURIComponent(currentUrl)}`;
  alert("로그아웃 되었습니다.");
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
  // const headerContainer = document.querySelector("#header"); // HTML에 이 ID를 가진 태그가 있어야 함
  // if (headerContainer) {
  //   headerContainer.innerHTML = renderHeader();
  // }
  profileBox = document.querySelector(".header__profile");
  profileBox.addEventListener("click", () => {
    // 클래스가 포함되어 있는지 확인
    if (profileBox.classList.contains("is-logged-out")) {
      window.location.href =
        "http://127.0.0.1:8080/oauth2/authorization/spotify";
    } else {
    }
  });

  const logoutBtn = profileBox.querySelector(".header__logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
  renderUser();
  initProfileDropdown();
  initSearchForm();
}
