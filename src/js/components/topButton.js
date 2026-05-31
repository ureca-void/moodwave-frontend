let activeScrollTarget = null;
let activeScrollHandler = null;

// =========================
// Top 버튼 렌더링 함수
// =========================
function renderTopButton(buttonId) {
  if (document.querySelector(`#${buttonId}`)) return;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <button
        id="${buttonId}"
        class="top-button"
        type="button"
        aria-label="맨 위로 이동"
      >
        ↑
      </button>
    `,
  );
}

// =========================
// 스크롤 위치 가져오기
// =========================
function getScrollTop(scrollTarget) {
  if (scrollTarget === window) {
    return window.scrollY;
  }

  return scrollTarget.scrollTop;
}

// =========================
// 맨 위로 이동
// =========================
function scrollToTop(scrollTarget) {
  if (scrollTarget === window) {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    return;
  }

  scrollTarget.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// =========================
// Top 버튼 초기화 함수
// =========================
export function initTopButton({
  buttonId = "topButton",
  targetSelector = "#main",
  showAfter = 400,
} = {}) {
  renderTopButton(buttonId);

  const button = document.querySelector(`#${buttonId}`);
  const scrollTarget = document.querySelector(targetSelector) || window;

  if (!button) return;

  if (activeScrollTarget && activeScrollHandler) {
    activeScrollTarget.removeEventListener("scroll", activeScrollHandler);
  }

  activeScrollTarget = scrollTarget;

  activeScrollHandler = () => {
    const scrollTop = getScrollTop(scrollTarget);

    button.classList.toggle("is-visible", scrollTop > showAfter);
  };

  button.onclick = () => {
    scrollToTop(scrollTarget);
  };

  scrollTarget.addEventListener("scroll", activeScrollHandler);

  activeScrollHandler();
}
