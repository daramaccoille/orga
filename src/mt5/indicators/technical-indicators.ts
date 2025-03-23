export interface TimeframedData {
  '1H': number[];
  '4H': number[];
  '1D': number[];
}

export interface AdvancedIndicators extends TechnicalIndicators {
  fibonacci: {
    retracement: number[];
    extension: number[];
    fans: number[];
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
  };
  ichimoku: {
    tenkan: number;
    kijun: number;
    senkouA: number;
    senkouB: number;
    chikou: number;
  };
  timeframes: {
    [key in '1H' | '4H' | '1D']: {
      macd: {
        main: number;
        signal: number;
        histogram: number;
      };
      rsi: number;
    };
  };
}

export class AdvancedTechnicalAnalysis {
  calculateMACD(prices: number[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
    const signalLine = this.calculateEMA(macdLine, signalPeriod);
    const histogram = macdLine.map((macd, i) => macd - signalLine[i]);

    return {
      main: macdLine[macdLine.length - 1],
      signal: signalLine[signalLine.length - 1],
      histogram: histogram[histogram.length - 1],
    };
  }

  calculateFibonacci(high: number, low: number) {
    const diff = high - low;
    return {
      retracement: [
        high,
        high - diff * 0.236,
        high - diff * 0.382,
        high - diff * 0.5,
        high - diff * 0.618,
        low,
      ],
      extension: [low - diff * 0.618, low - diff, low - diff * 1.618, low - diff * 2.618],
      fans: [diff * 0.382, diff * 0.5, diff * 0.618],
    };
  }

  calculateBollinger(prices: number[], period = 20, stdDev = 2) {
    const sma = this.calculateSMA(prices, period);
    const middle = sma[sma.length - 1];
    const std = this.calculateStdDev(prices, period);

    return {
      upper: middle + std * stdDev,
      middle: middle,
      lower: middle - std * stdDev,
      bandwidth: (middle + std * stdDev - (middle - std * stdDev)) / middle,
    };
  }

  private calculateEMA(prices: number[], period: number): number[] {
    const multiplier = 2 / (period + 1);
    const ema = [prices[0]];

    for (let i = 1; i < prices.length; i++) {
      ema.push((prices[i] - ema[i - 1]) * multiplier + ema[i - 1]);
    }

    return ema;
  }

  private calculateSMA(prices: number[], period: number): number[] {
    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      sma.push(prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period);
    }
    return sma;
  }

  private calculateStdDev(prices: number[], period: number): number {
    const sma = this.calculateSMA(prices.slice(-period), period)[0];
    const squareDiffs = prices.slice(-period).map((price) => Math.pow(price - sma, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b) / period);
  }
}
