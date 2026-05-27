const ICON_PATH = "assets/icon/";

const navItems = [
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

const playlistMenuItems = [
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

const playlists = [
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

// 메뉴 아이템 HTML 생성
function createNavItem(item) {
  return `
    <a href="${item.href}" class="sidebar__nav-item">
      <img
        class="sidebar__icon"
        src="${ICON_PATH}${item.icon}"
        width="32"
        height="32"
        alt=""
      />
      <span class="sidebar__label">${item.label}</span>
    </a>
  `;
}

// 사이드바 메뉴 렌더링
function renderNav() {
  const primaryNav = document.querySelector("#primaryNav");
  const secondaryNav = document.querySelector("#secondaryNav");

  primaryNav.innerHTML = navItems.map(createNavItem).join("");
  secondaryNav.innerHTML = playlistMenuItems.map(createNavItem).join("");
}

// 플레이리스트 목록 렌더링
function renderPlaylists() {
  const playlistList = document.querySelector("#playlistList");

  playlistList.innerHTML = playlists
    .map((playlist) => {
      return `
        <a href="#" class="sidebar__playlist-item">
          ${playlist}
        </a>
      `;
    })
    .join("");
}

// 초기 실행 함수
function init() {
  renderNav();
  renderPlaylists();
}

init();
