interface BacktestResult {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  netProfit: number;
  maxDrawdown: number;
  trades: Trade[];
  equity: number[];
  metrics: {
    sharpeRatio: number;
    sortino: number;
    maxConsecutiveLosses: number;
  };
}

interface Trade {
  entry: { price: number; time: Date };
  exit: { price: number; time: Date };
  profit: number;
  type: 'BUY' | 'SELL';
}

export class Backtester {
  private historicalData: Map<string, TimeframedData>;
  private strategy: TradingStrategies;
  private riskManager: RiskManager;

  constructor(strategy: TradingStrategies, riskManager: RiskManager) {
    this.strategy = strategy;
    this.riskManager = riskManager;
    this.historicalData = new Map();
  }

  async runBacktest(
    symbol: string,
    startDate: Date,
    endDate: Date,
    initialCapital: number
  ): Promise<BacktestResult> {
    const trades: Trade[] = [];
    const equity = [initialCapital];
    let currentCapital = initialCapital;

    // Get historical data for all timeframes
    await this.loadHistoricalData(symbol, startDate, endDate);

    // Iterate through each candle
    for (
      let currentTime = startDate;
      currentTime <= endDate;
      currentTime.setMinutes(currentTime.getMinutes() + 1)
    ) {
      const indicators = await this.calculateIndicators(currentTime);
      const signal = await this.strategy.macdStrategy(indicators);

      if (signal.action !== 'HOLD' && signal.confidence > 0.7) {
        // Validate trade with risk manager
        const position = {
          type: signal.action,
          volume: this.calculatePositionSize(currentCapital),
          symbol,
        };

        if (await this.riskManager.validateTrade(currentCapital, position)) {
          const trade = await this.executeTrade(position, currentTime);
          trades.push(trade);
          currentCapital += trade.profit;
          equity.push(currentCapital);
        }
      }
    }

    return this.calculateResults(trades, equity);
  }

  private calculateResults(trades: Trade[], equity: number[]): BacktestResult {
    const winningTrades = trades.filter((t) => t.profit > 0);
    const winRate = (winningTrades.length / trades.length) * 100;
    const profitFactor = this.calculateProfitFactor(trades);
    const maxDrawdown = this.calculateMaxDrawdown(equity);

    return {
      totalTrades: trades.length,
      winRate,
      profitFactor,
      netProfit: equity[equity.length - 1] - equity[0],
      maxDrawdown,
      trades,
      equity,
      metrics: {
        sharpeRatio: this.calculateSharpeRatio(equity),
        sortino: this.calculateSortino(equity),
        maxConsecutiveLosses: this.calculateMaxConsecutiveLosses(trades),
      },
    };
  }

  // ... helper methods
}
