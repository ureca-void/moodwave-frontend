import {
  renderSongTablePage,
  initSongTablePage,
} from "/src/js/components/songTable";

// =========================
// Latest 페이지 HTML 렌더링 함수
// =========================
export function renderLatestPage() {
  return renderSongTablePage({
    title: "Latest",
    description: "Check out the latest music.",
    tableBodyId: "latestTableBody",
    loadingId: "latestLoading",
    observerId: "latestObserver",
  });
}

// =========================
// Latest 페이지 초기 실행 함수
// =========================
export function initLatestPage() {
  initSongTablePage({
    apiUrl: "http://localhost:8080/api/latest",
    tableBodyId: "latestTableBody",
    loadingId: "latestLoading",
    observerId: "latestObserver",
    limit: 10,
  });
}
