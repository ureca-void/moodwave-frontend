// =========================
// 공통 로딩 UI 렌더링 함수
// =========================
export function renderLoading(id = "pageLoading", text = "Loading...") {
  return `
    <div id="${id}" class="loading" hidden>
      <div class="loading__spinner"></div>
      <span>${text}</span>
    </div>
  `;
}

// =========================
// 공통 로딩 UI 표시/숨김 함수
// =========================
export function setLoading(id, isVisible) {
  const loading = document.querySelector(`#${id}`);

  if (!loading) return;

  loading.hidden = !isVisible;
}

// =========================
// 콘텐츠 표시/숨김 함수
// =========================
export function setContentVisible(id, isVisible) {
  const content = document.querySelector(`#${id}`);

  if (!content) return;

  content.hidden = !isVisible;
}
