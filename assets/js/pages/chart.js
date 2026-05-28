

import { dummyData } from '../data/mockData.js';

import { renderCommonLayout } from "../layout/commonLayout.js";

// =========================
// 초기 실행
// =========================
renderCommonLayout();

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. 데이터 가공: 장르 및 날씨 통계 만들기
    const genreStats = dummyData.reduce((acc, cur) => {
        acc[cur.genre] = (acc[cur.genre] || 0) + 1;
        return acc;
    }, {});

    const weatherStats = dummyData.reduce((acc, cur) => {
        acc[cur.weather] = (acc[cur.weather] || 0) + 1;
        return acc;
    }, {});

    // 2. 테이블 렌더링
    const tbody = document.querySelector('.song-table tbody');
    tbody.innerHTML = dummyData.map((song, index) => `
        <tr class="song-row">
            <td>${index + 1}</td>
            <td>${song.title}</td>
            <td>${song.artist}</td>
            <td>${song.playCount}회</td>
        </tr>
    `).join('');

    // 3. 도넛 차트 생성
    const genreCtx = document.getElementById('genreChart').getContext('2d');
    
    const centerTextPlugin = {
        id: 'centerText',
        afterDraw: (chart) => {
            const { ctx, chartArea: { top, left, width, height } } = chart;
            const data = chart.data.datasets[0].data;
            const maxIdx = data.indexOf(Math.max(...data));
            
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText(chart.data.labels[maxIdx], width / 2 + left, height / 2 + top - 10);
            ctx.restore();
        }
    };

    new Chart(genreCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(genreStats),           // 가공된 장르 라벨
            datasets: [{
                data: Object.values(genreStats),       // 가공된 장르 데이터 값
                backgroundColor: ['#00d4ff', '#0000ff', '#ffffff', '#ff9100', '#00e676'],
                borderWidth: 0
            }]
        },
        options: {
            plugins: { legend: { display: false }, tooltip: { enabled: true } },
            cutout: '70%'
        },
        plugins: [centerTextPlugin]
    });

    // 4. 바 차트 생성
    const weatherCtx = document.getElementById('weatherChart').getContext('2d');
    new Chart(weatherCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(weatherStats),         // 가공된 날씨 라벨
            datasets: [{
                data: Object.values(weatherStats),     // 가공된 날씨 데이터 값
                backgroundColor: ['#00e676', '#2979ff', '#ff9100', '#bdbdbd'],
                borderRadius: 10,
                barThickness: 10
            }]
        },
        options: {
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { grid: { display: false }, ticks: { color: '#ffffff' } }
            }
        }
    });
});