var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class AdvancedBacktester extends Backtester {
    runAdvancedBacktest(symbol_1, startDate_1, endDate_1, initialCapital_1) {
        return __awaiter(this, arguments, void 0, function* (symbol, startDate, endDate, initialCapital, iterations = 1000) {
            const baseResult = yield this.runBacktest(symbol, startDate, endDate, initialCapital);
            return Object.assign(Object.assign({}, baseResult), { monteCarloAnalysis: yield this.runMonteCarloSimulation(baseResult.trades, iterations), walkForwardAnalysis: yield this.performWalkForwardAnalysis(symbol, startDate, endDate, initialCapital), optimizationResults: yield this.optimizeStrategy(symbol, startDate, endDate, initialCapital) });
        });
    }
    runMonteCarloSimulation(trades, iterations) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
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
        });
    }
    performWalkForwardAnalysis(symbol, startDate, endDate, initialCapital) {
        return __awaiter(this, void 0, void 0, function* () {
            const midPoint = new Date((startDate.getTime() + endDate.getTime()) / 2);
            const inSample = yield this.runBacktest(symbol, startDate, midPoint, initialCapital);
            const outOfSample = yield this.runBacktest(symbol, midPoint, endDate, initialCapital);
            return { inSample, outOfSample };
        });
    }
}
