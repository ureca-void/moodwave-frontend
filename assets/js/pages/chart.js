const ctx = document.getElementById('genreChart').getContext('2d');
const genreChart = new Chart(ctx, {
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
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true } // 호버 시 툴팁 활성화
        },
        cutout: '80%'
    }
});