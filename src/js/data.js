// =========================
// 공통 경로
// =========================
export const ICON_PATH = "/assets/icon/";

// =========================
// 기본 이미지
// =========================
export const placeholder = {
  avatar:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 34 34'%3E%3Ccircle cx='17' cy='17' r='17' fill='%23999999'/%3E%3Ccircle cx='17' cy='13' r='5' fill='%23ffffff'/%3E%3Cpath d='M8 28c1.5-5 5-8 9-8s7.5 3 9 8' fill='%23ffffff'/%3E%3C/svg%3E",

  cover82:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='82' height='82' viewBox='0 0 82 82'%3E%3Crect width='82' height='82' fill='%23999999'/%3E%3C/svg%3E",

  cover182:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='182' height='182' viewBox='0 0 182 182'%3E%3Crect width='182' height='182' fill='%23999999'/%3E%3C/svg%3E",
};

// =========================
// 사이드바 메인 메뉴
// =========================
export const navItems = [
  {
    label: "Home",
    icon: "Home_Fill_S.svg",
    href: "#/home",
  },
  {
    label: "Weather Vibes",
    icon: "weather.svg",
    href: "#/weather",
  },
  {
    label: "Your Status",
    icon: "status.svg",
    href: "#/chart",
  },
  {
    label: "Emotion",
    icon: "Library_Fill_S.svg",
    href: "#/emotion",
  },
];

// =========================
// 플레이리스트 메뉴
// =========================
export const playlistMenuItems = [
  {
    label: "Create Playlist",
    icon: "+Library_S.svg",
  },
  {
    label: "Liked Songs",
    icon: "Liked Songs_S.svg",
    href: "#/liked",
  },
];

// =========================
// 기본 사용자 정보
// =========================
export const user = {
  name: "HAEJUNPARK",
  avatar: placeholder.avatar,
};
