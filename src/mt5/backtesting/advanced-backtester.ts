interface MonteCarloResult {
  confidenceIntervals: {
    ninety: { upper: number; lower: number };
    ninetyFive: { upper: number; lower: number };
  };
  maxDrawdownDistribution: number[];
  profitPotentialDistribution: number[];
}

interface AdvancedBacktestResult extends BacktestResult {
  monteCarloAnalysis: MonteCarloResult;
  walkForwardAnalysis: {
    inSample: BacktestResult;
    outOfSample: BacktestResult;
  };
  optimizationResults: {
    parameters: any;
    performance: number;
  }[];
}

export class AdvancedBacktester extends Backtester {
  async runAdvancedBacktest(
    symbol: string,
    startDate: Date,
    endDate: Date,
    initialCapital: number,
    iterations = 1000
  ): Promise<AdvancedBacktestResult> {
    const baseResult = await this.runBacktest(symbol, startDate, endDate, initialCapital);

    return {
      ...baseResult,
      monteCarloAnalysis: await this.runMonteCarloSimulation(baseResult.trades, iterations),
      walkForwardAnalysis: await this.performWalkForwardAnalysis(
        symbol,
        startDate,
        endDate,
        initialCapital
      ),
      optimizationResults: await this.optimizeStrategy(symbol, startDate, endDate, initialCapital),
    };
  }

  private async runMonteCarloSimulation(
    trades: Trade[],
    iterations: number
  ): Promise<MonteCarloResult> {
    const results: number[][] = [];

    for (let i = 0; i < iterations; i++) {
      const shuffledTrades = this.shuffleTrades(trades);
      const equity = this.calculateEquityCurve(shuffledTrades);
      results.push(equity);
    }

    return {
      confidenceIntervals: this.calculateConfidenceIntervals(results),
      maxDrawdownDistribution: this.calculateDrawdownDistribution(results),
      profitPotentialDistribution: this.calculateProfitDistribution(results),
    };
  }

  private async performWalkForwardAnalysis(
    symbol: string,
    startDate: Date,
    endDate: Date,
    initialCapital: number
  ) {
    const midPoint = new Date((startDate.getTime() + endDate.getTime()) / 2);

    const inSample = await this.runBacktest(symbol, startDate, midPoint, initialCapital);
    const outOfSample = await this.runBacktest(symbol, midPoint, endDate, initialCapital);

    return { inSample, outOfSample };
  }
}
