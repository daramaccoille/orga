export interface TimeframedData {
  '1H': number[];
  '4H': number[];
  '1D': number[];
}

export interface AdvancedIndicators {
  macd: {
      main: number;
      signal: number;
      histogram: number;
  };
  rsi: number;
  stochastic: {
      k: number;
      d: number;
  };
  atr: number;

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
          sma20: any;
          sma50: any;
          bollingerBands: any;
          close: any;
          macd: {
              main: number;
              signal: number;
              histogram: number;
          };
          rsi: number;
      };
  };
}
export class TechnicalIndicators {
  public calculateRSI(prices: number[], period = 14): number {
      const deltas = prices.slice(-period - 1).map((price, i, arr) => (i > 0 ? price - arr[i - 1] : 0)).slice(1);
      const gains = deltas.map((delta) => (delta > 0 ? delta : 0));
      const losses = deltas.map((delta) => (delta < 0 ? Math.abs(delta) : 0));
      const avgGain = this.calculateSMA(gains, period);
      const avgLoss = this.calculateSMA(losses, period);
      const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
      return Math.round(100 - 100 / (1 + rs));
  }

  public calculateSMA(prices: number[], period: number): number {
      if (prices.length < period) {
          return 0; // Not enough data for accurate calculation
      }
      const sum = prices.slice(prices.length - period).reduce((a, b) => a + b, 0);
      return Math.round(sum / period);
  }

