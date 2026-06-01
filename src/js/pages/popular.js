import {
  renderSongTablePage,
  initSongTablePage,
} from "../components/songTable.js";

import { API_BASE_URL } from "../config/api.js";

// =========================
// Popular 페이지 설정
// =========================
const popularPageConfig = {
  title: "Popular",
  description: "Check out the most popular music.",
  tableBodyId: "popularTableBody",
  loadingId: "popularLoading",
  observerId: "popularObserver",
};

// =========================
// Popular 페이지 HTML 렌더링 함수
// =========================
export function renderPopularPage() {
  return renderSongTablePage(popularPageConfig);
}

// =========================
// Popular 페이지 초기 실행 함수
// =========================
export function initPopularPage() {
  initSongTablePage({
    ...popularPageConfig,
    apiUrl: `${API_BASE_URL}/api/popular`,
    limit: 10,
  });
}
