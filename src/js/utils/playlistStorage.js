const PLAYLIST_STORAGE_KEY = "moodwave_playlists";
const PLAYLIST_TRACKS_STORAGE_KEY = "moodwave_playlist_tracks";

// =========================
// 플레이리스트 이름 목록 불러오기
// =========================
export function loadPlaylistNames() {
  try {
    const playlists = JSON.parse(
      localStorage.getItem(PLAYLIST_STORAGE_KEY) || "[]",
    );

    if (!Array.isArray(playlists)) return [];

    return playlists.filter((playlist) => typeof playlist === "string");
  } catch {
    return [];
  }
}

// =========================
// 플레이리스트별 곡 목록 불러오기
// =========================
export function loadPlaylistTrackMap() {
  try {
    const playlistTrackMap = JSON.parse(
      localStorage.getItem(PLAYLIST_TRACKS_STORAGE_KEY) || "{}",
    );

    if (!playlistTrackMap || typeof playlistTrackMap !== "object") {
      return {};
    }

    return playlistTrackMap;
  } catch {
    return {};
  }
}

// =========================
// 플레이리스트별 곡 목록 저장하기
// =========================
function savePlaylistTrackMap(playlistTrackMap) {
  localStorage.setItem(
    PLAYLIST_TRACKS_STORAGE_KEY,
    JSON.stringify(playlistTrackMap),
  );
}

// =========================
// 특정 플레이리스트에 곡 추가
// =========================
export function addTrackToPlaylist(playlistName, track) {
  const playlistTrackMap = loadPlaylistTrackMap();
  const currentTracks = playlistTrackMap[playlistName] || [];

  const isDuplicated = currentTracks.some((savedTrack) => {
    return (
      savedTrack.id === track.id ||
      (savedTrack.title === track.title && savedTrack.artist === track.artist)
    );
  });

  if (isDuplicated) {
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

  const nextTracks = currentTracks.filter((track) => {
    return String(track.id) !== String(trackId);
  });

  playlistTrackMap[playlistName] = nextTracks;
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
