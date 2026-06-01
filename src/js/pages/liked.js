import { getSpotifyAccessToken } from "../components/footer.js";
import { renderSongTable } from "../components/songTable.js";

const API_BASE_URL = "http://127.0.0.1:8080";

// =========================
// 좋아요 페이지 HTML 렌더링
// =========================
export function renderLikedPage() {
  return `
    <section class="song-table-page liked-page">
      <div class="song-table-page__header">
        <h2 class="song-table-page__title">Liked Songs</h2>
        <p class="song-table-page__desc">
          내가 좋아요한 곡들을 확인할 수 있어요.
        </p>
      </div>

      <div id="list-container"></div>
    </section>
  `;
}

// =========================
// 좋아요 목록 불러오기
// =========================
async function loadLikedTracks() {
  const container = document.querySelector("#list-container");
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/like`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("좋아요 목록 요청 실패");
    }

    const likedItems = await response.json();

    if (!likedItems.length) {
      container.innerHTML = "<p>좋아요한 곡이 없습니다.</p>";
      return;
    }

    const token = await getSpotifyAccessToken();
    const tracks = [];

    for (const item of likedItems) {
      const id = item.musicId?.trim();

      if (!id) continue;

      const res = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error(await res.text());
        continue;
      }

      const track = await res.json();
      tracks.push(track);
    }

    container.innerHTML = renderSongTable(tracks, {
      actionType: "like-remove",
      actionHeader: "Like",
      emptyMessage: "좋아요한 곡이 없습니다.",
    });
  } catch (err) {
    console.error("좋아요 목록 로딩 실패:", err);
    container.innerHTML = "<p>좋아요 목록을 불러오지 못했습니다.</p>";
  }
}

// =========================
// 좋아요 취소
// =========================
async function removeLike(musicId) {
  const response = await fetch(`${API_BASE_URL}/api/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      musicId,
    }),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("좋아요 삭제 실패");
  }
}

// =========================
// 좋아요 페이지 초기화
// =========================
export function initLikedPage() {
  const container = document.querySelector("#list-container");

  if (!container) return;

  loadLikedTracks();

  container.addEventListener("click", async (e) => {
    const removeBtn = e.target.closest(".playlist-track-remove-button");

    if (!removeBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const musicId = removeBtn.dataset.trackId;

    if (!musicId) return;

    try {
      await removeLike(musicId);
      loadLikedTracks();
    } catch (err) {
      console.error("좋아요 삭제 실패:", err);
      alert("좋아요 삭제에 실패했습니다.");
    }
  });

  const likeButton = document.querySelector("#likeButton");
  likeButton.addEventListener("click", async (e) => {
    if (!likeButton) return;

    console.log("푸터좋아요 반영해서 재로드");
    loadLikedTracks();
  });
}
