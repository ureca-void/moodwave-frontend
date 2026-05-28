// =========================
// 더미 데이터
// =========================
export const ICON_PATH = "/assets/icon/";

// 메뉴 목록
export const navItems = [
  {
    label: "Home",
    icon: "Home_Fill_S.svg",
    href: "#",
  },
  {
    label: "Search",
    icon: "Search_S.svg",
    href: "#",
  },
  {
    label: "Your Library",
    icon: "Library_S.svg",
    href: "#",
  },
];

// 플레이리스트 메뉴 목록
export const playlistMenuItems = [
  {
    label: "Create Playlist",
    icon: "+Library_S.svg",
    href: "#",
  },
  {
    label: "Liked Songs",
    icon: "Liked Songs_S.svg",
    href: "#",
  },
];

// 플레이리스트 목록
export const playlists = [
  "Chill Mix",
  "Insta Hits",
  "Your Top Songs 2021",
  "Mellow Songs",
  "Anime Lofi & Chillhop Music",
  "BG Afro “Select” Vibes",
  "Afro “Select” Vibes",
  "Happy Hits!",
  "Deep Focus",
  "Instrumental Study",
  "OST Compilations",
  "Nostalgia for old souled mill...",
  "Mixed Feelings",
];

export const placeholder = {
  avatar:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='34' height='34' viewBox='0 0 34 34'%3E%3Ccircle cx='17' cy='17' r='17' fill='%23999999'/%3E%3Ccircle cx='17' cy='13' r='5' fill='%23ffffff'/%3E%3Cpath d='M8 28c1.5-5 5-8 9-8s7.5 3 9 8' fill='%23ffffff'/%3E%3C/svg%3E",

  cover56:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Crect width='56' height='56' fill='%23999999'/%3E%3C/svg%3E",

  cover82:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='82' height='82' viewBox='0 0 82 82'%3E%3Crect width='82' height='82' fill='%23999999'/%3E%3C/svg%3E",

  cover182:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='182' height='182' viewBox='0 0 182 182'%3E%3Crect width='182' height='182' fill='%23999999'/%3E%3C/svg%3E",
};

// 프로필
export const user = {
  name: "HAEJUNPARK",
  avatar: placeholder.avatar,
};

// 메인 컨텐츠 목록
export const midMixes = [
  {
    title: "Chill Mix",
    cover: placeholder.cover82,
  },
  {
    title: "Pop Mix",
    cover: placeholder.cover82,
  },
  {
    title: "Daily Mix 1",
    cover: placeholder.cover82,
  },
  {
    title: "Daily Mix 4",
    cover: placeholder.cover82,
  },
  {
    title: "Daily Mix 5",
    cover: placeholder.cover82,
  },
  {
    title: "Folk & Acoustic Mix",
    cover: placeholder.cover82,
  },
];

export const popularPlaylists = [
  {
    title: "Chill Mix",
    description: "Julia Wolf, Khalid, ayokay and more",
    cover: placeholder.cover182,
  },
  {
    title: "Pop Mix",
    description: "Hey Violet, VÉRITÉ, Timeflies and more",
    cover: placeholder.cover182,
  },
  {
    title: "Pheelz Mix",
    description: "WizKid, Asake, Tiwa Savage and more",
    cover: placeholder.cover182,
  },
  {
    title: "Indie Mix",
    description: "Joywave, The xx, The Neighbourhood and...",
    cover: placeholder.cover182,
  },
  {
    title: "Daily Mix 1",
    description: "Ayra Starr, Lil Kesh, Ed Sheeran and more",
    cover: placeholder.cover182,
  },
];

export const latestPlaylists = [
  {
    title: "Folk & Acoustic...",
    description: "Canyon City, Crooked Still, Gregory Alan...",
    cover: placeholder.cover182,
  },
  {
    title: "Daily Mix 1",
    description: "Ayra Starr, Lil Kesh, Ed Sheeran and more",
    cover: placeholder.cover182,
  },
  {
    title: "Daily Mix 5",
    description: "FRENSHIP, Brooke Sierra, Julia Wolf an...",
    cover: placeholder.cover182,
  },
  {
    title: "Pop Mix",
    description: "Hey Violet, VÉRITÉ, Timeflies and more",
    cover: placeholder.cover182,
  },
  {
    title: "Pheelz Mix",
    description: "WizKid, Asake, Tiwa Savage and more",
    cover: placeholder.cover182,
  },
];

// 현재 재생 트랙
export const currentTrack = {
  title: "Play It Safe",
  artist: "Julia Wolf",
  cover: placeholder.cover56,
  currentTime: "2:39",
  duration: "4:22",
  progress: "49.82%",
};
