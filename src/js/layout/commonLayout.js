import { renderSidebar, initSidebar } from "../components/sidebar.js";
import { renderHeader, initHeader } from "../components/header.js";
import { renderFooter, initFooter } from "../components/footer.js";

// =========================
// 공통 영역 렌더링 함수
// =========================
function renderLayoutPart(selector, render, init) {
  const element = document.querySelector(selector);

  if (!element) return;

  element.innerHTML = render();
  init();
}

// =========================
// 공통 레이아웃 렌더링 함수
// =========================
export function renderCommonLayout() {
  renderLayoutPart("#sidebar", renderSidebar, initSidebar);
  renderLayoutPart("#header", renderHeader, initHeader);
  renderLayoutPart("#footer", renderFooter, initFooter);
}
