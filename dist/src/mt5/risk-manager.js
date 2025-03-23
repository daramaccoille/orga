var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class RiskManager {
    constructor(params) {
        this.dailyLoss = 0;
        this.openPositionsCount = 0;
        this.riskParams = params;
    }
    validateTrade(balance, position) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check number of positions
            if (this.openPositionsCount >= this.riskParams.maxPositions) {
                throw new Error('Maximum number of positions reached');
            }
            // Check lot size
            if (position.volume > this.riskParams.maxLotSize) {
                throw new Error('Lot size exceeds maximum allowed');
            }
            // Calculate position size based on risk percentage
            const riskAmount = balance * (this.riskParams.riskPercentPerTrade / 100);
            const suggestedLotSize = this.calculatePositionSize(riskAmount, position);
            if (position.volume > suggestedLotSize) {
                throw new Error(`Position size too large. Suggested size: ${suggestedLotSize}`);
            }
            return true;
        });
    }
    calculatePositionSize(riskAmount, position) {
        // Implement position sizing logic based on risk amount and current price
        return Math.min(riskAmount / 1000, this.riskParams.maxLotSize);
    }
}
