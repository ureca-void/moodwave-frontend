// =========================
// Confirm 모달 생성 함수
// =========================
function createConfirmModal() {
  const modal = document.createElement("div");

  modal.className = "confirm-modal";
  modal.innerHTML = `
    <div class="confirm-modal__overlay"></div>

    <div class="confirm-modal__content" role="dialog" aria-modal="true">
      <h2 class="confirm-modal__title">확인</h2>

      <p class="confirm-modal__message"></p>

      <div class="confirm-modal__buttons">
        <button
          type="button"
          class="confirm-modal__button confirm-modal__button--cancel"
          data-confirm-cancel
        >
          취소
        </button>

        <button
          type="button"
          class="confirm-modal__button confirm-modal__button--confirm"
          data-confirm-ok
        >
          확인
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  return modal;
}

// =========================
// Confirm 표시 함수
// =========================
export function showConfirm(message, options = {}) {
  return new Promise((resolve) => {
    const modal = createConfirmModal();

    const title = modal.querySelector(".confirm-modal__title");
    const messageElement = modal.querySelector(".confirm-modal__message");
    const cancelButton = modal.querySelector("[data-confirm-cancel]");
    const confirmButton = modal.querySelector("[data-confirm-ok]");
    const overlay = modal.querySelector(".confirm-modal__overlay");

    let isClosed = false;

    title.textContent = options.title || "확인";
    messageElement.textContent = message;
    cancelButton.textContent = options.cancelText || "취소";
    confirmButton.textContent = options.confirmText || "확인";

    function handleKeydown(event) {
      if (event.key === "Escape") {
        close(false);
      }
    }

    function close(result) {
      if (isClosed) return;

      isClosed = true;
      modal.classList.remove("is-open");
      window.removeEventListener("keydown", handleKeydown);

      setTimeout(() => {
        modal.remove();
        resolve(result);
      }, 180);
    }

    cancelButton.addEventListener("click", () => close(false));
    confirmButton.addEventListener("click", () => close(true));
    overlay.addEventListener("click", () => close(false));
    window.addEventListener("keydown", handleKeydown);

    requestAnimationFrame(() => {
      modal.classList.add("is-open");
      confirmButton.focus();
    });
  });
}
