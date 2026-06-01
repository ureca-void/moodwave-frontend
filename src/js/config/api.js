// =========================
// API 기본 설정
// =========================
export const API_BASE_URL = "http://127.0.0.1:8080";

// =========================
// 개별 API URL
// =========================
export const HOME_API_URL = `${API_BASE_URL}/api/home`;
export const LIKE_API_URL = `${API_BASE_URL}/api/like`;
export const LATEST_API_URL = `${API_BASE_URL}/api/latest`;
export const POPULAR_API_URL = `${API_BASE_URL}/api/popular`;
export const EMOTION_RECOMMEND_API_URL = `${API_BASE_URL}/api/emotion/recommend`;

export const USER_API_URL = `${API_BASE_URL}/api/user`;
export const SPOTIFY_LOGIN_API_URL = `${API_BASE_URL}/oauth2/authorization/spotify`;
export const LOGOUT_API_URL = `${API_BASE_URL}/logout`;

// =========================
// API 엔드포인트 모음
// =========================
export const API_ENDPOINTS = {
  home: HOME_API_URL,
  like: LIKE_API_URL,
  latest: LATEST_API_URL,
  popular: POPULAR_API_URL,
  emotionRecommend: EMOTION_RECOMMEND_API_URL,

  user: USER_API_URL,
  spotifyLogin: SPOTIFY_LOGIN_API_URL,
  logout: LOGOUT_API_URL,
};
