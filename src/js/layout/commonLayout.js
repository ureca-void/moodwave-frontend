import { renderSidebar, initSidebar } from "../components/sidebar.js";
import { renderHeader, initHeader } from "../components/header.js";
import { renderFooter, initFooter } from "../components/footer.js";

// =========================
// 공통 레이아웃 렌더링 함수
// =========================
export function renderCommonLayout() {
  const sidebar = document.querySelector("#sidebar");
  const header = document.querySelector("#header");
  const footer = document.querySelector("#footer");

  if (sidebar) {
    sidebar.innerHTML = renderSidebar();
    initSidebar();
  }

  if (header) {
    header.innerHTML = renderHeader();
    initHeader();
  }

  if (footer) {
    footer.innerHTML = renderFooter();
    initFooter();
  }
}
