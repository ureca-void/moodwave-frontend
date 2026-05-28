import { renderSidebar, initSidebar } from "./components/sidebar.js";
import { renderHeader, initHeader } from "./components/header.js";
import { renderFooter, initFooter } from "./components/footer.js";

import { renderHome, initHome } from "./pages/home.js";
import { renderSearch } from "./pages/search.js";

// =========================
// 페이지 라우터 함수
// =========================
function router() {
  const main = document.querySelector("#main");
  const hash = location.hash || "#/home";

  if (hash.startsWith("#/search")) {
    main.innerHTML = renderSearch();
    return;
  }

  main.innerHTML = renderHome();
  initHome();
}

// =========================
// 초기 실행 함수
// =========================
function init() {
  const sidebar = document.querySelector("#sidebar");
  const header = document.querySelector("#header");
  const footer = document.querySelector("#footer");

  // HTML 먼저 렌더링
  sidebar.innerHTML = renderSidebar();
  header.innerHTML = renderHeader();
  footer.innerHTML = renderFooter();

  // 기능 실행
  initSidebar();
  initHeader();
  initFooter();

  // 페이지 렌더링
  router();

  // hash 변경 시 페이지 변경
  window.addEventListener("hashchange", router);
}

init();
