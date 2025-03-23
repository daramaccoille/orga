export class AdvancedTechnicalAnalysis {
    calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
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
    calculateFibonacci(high, low) {
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
    calculateBollinger(prices, period = 20, stdDev = 2) {
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
    calculateEMA(prices, period) {
        const multiplier = 2 / (period + 1);
        const ema = [prices[0]];
        for (let i = 1; i < prices.length; i++) {
            ema.push((prices[i] - ema[i - 1]) * multiplier + ema[i - 1]);
        }
        return ema;
    }
    calculateSMA(prices, period) {
        const sma = [];
        for (let i = period - 1; i < prices.length; i++) {
            sma.push(prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period);
        }
        return sma;
    }
    calculateStdDev(prices, period) {
        const sma = this.calculateSMA(prices.slice(-period), period)[0];
        const squareDiffs = prices.slice(-period).map((price) => Math.pow(price - sma, 2));
        return Math.sqrt(squareDiffs.reduce((a, b) => a + b) / period);
    }
}
