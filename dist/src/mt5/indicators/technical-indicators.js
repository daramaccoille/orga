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
    // add more methods for other indicators
    calculateRSI(prices, period = 14) {
        const deltas = prices.slice(-period - 1).map((price, i, arr) => (i > 0 ? price - arr[i - 1] : 0)).slice(1);
        const gains = deltas.map((delta) => (delta > 0 ? delta : 0));
        const losses = deltas.map((delta) => (delta < 0 ? Math.abs(delta) : 0));
        const avgGain = this.calculateSMA(gains, period)[0];
        const avgLoss = this.calculateSMA(losses, period)[0];
        const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
        return 100 - 100 / (1 + rs);
    }
    calculateStochastic(prices, period = 14, kPeriod = 3, dPeriod = 3) {
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
            kValues.push(((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100);
        }
        const d = this.calculateSMA(kValues.slice(-kPeriod), kPeriod)[0];
        return {
            k: k,
            d: d,
        };
    }
    calculateATR(highs, lows, closes, period = 14) {
        const trs = [];
        for (let i = 1; i < highs.length; i++) {
            const high = highs[i];
            const low = lows[i];
            const prevClose = closes[i - 1];
            const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
            trs.push(tr);
        }
        return this.calculateSMA(trs, period)[0];
    }
    calculateIchimoku(highs, lows, periodTenkan = 9, periodKijun = 26, periodSenkouB = 52, periodChikou = 26) {
        const tenkanValues = [];
        const kijunValues = [];
        const senkouBValues = [];
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
        const chikou = close.length - 1 - periodChikou;
        return {
            tenkan: tenkan,
            kijun: kijun,
            senkouA: senkouA,
            senkouB: senkouB,
            chikou: chikou
        };
    }
    // add for SMA strategy
    calculateSMAs(prices, shortPeriod = 20, longPeriod = 50) {
        const shortSMA = this.calculateSMA(prices, shortPeriod)[this.calculateSMA(prices, shortPeriod).length - 1];
        const longSMA = this.calculateSMA(prices, longPeriod)[this.calculateSMA(prices, longPeriod).length - 1];
        return {
            short: shortSMA,
            long: longSMA,
        };
    }
    calculateTimeframedIndicators(prices) {
        const timeframes = {
            '1H': {
                macd: { main: 0, signal: 0, histogram: 0 },
                rsi: 0,
                sma20: 0, // Placeholder for sma20
                sma50: 0, // Placeholder for sma50
                bollingerBands: { upperBand: 0, lowerBand: 0, middleBand: 0 }, // Placeholder for bollingerBands
                close: 0, // Placeholder for close
            },
            '4H': {
                macd: { main: 0, signal: 0, histogram: 0 },
                rsi: 0,
                sma20: 0, // Placeholder for sma20
                sma50: 0, // Placeholder for sma50
                bollingerBands: { upperBand: 0, lowerBand: 0, middleBand: 0 }, // Placeholder for bollingerBands
                close: 0, // Placeholder for close
            },
            '1D': {
                macd: { main: 0, signal: 0, histogram: 0 },
                rsi: 0,
                sma20: 0, // Placeholder for sma20
                sma50: 0, // Placeholder for sma50
                bollingerBands: { upperBand: 0, lowerBand: 0, middleBand: 0 }, // Placeholder for bollingerBands
                close: 0, // Placeholder for close
            },
        };
        for (const timeframe in prices) {
            const priceArray = prices[timeframe];
            timeframes[timeframe].macd = this.calculateMACD(priceArray);
            timeframes[timeframe].rsi = this.calculateRSI(priceArray);
        }
        return timeframes;
    }
}
