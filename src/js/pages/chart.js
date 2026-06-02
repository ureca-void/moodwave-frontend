import { renderSongTable, initSongTable } from "../components/songTable.js";
// 더미데이터 연동 로직 삭제
// import { weatherTracks, playlistMap } from "../data.js";

// =========================
// 아티스트별 장르 매핑
// Spotify API 응답에 genre가 없어서 프론트에서 수동 보정
// =========================
const artistGenreMap = {
  "D.O.": "K-pop",
  "CORTIS": "K-pop",
  "NCT WISH": "K-pop",
  "The Weeknd": "Pop",
  "HANRORO": "Indie",
  "Playboi Carti": "Hip-hop",
  "DaBaby": "Hip-hop",
  "Yerin Baek": "R&B",
  "Omega Sapien": "Hip-hop",
  "NAYEON": "K-pop",
  "Hearts2Hearts": "K-pop",
  "ILLIT": "K-pop",
  "B小町": "J-pop",
  "Pop Smoke": "Hip-hop",
  "Ariana Grande": "Pop",
  "DJ Khaled": "Hip-hop",
  "AKMU": "K-pop",
  "BTS": "K-pop",
  "OsamaSon": "Hip-hop",
  "Gen Hoshino": "J-pop",
  "NOWIMYOUNG": "Hip-hop",
  "K/DA": "K-pop",
  "MIKA": "Pop",
  "BewhY": "Hip-hop",
  "Kenshi Yonezu": "J-pop",
  "N'John": "Hip-hop",
  "NMIXX": "K-pop",
  "BLASÉ": "Hip-hop",
  "Jin": "K-pop",
  "KiiiKiii": "K-pop",
  "HAON": "Hip-hop",
  "LamazeP": "J-pop",
  "STAYC": "K-pop",
  "YENA": "K-pop",
  "Epik High": "Hip-hop",
  "Polo G": "Hip-hop",
  "Dragon Pony": "K-rock",
  "kinoshita": "J-pop",
};

// =========================
// 차트 페이지 HTML 렌더링
// =========================
export function renderChartPage() {
  return `
    <section class="chart-page">
      <div class="chart-page__header">
        <h2 class="chart-page__title">내 음악 취향 통계</h2>
        <p class="chart-page__desc">
          내가 들은 음악 데이터를 기반으로 장르와 날씨 취향을 확인할 수 있어요.
        </p>
      </div>

      <div class="dashboard">
        <div class="chart-box">
          <h3>장르별 재생 비율</h3>

          <div class="chart-container">
            <canvas id="genreChart"></canvas>
          </div>
        </div>

        <div class="chart-box">
          <h3>가장 많이 감상한 날씨 🎧</h3>

          <div class="chart-container weather-container">
            <canvas id="weatherChart"></canvas>
          </div>
        </div>
      </div>

      <section class="song-table-page chart-recommend-section">
        <div class="song-table-page__header">
          <h2 class="song-table-page__title">날씨 기반 추천곡</h2>
          <p class="song-table-page__desc">
            가장 많이 감상한 날씨와 어울리는 곡을 추천해드려요.
          </p>
        </div>

        <div id="chartSongTable"></div>
      </section>
    </section>
  `;
}

// =========================
// 차트 페이지 초기화
// data.js 더미 데이터 사용 버전
// =========================
export async function initChartPage() {
  const songTableContainer = document.querySelector("#chartSongTable");

// 더미데이터 호출 로직 삭제 
// const data = getDummyChartData();

// api 연동 코드 추가
const response = await fetch("http://localhost:8080/api/music");
if (!response.ok) {
  throw new Error("음악 데이터 조회 실패");
}

// genre 없을 때 artistGenreMap에서 찾는 렌더링 로직 추가
const apiData = await response.json();

const data = apiData.map((song) => ({
  ...song,
  genre: song.genre || artistGenreMap[song.artist] || "Etc",
}));

  const topGenres = getTopDataByField(data, "genre");
  const topWeather = getTopDataByField(data, "weather");

  const mostListenedWeather = topWeather[0]?.[0];

  const recommendedSongs = data
    .filter(
      (song) => normalizeText(song?.weather, "Unknown") === mostListenedWeather,
    )
    .slice(0, 5)
    .map(normalizeSongData);

  renderGenreChart(topGenres);
  renderWeatherChart(topWeather);

  if (songTableContainer) {
    songTableContainer.innerHTML = renderSongTable(recommendedSongs, {
      actionType: "playlist",
      actionHeader: "Add",
      emptyMessage: "추천할 곡이 없습니다.",
    });
  }

  initSongTable();
}

// =========================
// data.js의 weatherTracks를 차트용 데이터로 변환
// =========================
// function getDummyChartData() {
//   return Object.entries(weatherTracks).flatMap(([weatherKey, tracks]) => {
//     const playlist = playlistMap[weatherKey];

