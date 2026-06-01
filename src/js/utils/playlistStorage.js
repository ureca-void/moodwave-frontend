const PLAYLIST_STORAGE_KEY = "moodwave_playlists";
const PLAYLIST_TRACKS_STORAGE_KEY = "moodwave_playlist_tracks";

// =========================
// localStorage JSON 불러오기
// =========================
function loadJSON(key, defaultValue) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "null");

    return data ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

// =========================
// localStorage JSON 저장하기
// =========================
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// =========================
// 플레이리스트 이름 목록 불러오기
// =========================
export function loadPlaylistNames() {
  const playlists = loadJSON(PLAYLIST_STORAGE_KEY, []);

  if (!Array.isArray(playlists)) return [];

  return playlists.filter((playlist) => typeof playlist === "string");
}

// =========================
// 플레이리스트별 곡 목록 불러오기
// =========================
export function loadPlaylistTrackMap() {
  const playlistTrackMap = loadJSON(PLAYLIST_TRACKS_STORAGE_KEY, {});

  if (
    !playlistTrackMap ||
    typeof playlistTrackMap !== "object" ||
    Array.isArray(playlistTrackMap)
  ) {
    return {};
  }

  return playlistTrackMap;
}

// =========================
// 플레이리스트별 곡 목록 저장하기
// =========================
function savePlaylistTrackMap(playlistTrackMap) {
  saveJSON(PLAYLIST_TRACKS_STORAGE_KEY, playlistTrackMap);
}

// =========================
// 중복 곡 여부 확인
// =========================
function isDuplicatedTrack(currentTracks, track) {
  return currentTracks.some((savedTrack) => {
    return (
      String(savedTrack.id) === String(track.id) ||
      (savedTrack.title === track.title && savedTrack.artist === track.artist)
    );
  });
}

// =========================
// 특정 플레이리스트에 곡 추가
// =========================
export function addTrackToPlaylist(playlistName, track) {
  const playlistTrackMap = loadPlaylistTrackMap();
  const currentTracks = playlistTrackMap[playlistName] || [];

  if (isDuplicatedTrack(currentTracks, track)) {
    return {
      success: false,
      message: "이미 이 플레이리스트에 추가된 곡입니다.",
    };
  }

  playlistTrackMap[playlistName] = [...currentTracks, track];
  savePlaylistTrackMap(playlistTrackMap);

  return {
    success: true,
    message: `"${playlistName}"에 추가되었습니다.`,
  };
}

// =========================
// 특정 플레이리스트에서 곡 제거
// =========================
export function removeTrackFromPlaylist(playlistName, trackId) {
  const playlistTrackMap = loadPlaylistTrackMap();
  const currentTracks = playlistTrackMap[playlistName] || [];

  playlistTrackMap[playlistName] = currentTracks.filter((track) => {
    return String(track.id) !== String(trackId);
  });

  savePlaylistTrackMap(playlistTrackMap);

  return {
    success: true,
    message: "플레이리스트에서 제거되었습니다.",
  };
}

// =========================
// 플레이리스트 이름 변경 시 곡 목록도 같이 이동
// =========================
export function renamePlaylistTracks(prevName, nextName) {
  const playlistTrackMap = loadPlaylistTrackMap();

  if (!playlistTrackMap[prevName]) return;

  playlistTrackMap[nextName] = playlistTrackMap[prevName];
  delete playlistTrackMap[prevName];

  savePlaylistTrackMap(playlistTrackMap);
}

// =========================
// 플레이리스트 삭제 시 곡 목록도 같이 삭제
// =========================
export function deletePlaylistTracks(playlistName) {
  const playlistTrackMap = loadPlaylistTrackMap();

  if (!playlistTrackMap[playlistName]) return;

  delete playlistTrackMap[playlistName];
  savePlaylistTrackMap(playlistTrackMap);
}
