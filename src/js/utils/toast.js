// =========================
// Toast 컨테이너 생성 함수
// =========================
function getToastContainer() {
  let container = document.querySelector("#toastContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  return container;
}

// =========================
// Toast 제거 함수
// =========================
function removeToast(toast) {
  if (toast && toast.parentElement) {
    toast.remove();
  }
}

// =========================
// Toast 표시 함수
// =========================
export function showToast(message, duration = 1800) {
  const container = getToastContainer();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("is-show");
  });

  setTimeout(() => {
    toast.classList.remove("is-show");

    toast.addEventListener(
      "transitionend",
      () => {
        removeToast(toast);
      },
      { once: true },
    );

    // transitionend가 실행되지 않는 경우 대비
    setTimeout(() => {
      removeToast(toast);
    }, 300);
  }, duration);
}

// =========================
// 기존 alert를 Toast로 교체하는 함수
// =========================
export function initToast() {
  if (window.__toastInitialized) return;

  window.alert = (message) => {
    showToast(message);
  };

  window.__toastInitialized = true;
}
