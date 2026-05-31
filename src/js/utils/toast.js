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
        toast.remove();
      },
      { once: true },
    );
  }, duration);
}

// =========================
// 기존 alert를 Toast로 교체하는 함수
// =========================
export function initToast() {
  window.alert = (message) => {
    showToast(message);
  };
}
