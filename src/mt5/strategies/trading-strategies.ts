import { AdvancedIndicators } from '../indicators/technical-indicators';
import { RiskParameters } from '../risk-manager';

interface StrategySignal {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reason: string;
}

export class TradingStrategies {
  private riskParams: RiskParameters;

  constructor(riskParams: RiskParameters) {
    this.riskParams = riskParams;
    this.timeframes = {}; // Initialize timeframes
  }
  
// fix for  'any' type because expression of type 'string' can't be used to index type '{ "1H": { macd: { main: number; signal: number; histogram: number; };
  timeframes!: {
    [key: string]: {
      macd: { main: number; signal: number; histogram: number; };
      rsi: number;
      sma20: number;
      sma50: number;
      bollingerBands: { upperBand: number; lowerBand: number; middleBand: number; };
      close: number;
    };
  };

  async macdStrategy(indicators: AdvancedIndicators): Promise<StrategySignal> {
    const signals: StrategySignal[] = await Promise.all(
      ['1H', '4H', '1D'].map(async (timeframe) => {
        const macd = indicators.timeframes[timeframe as keyof typeof indicators.timeframes].macd;
        const rsi = indicators.timeframes[timeframe as keyof typeof indicators.timeframes].rsi;

        if (macd.histogram > 0 && macd.histogram > macd.signal && rsi < 70) {
          return {
            action: 'BUY',
            confidence: 0.7,
            reason: `MACD bullish crossover on ${timeframe} with RSI < 70`,
          };
        } else if (macd.histogram < 0 && macd.histogram < macd.signal && rsi > 30) {
          return {
            action: 'SELL',
            confidence: 0.7,
            reason: `MACD bearish crossover on ${timeframe} with RSI > 30`,
          };
        }

        return {
          action: 'HOLD',
          confidence: 0.5,
          reason: `No clear signal on ${timeframe}`,
        };
      })
    );

    // Combine signals from different timeframes
    const buySignals = signals.filter((s) => s.action === 'BUY');
    const sellSignals = signals.filter((s) => s.action === 'SELL');

    if (buySignals.length >= 2) {
      return {
        action: 'BUY',
        confidence: buySignals.reduce((acc, s) => acc + s.confidence, 0) / buySignals.length,
        reason: 'Multiple timeframe buy signal',
      };
    } else if (sellSignals.length >= 2) {
      return {
        action: 'SELL',
        confidence: sellSignals.reduce((acc, s) => acc + s.confidence, 0) / sellSignals.length,
        reason: 'Multiple timeframe sell signal',
      };
    }

    return {
      action: 'HOLD',
      confidence: 0.5,
      reason: 'No clear multi-timeframe signal',
    };
  }

  async fibonacciStrategy(indicators: AdvancedIndicators): Promise<StrategySignal> {
    // Implement Fibonacci-based strategy
    // This would look for price action near key Fibonacci levels
    return {
      action: 'HOLD',
      confidence: 0.5,
      reason: 'Fibonacci strategy implementation pending',
    };
  }
  // add type checks for other strategies
  
  async movingAverageStrategy(indicators: AdvancedIndicators): Promise<StrategySignal> {
    const sma20 = indicators.timeframes['1D'].sma20;
    const sma50 = indicators.timeframes['1D'].sma50;
    const rsi = indicators.timeframes['1D'].rsi;

    if (sma20 > sma50 && rsi < 70) {
      return {
        action: 'BUY',
        confidence: 0.7,
        reason: '20-day SMA above 50-day SMA with RSI < 70',
      };
    } else if (sma20 < sma50 && rsi > 30) {
      return {
        action: 'SELL',
        confidence: 0.7,
        reason: '20-day SMA below 50-day SMA with RSI > 30',
      };
    }
    return {
      action: 'HOLD',
      confidence: 0.5,
      reason: 'No clear moving average signal',
    };
  }

  // add more methods for other strategies
    async bollingerBandStrategy(indicators: AdvancedIndicators): Promise<StrategySignal> {
    const bb = indicators.timeframes['1H'].bollingerBands;
    const close = indicators.timeframes['1H'].close;

    if (close < bb.lowerBand) {
      return {
        action: 'BUY',
        confidence: 0.6,
        reason: 'Price below lower Bollinger Band',
      };
    } else if (close > bb.upperBand) {
      return {
        action: 'SELL',
        confidence: 0.6,
        reason: 'Price above upper Bollinger Band',
      };
    }

    return {
      action: 'HOLD',
      confidence: 0.5,
      reason: 'Price within Bollinger Bands',
    };
  }

}
