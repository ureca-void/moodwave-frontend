import { API_BASE_URL } from "../config/api.js";

// =========================
// 유효한 로그인 사용자 여부 확인 함수
// =========================
function isValidUser(user) {
  if (!user) return false;

  if (user === "anonymousUser") return false;

  if (typeof user !== "object") return false;

  return Boolean(
    user.id || user.email || user.spotifyId || user.displayName || user.name,
  );
}

// =========================
// 로그인 여부 확인 함수
// =========================
export async function isLoggedIn() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return false;
    }

    const user = await response.json();

    return isValidUser(user);
  } catch (error) {
    console.error("로그인 확인 실패:", error);
    return false;
  }
}

// =========================
// 로그인 페이지 이동 함수
// =========================
export function moveToLogin() {
  window.location.href = `${API_BASE_URL}/oauth2/authorization/spotify`;
}

// =========================
// 로그인 필요 처리 함수
// =========================
export async function requireLogin(message = "로그인 후 이용할 수 있습니다.") {
  const loggedIn = await isLoggedIn();

  if (loggedIn) {
    return true;
  }

  alert(message);
  moveToLogin();

  return false;
}
