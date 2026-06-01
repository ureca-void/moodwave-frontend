const API_BASE_URL = "http://127.0.0.1:8080";

// =========================
// HTML 특수문자 변환 함수
// =========================
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => {
    const escapeMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return escapeMap[char];
  });
}

export function renderEmotion() {
  return `
    <section class="emotion-page">
      <div class="emotion-page__header">
        <p class="emotion-page__eyebrow">AI Mood Recommendation</p>
        <h1 class="emotion-page__title">오늘의 감정에 맞는 음악 추천</h1>
        <p class="emotion-page__desc">
          지금 기분을 문장으로 입력하면 AI가 감정을 분석하고 어울리는 음악을 추천해줘요.
        </p>
      </div>

      <div class="emotion-box">
        <textarea
          id="emotionInput"
          class="emotion-box__textarea"
          placeholder="예: 오늘 너무 지치고 아무것도 하기 싫어"
        ></textarea>

        <button id="emotionRecommendBtn" class="emotion-box__button">
          음악 추천받기
        </button>
      </div>

      <div id="emotionResult" class="emotion-result"></div>
      <div id="emotionTrackGrid" class="emotion-track-grid"></div>
    </section>
  `;
}

export function initEmotion() {
  const input = document.querySelector("#emotionInput");
  const button = document.querySelector("#emotionRecommendBtn");
  const result = document.querySelector("#emotionResult");
  const trackGrid = document.querySelector("#emotionTrackGrid");

  if (!input || !button || !result || !trackGrid) {
    return;
  }

  button.addEventListener("click", async () => {
    const text = input.value.trim();

    if (!text) {
      alert("감정을 입력해주세요.");
      return;
    }

    button.disabled = true;
    button.textContent = "추천 중...";
    result.innerHTML = `<p class="emotion-result__loading">감정을 분석하고 있어요...</p>`;
    trackGrid.innerHTML = "";

    try {
      const response = await fetch(`${API_BASE_URL}/api/emotion/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("감정 추천 API 요청 실패");
      }

      const data = await response.json();

      console.log("감정 추천 결과:", data);

      renderEmotionResult(data);
      renderEmotionTracks(data.tracks || []);
    } catch (error) {
      console.error(error);

      result.innerHTML = `
        <p class="emotion-result__error">
          음악 추천 중 오류가 발생했어요.
        </p>
      `;
    } finally {
      button.disabled = false;
      button.textContent = "음악 추천받기";
    }
  });
}

function renderEmotionResult(data) {
  const result = document.querySelector("#emotionResult");

  if (!result) return;

  const moodLabel = data.moodLabel || "알 수 없음";
  const reason = data.reason || "";
  const keywords = data.keywords || [];

  result.innerHTML = `
    <div class="emotion-result__card">
      <p class="emotion-result__label">분석된 감정</p>
      <h2 class="emotion-result__mood">${escapeHTML(moodLabel)}</h2>
      <p class="emotion-result__reason">${escapeHTML(reason)}</p>

      <div class="emotion-result__keywords">
        ${keywords
          .map((keyword) => `<span>${escapeHTML(keyword)}</span>`)
          .join("")}
      </div>
    </div>
  `;
}

function renderEmotionTracks(tracks) {
  const trackGrid = document.querySelector("#emotionTrackGrid");

  if (!trackGrid) return;

  if (!tracks.length) {
    trackGrid.innerHTML = `
      <p class="emotion-track-grid__empty">
        추천 곡을 찾지 못했어요. 잠시 후 다시 시도해주세요.
      </p>
    `;
    return;
  }

  trackGrid.innerHTML = tracks
    .map((track) => {
      const id = track.id || "";
      const uri = track.uri || (id ? `spotify:track:${id}` : "");
      const cover =
        track.cover || track.imageUrl || "/assets/img/default-album.png";
      const title = track.title || track.name || "Unknown Title";
      const artist =
        track.artist ||
        track.description ||
        track.artistName ||
        "Unknown Artist";

      return `
        <article
          class="emotion-track-card"
          data-play-track
          data-id="${escapeHTML(id)}"
          data-uri="${escapeHTML(uri)}"
          data-title="${escapeHTML(title)}"
          data-artist="${escapeHTML(artist)}"
          data-cover="${escapeHTML(cover)}"
        >
          <img
            class="emotion-track-card__image"
            src="${escapeHTML(cover)}"
            alt="${escapeHTML(title)}"
          />

          <div class="emotion-track-card__body">
            <h3 class="emotion-track-card__title">${escapeHTML(title)}</h3>
            <p class="emotion-track-card__artist">${escapeHTML(artist)}</p>
          </div>
        </article>
      `;
    })
    .join("");
}