//     return tracks.map((track) => ({
//       id: `${weatherKey}-${track.id}`,
//       title: track.title,
//       artist: track.artist,
//       weather: playlist?.weather || weatherKey,
//       genre: getPrimaryGenre(playlist?.genre),
//       releaseDate: playlist?.weather || weatherKey,
//       durationMs: convertDurationToMs(track.duration),
//       cover: playlist?.image || "",
//       imageUrl: playlist?.image || "",
//       albumImage: playlist?.image || "",
//     }));
//   });
// }

// =========================
// 장르 문자열에서 첫 번째 장르만 사용
// 예: "Lo-fi • Jazz • Acoustic" → "Lo-fi"
// =========================
// function getPrimaryGenre(genreText) {
//   if (!genreText || typeof genreText !== "string") {
//     return "Etc";
//   }

//   return genreText.split("•")[0].trim() || "Etc";
// }

// =========================
// "4:12" 형식의 duration을 ms로 변환
// =========================
// function convertDurationToMs(duration) {
//   if (!duration || typeof duration !== "string") {
//     return 0;
//   }

//   const [minutes, seconds] = duration.split(":").map(Number);

//   if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
//     return 0;
//   }

//   return (minutes * 60 + seconds) * 1000;
// }

// =========================
// 공통 유틸 함수
// =========================
function normalizeText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function getTopDataByField(dataArray, field) {
  const stats = dataArray.reduce((acc, item) => {
    const label = normalizeText(item?.[field], "Unknown");

    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
}

// =========================
// songTable.js에 맞게 데이터 정리
// =========================
function normalizeSongData(song) {
  const artist = normalizeText(song?.artist, "Unknown Artist");
  const cover = song?.cover || song?.imageUrl || song?.albumImage || "";

  return {
    id: song?.id,
    musicId: song?.id,
    trackId: song?.id,
    spotifyId: song?.id,

    title: normalizeText(song?.title, "Unknown Title"),
    artist,
    artistName: artist,
    description: artist,

    cover,
    imageUrl: cover,
    albumCover: cover,
    albumImage: cover,

    releaseDate: normalizeText(song?.weather, "-"),
    weather: normalizeText(song?.weather, "-"),
    genre: normalizeText(song?.genre, "Etc"),

    durationMs: song?.durationMs ?? 0,
    uri: song?.uri || `spotify:track:${song?.id}`,
  };
}

// =========================
// 장르 차트 렌더링
// =========================
function renderGenreChart(topGenres) {
  const genreCanvas = document.querySelector("#genreChart");

  if (!genreCanvas || typeof Chart === "undefined") {
    return;
  }

  const genreCtx = genreCanvas.getContext("2d");

  const centerTextPlugin = {
    id: "centerText",
    afterDraw: (chart) => {
      const datasetData = chart.data.datasets[0].data;
      const total = datasetData.reduce((a, b) => a + b, 0);

      if (!total) return;

      const { ctx, chartArea } = chart;
      const { top, left, width, height } = chartArea;

      const maxVal = Math.max(...datasetData);
      const maxIdx = datasetData.indexOf(maxVal);
      const label = chart.data.labels[maxIdx] ?? "Unknown";
      const percentage = ((maxVal / total) * 100).toFixed(0);

      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.font = "bold 20px sans-serif";
      ctx.fillText(label, width / 2 + left, height / 2 + top - 10);

      ctx.font = "16px sans-serif";
      ctx.fillText(`${percentage}%`, width / 2 + left, height / 2 + top + 15);

      ctx.restore();
    },
  };

  new Chart(genreCtx, {
    type: "doughnut",
    data: {
      labels: topGenres.map(([label]) => label),
      datasets: [
        {
          data: topGenres.map(([, value]) => value),
          backgroundColor: [
            "#00d4ff",
            "#0000ff",
            "#ffffff",
            "#ff9100",
            "#00e676",
            "#b388ff",
          ],
          borderWidth: 0,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      cutout: "70%",
    },
    plugins: [centerTextPlugin],
  });
}

// =========================
// 날씨 차트 렌더링
// =========================
function renderWeatherChart(topWeather) {
  const weatherCanvas = document.querySelector("#weatherChart");

  if (!weatherCanvas || typeof Chart === "undefined") {
    return;
  }

  const weatherCtx = weatherCanvas.getContext("2d");

  new Chart(weatherCtx, {
    type: "bar",
    data: {
      labels: topWeather.map(([label]) => label),
      datasets: [
        {
          data: topWeather.map(([, value]) => value),
          backgroundColor: [
            "#FFD700",
            "#B0C4DE",
            "#A9A9A9",
            "#4682B4",
            "#2F4F4F",
            "#8f8f8f",
          ],
          borderRadius: 10,
          barThickness: 10,
        },
      ],
    },
    options: {
      indexAxis: "y",
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          display: false,
        },
        y: {
          grid: { display: false },
          ticks: {
            color: "#ffffff",
          },
        },
      },
    },
  });
}
