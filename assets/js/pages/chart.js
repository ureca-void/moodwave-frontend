document.addEventListener('DOMContentLoaded', () => {

  // 나중에 API로 받아올 데이터를 담을 변수
const dashboardData = {
    genre: {
        labels: ['Pop', 'Ballad', 'Jazz'],
        values: [45, 38, 17]
    },
    weather: {
        labels: ['Windy', 'Rainy', 'Sunny', 'Cloudy'],
        values: [45, 22, 15, 18]
    }
};
    // 1. 도넛 차트 생성
    const genreCtx = document.getElementById('genreChart').getContext('2d');

    // 중앙 텍스트 플러그인 (dashboardData 참조)
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
            ctx.font = '16px sans-serif';
            ctx.fillText(data[maxIdx] + '%', width / 2 + left, height / 2 + top + 15);
            ctx.restore();
        }
    };
    new Chart(genreCtx, {
        type: 'doughnut',
        data: {
            labels: ['Pop', 'Ballad', 'Jazz'],
            datasets: [{
                data: [45, 38, 17],
                backgroundColor: ['#00d4ff', '#0000ff', '#ffffff'],
                borderWidth: 0
            }]
        },
        options: {
            plugins: { legend: { display: false }, tooltip: { enabled: true } },
            cutout: '70%'
        },
        plugins: [centerTextPlugin]
    });

    // 2. 라인 차트 생성 (추가)
    const weatherCtx = document.getElementById('weatherChart').getContext('2d');
    new Chart(weatherCtx, {
    type: 'bar',
    data: {
        labels: ['Windy', 'Rainy', 'Sunny', 'Cloudy'],
        datasets: [{
            data: [45, 22, 15, 18],
            backgroundColor: ['#00e676', '#2979ff', '#ff9100', '#bdbdbd'],
            borderRadius: 10, // 막대 모서리 둥글게
            barThickness: 10  // 막대 두께
        }]
    },
    options: {
        indexAxis: 'y', // 가로 막대 그래프로 설정
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: { 
                display: false, // 상단 수치 축 숨김
                max: 80
            },
            y: { 
                grid: { display: false }, // 격자 숨김
                ticks: { color: '#ffffff' } // 텍스트 색상
            }
        }
    }
});
});