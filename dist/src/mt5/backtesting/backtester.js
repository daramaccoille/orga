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
}
