const API_BASE_URL = "http://127.0.0.1:8080";

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

    console.log("로그인 확인 결과:", user);

    // user가 없으면 비로그인
    if (!user) {
      return false;
    }

    // Spring Security에서 비로그인인데 anonymousUser가 올 경우 방지
    if (user === "anonymousUser") {
      return false;
    }

    // 객체가 아닌 이상한 값이면 비로그인 처리
    if (typeof user !== "object") {
      return false;
    }

    // 실제 로그인 사용자 정보가 없으면 비로그인 처리
    if (
      !user.id &&
      !user.email &&
      !user.spotifyId &&
      !user.displayName &&
      !user.name
    ) {
      return false;
    }

    return true;
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
