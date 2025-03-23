const socket = io();
let chart;

socket.on('dashboard-update', (data) => {
  updateAccountInfo(data.accountInfo);
  updatePositionsTable(data.positions);
  updateCharts(data.marketData);
  updateRiskMetrics(data.riskMetrics);
});

function updateCharts(marketData) {
  const timeframes = ['1H', '4H', '1D'];
  
  timeframes.forEach(tf => {
    const chartData = {
      price: {
        x: marketData[tf].timestamps,
        y: marketData[tf].prices,
        type: 'scatter',
        name: 'Price'
      },
      bollinger: {
        upper: {
          x: marketData[tf].timestamps,
          y: marketData[tf].indicators.bollinger.upper,
          type: 'scatter',
          name: 'Upper BB'
        },
        lower: {
          x: marketData[tf].timestamps,
          y: marketData[tf].indicators.bollinger.lower,
          type: 'scatter',
          name: 'Lower BB'
        }
      },
      macd: {
        x: marketData[tf].timestamps,
        y: marketData[tf].indicators.macd.histogram,
        type: 'bar',
        name: 'MACD Histogram'
      }
    };

    Plotly.newPlot(`chart-${tf}`, [
      chartData.price,
      chartData.bollinger.upper,
      chartData.bollinger.lower,
      chartData.macd
    ], {
      title: `${tf} Timeframe Analysis`,
      height: 400,
      grid: {rows: 2, columns: 1},
      yaxis2: {domain: [0, 0.3]}
    });
  });
}

function updateRiskMetrics(metrics) {
  const riskDiv = document.getElementById('risk-metrics');
  riskDiv.innerHTML = `
    <div class="risk-gauge" id="daily-risk-gauge"></div>
    <div class="risk-stats">
      <p>Daily Loss: ${metrics.dailyLoss} / ${metrics.maxDailyLoss}</p>
      <p>Open Positions: ${metrics.openPositions} / ${metrics.maxPositions}</p>
      <p>Risk per Trade: ${metrics.riskPerTrade}%</p>
    </div>
  `;

  // Create risk gauge
  const gauge = new Gauge(document.getElementById('daily-risk-gauge')).setOptions({
    max: metrics.maxDailyLoss,
    value: metrics.dailyLoss,
    color: metrics.dailyLoss > metrics.maxDailyLoss * 0.8 ? 'red' : 'green'
  });
} 