  private calculateEMA(prices: number[], period: number): number[] {
      const multiplier = 2 / (period + 1);
      const ema = [prices[0]];

      for (let i = 1; i < prices.length; i++) {
          ema.push((prices[i] - ema[i - 1]) * multiplier + ema[i - 1]);
      }

      return ema;
  }
  public calculateMACD(prices: number[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
      const fastEMA = this.calculateEMA(prices, fastPeriod);
      const slowEMA = this.calculateEMA(prices, slowPeriod);
      const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
      const signalLine = this.calculateEMA(macdLine, signalPeriod);
      const histogram = macdLine.map((macd, i) => macd - signalLine[i]);

      return {
          main: Math.round(macdLine[macdLine.length - 1]),
          signal: Math.round(signalLine[signalLine.length - 1]),
          histogram: Math.round(histogram[histogram.length - 1]),
      };
  }

  public calculateFibonacci(high: number, low: number) {
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

  public calculateBollinger(prices: number[], period = 20, stdDev = 2) {
      const sma = this.calculateSMA(prices, period);
      const middle = sma;
      const std = this.calculateStdDev(prices, period);

      return {
          upper: Math.round(middle + std * stdDev),
          middle: Math.round(middle),
          lower: Math.round(middle - std * stdDev),
          bandwidth: Math.round((middle + std * stdDev - (middle - std * stdDev)) / middle),
      };
  }

  private calculateStdDev(prices: number[], period: number): number {
      const sma = this.calculateSMA(prices.slice(-period), period);
      const squareDiffs = prices.slice(-period).map((price) => Math.pow(price - sma, 2));
      return Math.round(Math.sqrt(squareDiffs.reduce((a, b) => a + b) / period));
  }

  public calculateStochastic(prices: number[], period = 14, kPeriod = 3, dPeriod = 3): { k: number; d: number } {
      const lows = prices.slice(-period).sort((a, b) => a - b);
      const highs = prices.slice(-period).sort((a, b) => b - a);
      const lowestLow = lows[0];
      const highestHigh = highs[0];
      const currentClose = prices[prices.length - 1];
      const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
      const kValues = [];
      for (let i = prices.length - period; i < prices.length; i++) {
          const lows = prices.slice(i - period >= 0 ? i - period : 0, i).sort((a, b) => a - b);
          const highs = prices.slice(i - period >= 0 ? i - period : 0, i).sort((a, b) => b - a);
          const lowestLow = lows[0];
          const highestHigh = highs[0];
          const currentClose = prices[i];
          kValues.push(((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100)
      }
      const d = this.calculateSMA(kValues.slice(-kPeriod), kPeriod);
      return {
          k: Math.round(k),
          d: Math.round(d),
      };
  }

  public calculateATR(highs: number[], lows: number[], closes: number[], period = 14): number {
      const trs: number[] = [];
      for (let i = 1; i < highs.length; i++) {
          const high = highs[i];
          const low = lows[i];
          const prevClose = closes[i - 1];
          const tr = Math.max(
              high - low,
              Math.abs(high - prevClose),
              Math.abs(low - prevClose)
          );
          trs.push(tr);
      }
      return Math.round(this.calculateSMA(trs, period));
  }

  public calculateIchimoku(highs: number[], lows: number[], closes: number[], periodTenkan = 9, periodKijun = 26, periodSenkouB = 52, periodChikou = 26): { tenkan: number; kijun: number; senkouA: number; senkouB: number; chikou: number } {
      const tenkanValues: number[] = [];
      const kijunValues: number[] = [];
      const senkouBValues: number[] = [];
      for (let i = periodTenkan - 1; i < highs.length; i++) {
          const lowsTenkan = lows.slice(i - periodTenkan + 1, i + 1).sort((a, b) => a - b);
          const highsTenkan = highs.slice(i - periodTenkan + 1, i + 1).sort((a, b) => b - a);
          tenkanValues.push((lowsTenkan[0] + highsTenkan[0]) / 2);
      }
      for (let i = periodKijun - 1; i < highs.length; i++) {
          const lowsKijun = lows.slice(i - periodKijun + 1, i + 1).sort((a, b) => a - b);
          const highsKijun = highs.slice(i - periodKijun + 1, i + 1).sort((a, b) => b - a);
          kijunValues.push((lowsKijun[0] + highsKijun[0]) / 2);
      }
      for (let i = periodSenkouB - 1; i < highs.length; i++) {
          const lowsSenkouB = lows.slice(i - periodSenkouB + 1, i + 1).sort((a, b) => a - b);
          const highsSenkouB = highs.slice(i - periodSenkouB + 1, i + 1).sort((a, b) => b - a);
          senkouBValues.push((lowsSenkouB[0] + highsSenkouB[0]) / 2);
      }

      const tenkan = tenkanValues[tenkanValues.length - 1];
      const kijun = kijunValues[kijunValues.length - 1];
      const senkouA = (tenkan + kijun) / 2;
      const senkouB = senkouBValues[senkouBValues.length - 1];
      const chikou = closes.length - 1 - periodChikou;

      return {
          tenkan: Math.round(tenkan),
          kijun: Math.round(kijun),
          senkouA: Math.round(senkouA),
          senkouB: Math.round(senkouB),
          chikou: Math.round(chikou)
      };
  }
  // add for SMA strategy
  public calculateSMAs(prices: number[], shortPeriod = 20, longPeriod = 50): { short: number; long: number } {
      const shortSMA = this.calculateSMA(prices, shortPeriod);
      const longSMA = this.calculateSMA(prices, longPeriod);

      return {
          short: Math.round(shortSMA),
          long: Math.round(longSMA),
      };
  }
  public calculateTimeframedIndicators(prices: TimeframedData): AdvancedIndicators['timeframes'] {
      const timeframes: AdvancedIndicators['timeframes'] = {
          '1H': {
              macd: { main: 0, signal: 0, histogram: 0 },
              rsi: 0,
              sma20: 0,       // Placeholder for sma20
              sma50: 0,       // Placeholder for sma50
              bollingerBands: { upperBand: 0, lowerBand: 0, middleBand: 0 }, // Placeholder for bollingerBands
              close: 0,      // Placeholder for close
          },
          '4H': {
              macd: { main: 0, signal: 0, histogram: 0 },
              rsi: 0,
              sma20: 0,       // Placeholder for sma20
              sma50: 0,       // Placeholder for sma50
              bollingerBands: { upperBand: 0, lowerBand: 0, middleBand: 0 }, // Placeholder for bollingerBands
              close: 0,      // Placeholder for close
          },
          '1D': {
              macd: { main: 0, signal: 0, histogram: 0 },
              rsi: 0,
              sma20: 0,       // Placeholder for sma20
              sma50: 0,       // Placeholder for sma50
              bollingerBands: { upperBand: 0, lowerBand: 0, middleBand: 0 }, // Placeholder for bollingerBands
              close: 0,      // Placeholder for close
          },
      };

      for (const timeframe in prices) {
          const priceArray = prices[timeframe as keyof TimeframedData];
          timeframes[timeframe as '1H' | '4H' | '1D'].macd = this.calculateMACD(priceArray);
          timeframes[timeframe as '1H' | '4H' | '1D'].rsi = this.calculateRSI(priceArray);
      }
      return timeframes;
  }
}
