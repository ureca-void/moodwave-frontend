import {
  renderSongTablePage,
  initSongTablePage,
} from "/src/js/components/songTable";

// =========================
// Popular 페이지 HTML 렌더링 함수
// =========================
export function renderPopularPage() {
  return renderSongTablePage({
    title: "Popular",
    description: "Check out the most popular music.",
    tableBodyId: "popularTableBody",
    loadingId: "popularLoading",
    observerId: "popularObserver",
  });
}

// =========================
// Popular 페이지 초기 실행 함수
// =========================
export function initPopularPage() {
  initSongTablePage({
    apiUrl: "http://localhost:8080/api/popular",
    tableBodyId: "popularTableBody",
    loadingId: "popularLoading",
    observerId: "popularObserver",
    limit: 10,
  });
}
