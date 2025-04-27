var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Backtester {
    constructor(strategy, riskManager) {
        this.strategy = strategy;
        this.riskManager = riskManager;
        this.historicalData = new Map();
    }
    runBacktest(symbol, startDate, endDate, initialCapital) {
        return __awaiter(this, void 0, void 0, function* () {
            const trades = [];
            const equity = [initialCapital];
            let currentCapital = initialCapital;
            // Get historical data for all timeframes
            yield this.loadHistoricalData(symbol, startDate, endDate);
            // Iterate through each candle
            for (let currentTime = startDate; currentTime <= endDate; currentTime.setMinutes(currentTime.getMinutes() + 1)) {
                const indicators = yield this.calculateIndicators(currentTime);
                const signal = yield this.strategy.macdStrategy(indicators);
                if (signal.action !== 'HOLD' && signal.confidence > 0.7) {
                    // Validate trade with risk manager
                    const position = {
                        type: signal.action,
                        volume: this.calculatePositionSize(currentCapital),
                        symbol,
                    };
                    if (yield this.riskManager.validateTrade(currentCapital, position)) {
                        const trade = yield this.executeTrade(position, currentTime);
                        trades.push(trade);
                        currentCapital += trade.profit;
                        equity.push(currentCapital);
                    }
                }
            }
            return this.calculateResults(trades, equity);
        });
    }
    calculateResults(trades, equity) {
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
    loadHistoricalData(symbol, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN1'];
            for (const timeframe of timeframes) {
                const data = yield this.fetchData(symbol, startDate, endDate, timeframe);
                this.historicalData.set(`${symbol}_${timeframe}`, data);
            }
        });
    }
    fetchData(symbol, startDate, endDate, timeframe) {
        return __awaiter(this, void 0, void 0, function* () {
            // Placeholder for fetching data
            return new Promise(resolve => setTimeout(() => resolve({
                symbol,
                timeframe,
                data: [{ time: new Date(), open: 10, high: 12, low: 9, close: 11, volume: 100 }],
            }), 1000));
        });
    }
    calculateIndicators(currentTime) {
        return __awaiter(this, void 0, void 0, function* () {
            // Placeholder for indicator calculation
            return {
                MACD: { MACD: 0, signal: 0, histogram: 0 },
            };
        });
    }
    calculatePositionSize(currentCapital) {
        // Placeholder for position size calculation
        return currentCapital * 0.01;
    }
    executeTrade(position, currentTime) {
        return __awaiter(this, void 0, void 0, function* () {
            // Placeholder for trade execution
            return new Promise(resolve => setTimeout(() => resolve({
                entry: { price: 11, time: currentTime },
                exit: { price: position.type === 'BUY' ? 12 : 10, time: new Date(currentTime.getTime() + 60000) },
                profit: position.type === 'BUY' ? 1 : -1,
                type: position.type,
            }), 100));
        });
    }
    calculateProfitFactor(trades) {
        const totalProfit = trades.filter((t) => t.profit > 0).reduce((acc, t) => acc + t.profit, 0);
        const totalLoss = trades.filter((t) => t.profit < 0).reduce((acc, t) => acc + Math.abs(t.profit), 0);
        return totalLoss === 0 ? Infinity : totalProfit / totalLoss;
    }
    calculateMaxDrawdown(equity) {
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
    calculateSharpeRatio(equity) {
        // Placeholder for Sharpe Ratio calculation
        return 1.5;
    }
    calculateSortino(equity) {
        // Placeholder for Sortino calculation
        return 2.0;
    }
    calculateMaxConsecutiveLosses(trades) {
        let maxLosses = 0;
        let currentLosses = 0;
        for (const trade of trades) {
            if (trade.profit < 0) {
                currentLosses++;
                maxLosses = Math.max(maxLosses, currentLosses);
            }
            else {
                currentLosses = 0;
            }
        }
        return maxLosses;
    }
}
