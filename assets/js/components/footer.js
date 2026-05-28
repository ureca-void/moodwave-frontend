import { currentTrack } from "../data.js";

// =========================
// 푸터 HTML 렌더링 함수
// =========================
export function renderFooter() {
  return `
    <div class="player__track">
      <img
        id="currentCover"
        class="player__cover"
        src=""
        width="56"
        height="56"
        alt=""
      />

      <div class="player__meta">
        <span id="currentTitle" class="player__title"></span>
        <span id="currentArtist" class="player__artist"></span>
      </div>

      <button
        class="player__icon player__icon--like"
        type="button"
        aria-label="좋아요"
      >
        <img
          src="/assets/icon/Heart_Fill_XS.svg"
          width="28"
          height="28"
          alt=""
        />
      </button>
    </div>

    <div class="player__controls">
      <div class="player__buttons">
        <button class="player__icon" type="button" aria-label="셔플">
          <img
            src="/assets/icon/Shuffle_S.svg"
            width="32"
            height="32"
            alt=""
          />
        </button>

        <button class="player__icon" type="button" aria-label="이전">
          <img src="/assets/icon/Back.svg" width="32" height="32" alt="" />
        </button>

        <button
          class="player__icon player__icon--play"
          type="button"
          aria-label="일시정지"
        >
          <img
            src="/assets/icon/Pause_XS.svg"
            width="48"
            height="48"
            alt=""
          />
        </button>

        <button class="player__icon" type="button" aria-label="다음">
          <img
            src="/assets/icon/Forward.svg"
            width="32"
            height="32"
            alt=""
          />
        </button>

        <button class="player__icon" type="button" aria-label="반복">
          <img
            src="/assets/icon/Repeat_S.svg"
            width="32"
            height="32"
            alt=""
          />
        </button>
      </div>

      <div class="player__progress">
        <span id="currentTime" class="player__time"></span>
        <div class="player__bar">
          <span id="progressBar" class="player__bar-fill"></span>
        </div>
        <span id="durationTime" class="player__time"></span>
      </div>
    </div>

    <div class="player__extras">
      <div class="player__extras-tools">
        <button class="player__icon" type="button" aria-label="가사">
          <img
            src="/assets/icon/Component 2.svg"
            width="32"
            height="32"
            alt=""
          />
        </button>

        <button class="player__icon" type="button" aria-label="대기열">
          <img
            src="/assets/icon/Queue_XS.svg"
            width="32"
            height="32"
            alt=""
          />
        </button>

        <button class="player__icon" type="button" aria-label="연결 기기">
          <img
            src="/assets/icon/Devices_XS.svg"
            width="32"
            height="32"
            alt=""
          />
        </button>

        <button class="player__icon" type="button" aria-label="볼륨">
          <img
            src="/assets/icon/Volume_XS.svg"
            width="32"
            height="32"
            alt=""
          />
        </button>
      </div>

      <div class="player__volume">
        <span class="player__volume-fill"></span>
      </div>

      <button class="player__icon" type="button" aria-label="전체 화면">
        <img
          src="/assets/icon/FullScreen_S.svg"
          width="32"
          height="32"
          alt=""
        />
      </button>
    </div>
  `;
}

// =========================
// 현재 재생곡 렌더링 함수
// =========================
function renderCurrentTrack() {
  document.querySelector("#currentCover").src = currentTrack.cover;
  document.querySelector("#currentTitle").textContent = currentTrack.title;
  document.querySelector("#currentArtist").textContent = currentTrack.artist;
  document.querySelector("#currentTime").textContent = currentTrack.currentTime;
  document.querySelector("#durationTime").textContent = currentTrack.duration;
  document.querySelector("#progressBar").style.width = currentTrack.progress;
}

// =========================
// 푸터 초기 실행 함수
// =========================
export function initFooter() {
  renderCurrentTrack();
}
