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
    private async loadHistoricalData(symbol: string, startDate: Date, endDate: Date): Promise<void> {
    const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN1'];
    for (const timeframe of timeframes) {
      const data = await this.fetchData(symbol, startDate, endDate, timeframe);
      this.historicalData.set(`${symbol}_${timeframe}`, data);
    }
  }

  private async fetchData(symbol: string, startDate: Date, endDate: Date, timeframe: string): Promise<TimeframedData> {
    // Placeholder for fetching data
    return new Promise(resolve => setTimeout(() => resolve({
      symbol,
      timeframe,
      data: [{ time: new Date(), open: 10, high: 12, low: 9, close: 11, volume: 100 }],
    }), 1000));
  }

  private async calculateIndicators(currentTime: Date): Promise<Indicators> {
    // Placeholder for indicator calculation
    return {
      MACD: { MACD: 0, signal: 0, histogram: 0 },
    };
  }

  private calculatePositionSize(currentCapital: number): number {
    // Placeholder for position size calculation
    return currentCapital * 0.01;
  }

  private async executeTrade(position: Position, currentTime: Date): Promise<Trade> {
    // Placeholder for trade execution
    return new Promise(resolve => setTimeout(() => resolve({
      entry: { price: 11, time: currentTime },
      exit: { price: position.type === 'BUY' ? 12 : 10, time: new Date(currentTime.getTime() + 60000) },
      profit: position.type === 'BUY' ? 1 : -1,
      type: position.type,
    }), 100));
  }

  private calculateProfitFactor(trades: Trade[]): number {
    const totalProfit = trades.filter((t) => t.profit > 0).reduce((acc, t) => acc + t.profit, 0);
    const totalLoss = trades.filter((t) => t.profit < 0).reduce((acc, t) => acc + Math.abs(t.profit), 0);
    return totalLoss === 0 ? Infinity : totalProfit / totalLoss;
  }

  private calculateMaxDrawdown(equity: number[]): number {
    let peak = equity[0];
    let maxDrawdown = 0;
    for (const value of equity) {
      if (value > peak) {
        peak = value;
      }
      const drawdown = (peak - value) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    return maxDrawdown;
  }

  private calculateSharpeRatio(equity: number[]): number {
    // Placeholder for Sharpe Ratio calculation
    return 1.5;
  }

  private calculateSortino(equity: number[]): number {
    // Placeholder for Sortino calculation
    return 2.0;
  }

  private calculateMaxConsecutiveLosses(trades: Trade[]): number {
    let maxLosses = 0;
    let currentLosses = 0;
    for (const trade of trades) {
      if (trade.profit < 0) {
        currentLosses++;
        maxLosses = Math.max(maxLosses, currentLosses);
      } else {
        currentLosses = 0;
      }
    }
    return maxLosses;
  }
  
}
// add types
type TimeframedData = {
  symbol: string;
  timeframe: string;
  data: { time: Date; open: number; high: number; low: number; close: number; volume: number }[];
};

type Indicators = {
  MACD: { MACD: number; signal: number; histogram: number };
};

type TradingStrategies = {
  macdStrategy: (indicators: Indicators) => Promise<{ action: 'BUY' | 'SELL' | 'HOLD'; confidence: number }>;
};

type Position = {
  type: 'BUY' | 'SELL';
  volume: number;
  symbol: string;
};

interface RiskManager {
  validateTrade: (currentCapital: number, position: Position) => Promise<boolean>;
}
