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

// =========================
// 날씨별 플레이리스트 히어로
// =========================
export const playlistMap = {
  Rain: {
    weather: "Rainy",
    title: "Overcast Vibes",
    desc: "차분하게 하루를 정리하고 싶을 때",
    image: "/assets/img/rainy.jpg",
    genre: "Lo-fi • Jazz • Acoustic",
    tag: "FOR RAINY DAYS",
    label: "RAINY PLAYLIST",
    icon: "/assets/icon/rainy.svg",
    color: "rgba(45, 55, 80, 0.7)",
  },

  Clouds: {
    weather: "Cloudy",
    title: "Cloudy Skies",
    desc: "흐린 오후를 천천히 채워주는 부드러운 사운드",
    image: "/assets/img/cloudy.jpg",
    genre: "Dream Pop • Indie • Shoegaze",
    tag: "FOR CLOUDY DAYS",
    label: "CLOUDY PLAYLIST",
    icon: "/assets/icon/cloudy.svg",
    color: "rgba(65, 70, 80, 0.7)",
  },

  Clear: {
    weather: "Sunny",
    title: "Golden Hour",
    desc: "햇살 가득한 하루를 더 밝게 만드는 플레이리스트",
    image: "/assets/img/sunny.jpg",
    genre: "Pop • Funk • Disco",
    tag: "FOR SUNNY DAYS",
    label: "SUNNY PLAYLIST",
    icon: "/assets/icon/sunny.svg",
    color: "rgba(75, 55, 25, 0.7)",
  },

  Snow: {
    weather: "Snowy",
    title: "Winter Hush",
    desc: "포근한 겨울 풍경과 어울리는 따뜻한 선율",
    image: "/assets/img/snowy.jpg",
    genre: "Piano • New Age • Classical",
    tag: "FOR SNOWY DAYS",
    label: "SNOWY PLAYLIST",
    icon: "/assets/icon/snowy.svg",
    color: "rgba(90, 105, 130, 0.7)",
  },

  Thunderstorm: {
    weather: "Stormy",
    title: "Thunder Echoes",
    desc: "천둥소리와 함께 몰입하기 좋은 강렬한 사운드",
    image: "/assets/img/stormy.jpg",
    genre: "Electronic • Alt Rock • Synthwave",
    tag: "FOR STORMY DAYS",
    label: "STORMY PLAYLIST",
    icon: "/assets/icon/stormy.svg",
    color: "rgba(50, 50, 65, 0.8)",
  },

  Foggy: {
    weather: "Foggy",
    title: "Midnight Mist",
    desc: "안개 낀 새벽의 몽환적인 분위기를 담은 플레이리스트",
    image: "/assets/img/foggy.jpg",
    genre: "Trip Hop • Downtempo • Chillout",
    tag: "FOR FOGGY DAYS",
    label: "FOGGY PLAYLIST",
    icon: "/assets/icon/foggy.svg",
    color: "rgba(45, 50, 65, 0.8)",
  },
};

