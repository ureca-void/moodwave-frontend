import { renderCommonLayout } from "../layout/commonLayout.js";
// import { dummyData } from "../../../assets/js/data/mockData.js";

renderCommonLayout();

document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("http://localhost:8080/api/music");
  const result = await response.json();

  const data = Array.isArray(result)
    ? result
    : result.allSongs || result.data || [];
  const chartData = data;
  // 장르 차트용 매핑 
  const genreMap = {
  "D.O.": "K-Pop",
  "CORTIS": "Electronic",
  "Playboi Carti": "Hip-Hop",
  "The Weeknd": "Pop",
  "NCT WISH": "K-Pop",
  "DaBaby": "Hip-Hop",
  "HANRORO": "K-Indie",
  "Omega Sapien": "Hip-Hop",
  "Yerin Baek": "R&B",
  "NAYEON": "K-Pop",
  "Hearts2Hearts": "K-Pop",
  "ILLIT": "K-Pop",
  "B小町": "J-Pop",
  "Ariana Grande": "Pop",
  "K/DA": "Game Music",
  "DJ Khaled": "Hip-Hop",
};

  const normalizeText = (value, fallback) =>
    typeof value === "string" && value.trim() ? value : fallback;

  const getValue = (item) => {
  const raw = Number(item?.playCount ?? item?.popularity ?? 0);
  return Number.isFinite(raw) ? raw : 0;
};
  

  // genre가 Unknown이면 artist 이름을 기준으로 genreMap에서 장르를 찾아 반환
// genreMap에도 없으면 Etc로 분류해서 차트가 Unknown으로만 나오지 않게 처리
const resolveGenre = (item) => {
  const apiGenre = normalizeText(item?.genre, "");

  if (apiGenre && apiGenre !== "Unknown") {
    return apiGenre;
  }

  const artist = normalizeText(item?.artist ?? item?.description, "");
  return genreMap[artist] || "Etc";
};

 const getTop5ByField = (dataArray, field) => {
  const stats = dataArray.reduce((acc, item) => {
    // genre 차트일 때는 API genre 대신 resolveGenre()로 보정된 장르 사용
    // weather 차트일 때는 기존처럼 API에서 받은 weather 값 그대로 사용
    const label =
      field === "genre"
        ? resolveGenre(item)
        : normalizeText(item?.[field], "Unknown");

    // popularity 합산이 아니라 카테고리별 곡 개수를 세기 위해 +1
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
};

  const top5Genres = getTop5ByField(chartData, "genre");
  const top5Weather = getTop5ByField(chartData, "weather");

  // topWeather의 곡 5개 추천하는 로직 추가
  const topWeather = top5Weather[0]?.[0];

const recommendedSongs = data
  .filter((song) => normalizeText(song?.weather, "Unknown") === topWeather)
  .sort((a, b) => getValue(b) - getValue(a))
  .slice(0, 5);

const tbody = document.querySelector(".song-table tbody");

  if (tbody) {
    tbody.innerHTML = recommendedSongs
      .map(
        (song, index) => `
          <tr class="song-row">
            <td>${index + 1}</td>
            <td>${normalizeText(song?.title, "Unknown Title")}</td>
            <td>${normalizeText(song?.description ?? song?.artist, "Unknown Artist")}</td>
            <td>
  ${Math.floor((song?.durationMs || 0) / 60000)}:
  ${String(Math.floor(((song?.durationMs || 0) % 60000) / 1000)).padStart(2, "0")}
</td>
          </tr>
        `
      )
      .join("");
  }

  const genreCanvas = document.getElementById("genreChart");
  const weatherCanvas = document.getElementById("weatherChart");

  if (!genreCanvas || !weatherCanvas || typeof Chart === "undefined") {
    return;
  }

  const genreCtx = genreCanvas.getContext("2d");
  const weatherCtx = weatherCanvas.getContext("2d");

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
      labels: top5Genres.map(([label]) => label),
      datasets: [
        {
          data: top5Genres.map(([, value]) => value),
          backgroundColor: ["#00d4ff", "#0000ff", "#ffffff", "#ff9100", "#00e676"],
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

  new Chart(weatherCtx, {
    type: "bar",
    data: {
      labels: top5Weather.map(([label]) => label),
      datasets: [
        {
          data: top5Weather.map(([, value]) => value),
          backgroundColor: ["#FFD700", "#B0C4DE", "#A9A9A9", "#4682B4", "#2F4F4F"],
          borderRadius: 10,
          barThickness: 10,
        },
      ],
    },
    options: {
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { grid: { display: false }, ticks: { color: "#ffffff" } },
      },
    },
  });
});
