// 기존 더미데이터 불러오는 로직 삭제
// import { dummyData } from '../data/mockData.js';

import { renderCommonLayout } from "../layout/commonLayout.js";

// =========================
// 초기 실행
// =========================
renderCommonLayout();

document.addEventListener('DOMContentLoaded', async () => {
    // 1. API에서 데이터 가져오기
    // 백엔드 API 주소로 수정하고, 받아온 데이터는 배열 그 자체이므로 data에 그대로 할당합니다.
    const response = await fetch('http://localhost:8080/api/music');
    const data = await response.json(); // 백엔드에서 받은 데이터
    console.log("데이터 확인:", data);
    // const data = data.allSongs; // 예시 구조

  // 1. 유틸리티: 통계 계산 후 내림차순 정렬하여 상위 5개 반환
    const getSortedTop5 = (dataArray, key) => {
        const stats = dataArray.reduce((acc, cur) => {
            acc[cur[key]] = (acc[cur[key]] || 0) + 1;
            return acc;
        }, {});
        
        return Object.entries(stats)
            .sort((a, b) => b[1] - a[1]) // 개수 기준 내림차순 정렬
            .slice(0, 5);                // 상위 5개
    };

    const top5Genres = getSortedTop5(data, 'genre');
    const top5Weather = getSortedTop5(data, 'weather');

  // 2. 테이블 렌더링: 재생횟수(playCount) 기준 내림차순 정렬 상위 5개
    const sortedSongs = [...data].sort((a, b) => b.playCount - a.playCount);
    const tbody = document.querySelector('.song-table tbody');
    tbody.innerHTML = sortedSongs.slice(0, 5).map((song, index) => `
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
            const data = chart.data.datasets[0].data; // 상위 5개 데이터 배열
            const total = data.length;           // 전체 데이터(20개)
            
            // 가장 많이 나온 항목의 정보 추출
            const maxVal = Math.max(...data);
            const maxIdx = data.indexOf(maxVal);
            const label = chart.data.labels[maxIdx];
            
            // 퍼센트 계산 (전체 대비 비율)
            const percentage = ((maxVal / total) * 100).toFixed(0);
            
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 장르명 표시
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText(label, width / 2 + left, height / 2 + top - 10);
            
            // 퍼센트 표시 (추가된 부분)
            ctx.font = '16px sans-serif';
            ctx.fillText(`${percentage}%`, width / 2 + left, height / 2 + top + 15);
            
            ctx.restore();
        }
    };

    new Chart(genreCtx, {
        type: 'doughnut',
        data: {
            labels: top5Genres.map(item => item[0]),
            datasets: [{
                data: top5Genres.map(item => item[1]),       // 정렬된 값
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
            labels: top5Weather.map(item => item[0]),        // 정렬된 라벨
            datasets: [{
                data: top5Weather.map(item => item[1]),      // 정렬된 값
                backgroundColor: ['#00e676', '#2979ff', '#ff9100', '#bdbdbd', '#757575'],
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