// =========================
// 날씨 플레이리스트 더미 데이터
// =========================
export const weatherTracks = {
  Rain: [
    { id: 1, title: "밤편지", artist: "아이유", duration: "4:12" },
    { id: 2, title: "Square (2017)", artist: "백예린", duration: "4:31" },
    { id: 3, title: "Everything", artist: "검정치마", duration: "3:43" },
    { id: 4, title: "Love Me More", artist: "dosii", duration: "3:18" },
    { id: 5, title: "Coffee", artist: "beabadoobee", duration: "4:18" },
    { id: 6, title: "Promise", artist: "Laufey", duration: "3:54" },
    {
      id: 7,
      title: "Like A Star",
      artist: "Corinne Bailey Rae",
      duration: "4:03",
    },
    { id: 8, title: "Movie", artist: "Tom Misch", duration: "3:47" },
    { id: 9, title: "Best Part", artist: "Daniel Caesar", duration: "3:29" },
    { id: 10, title: "Cherry Wine", artist: "Hozier", duration: "4:01" },
  ],

  Clouds: [
    { id: 1, title: "난춘", artist: "새소년", duration: "5:21" },
    { id: 2, title: "Antifreeze", artist: "검정치마", duration: "4:26" },
    { id: 3, title: "Dreams Tonite", artist: "Alvvays", duration: "3:15" },
    {
      id: 4,
      title: "Apocalypse",
      artist: "Cigarettes After Sex",
      duration: "4:50",
    },
    { id: 5, title: "Space Song", artist: "Beach House", duration: "5:20" },
    { id: 6, title: "Myth", artist: "Beach House", duration: "4:18" },
    {
      id: 7,
      title: "Heavenly",
      artist: "Cigarettes After Sex",
      duration: "4:47",
    },
    { id: 8, title: "Show Me How", artist: "Men I Trust", duration: "3:35" },
    { id: 9, title: "Bags", artist: "Clairo", duration: "4:20" },
    { id: 10, title: "Fade Into You", artist: "Mazzy Star", duration: "4:55" },
  ],

  Clear: [
    { id: 1, title: "에잇", artist: "아이유", duration: "2:47" },
    { id: 2, title: "Levitating", artist: "Dua Lipa", duration: "3:23" },
    { id: 3, title: "Treasure", artist: "Bruno Mars", duration: "2:58" },
    { id: 4, title: "Get Lucky", artist: "Daft Punk", duration: "6:09" },
    { id: 5, title: "Espresso", artist: "Sabrina Carpenter", duration: "2:55" },
    { id: 6, title: "Attention", artist: "Charlie Puth", duration: "3:31" },
    {
      id: 7,
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      duration: "2:54",
    },
    {
      id: 8,
      title: "Good Luck, Babe!",
      artist: "Chappell Roan",
      duration: "3:38",
    },
    { id: 9, title: "Electric Love", artist: "BØRNS", duration: "3:38" },
    { id: 10, title: "Sunroof", artist: "Nicky Youre", duration: "2:43" },
  ],

  Snow: [
    { id: 1, title: "River Flows In You", artist: "Yiruma", duration: "3:08" },
    { id: 2, title: "Kiss The Rain", artist: "Yiruma", duration: "4:18" },
    { id: 3, title: "Winter Bear", artist: "V", duration: "2:54" },
    { id: 4, title: "Snowman", artist: "Sia", duration: "2:45" },
    { id: 5, title: "Bloom", artist: "The Paper Kites", duration: "3:30" },
    {
      id: 6,
      title: "Nuvole Bianche",
      artist: "Ludovico Einaudi",
      duration: "5:57",
    },
    {
      id: 7,
      title: "Experience",
      artist: "Ludovico Einaudi",
      duration: "5:15",
    },
    { id: 8, title: "Near Light", artist: "Ólafur Arnalds", duration: "3:29" },
    { id: 9, title: "Holocene", artist: "Bon Iver", duration: "5:36" },
    {
      id: 10,
      title: "To Build A Home",
      artist: "The Cinematic Orchestra",
      duration: "6:11",
    },
  ],

  Thunderstorm: [
    { id: 1, title: "Nightcall", artist: "Kavinsky", duration: "4:18" },
    { id: 2, title: "Midnight City", artist: "M83", duration: "4:04" },
    { id: 3, title: "After Dark", artist: "Mr.Kitty", duration: "4:17" },
    { id: 4, title: "Starboy", artist: "The Weeknd", duration: "3:50" },
    { id: 5, title: "Genesis", artist: "Grimes", duration: "4:15" },
    { id: 6, title: "505", artist: "Arctic Monkeys", duration: "4:13" },
    {
      id: 7,
      title: "Do I Wanna Know?",
      artist: "Arctic Monkeys",
      duration: "4:32",
    },
    {
      id: 8,
      title: "Take Me Out",
      artist: "Franz Ferdinand",
      duration: "3:57",
    },
    { id: 9, title: "Electric Feel", artist: "MGMT", duration: "3:49" },
    { id: 10, title: "Kids", artist: "MGMT", duration: "5:03" },
  ],

  Foggy: [
    { id: 1, title: "Fairy Of Shampoo", artist: "dosii", duration: "3:52" },
    {
      id: 2,
      title: "Nothing's Gonna Hurt You Baby",
      artist: "Cigarettes After Sex",
      duration: "4:46",
    },
    { id: 3, title: "Fade Into You", artist: "Mazzy Star", duration: "4:55" },
    { id: 4, title: "Wait", artist: "M83", duration: "5:43" },
    {
      id: 5,
      title: "My Love Mine All Mine",
      artist: "Mitski",
      duration: "2:17",
    },
    { id: 6, title: "Youth", artist: "Daughter", duration: "4:13" },
    { id: 7, title: "Anchor", artist: "Novo Amor", duration: "4:18" },
    { id: 8, title: "A Walk", artist: "Tycho", duration: "5:18" },
    { id: 9, title: "Sunset Lover", artist: "Petit Biscuit", duration: "3:58" },
    { id: 10, title: "Roslyn", artist: "Bon Iver", duration: "4:49" },
  ],
};
