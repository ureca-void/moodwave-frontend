import { renderCommonLayout } from "../layout/commonLayout.js";
import { dummyData } from "../../../assets/js/data/mockData.js";

renderCommonLayout();

document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("http://localhost:8080/api/music");
  const result = await response.json();

  const data = Array.isArray(result)
    ? result
    : result.allSongs || result.data || [];
  const chartData = data;

  const normalizeText = (value, fallback) =>
    typeof value === "string" && value.trim() ? value : fallback;

  const getValue = (item) => {
    const raw = Number(item?.playCount ?? item?.popularity ?? 0);
    return Number.isFinite(raw) ? raw : 0;
  };

  const getTop5ByField = (dataArray, field) => {
    const stats = dataArray.reduce((acc, item) => {
      const label = normalizeText(item?.[field], "Unknown");
      const value = getValue(item);
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const top5Genres = getTop5ByField(chartData, "genre");
  const top5Weather = getTop5ByField(chartData, "weather");

  const sortedSongs = [...data].sort((a, b) => getValue(b) - getValue(a));
  const tbody = document.querySelector(".song-table tbody");

  if (tbody) {
    tbody.innerHTML = sortedSongs
      .slice(0, 5)
      .map(
        (song, index) => `
          <tr class="song-row">
            <td>${index + 1}</td>
            <td>${normalizeText(song?.title, "Unknown Title")}</td>
            <td>${normalizeText(song?.description ?? song?.artist, "Unknown Artist")}</td>
            <td>${getValue(song)}</td>
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
