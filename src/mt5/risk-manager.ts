import { MT5Position } from "./types";

export interface RiskParameters {
  maxLossPerTrade: number;
  maxDailyLoss: number;
  maxPositions: number;
  maxLotSize: number;
  riskPercentPerTrade: number;
}

export class RiskManager {
  private riskParams: RiskParameters;
  private dailyLoss = 0;
  private openPositionsCount = 0;

  constructor(params: RiskParameters) {
    this.riskParams = params;
  }

  async validateTrade(balance: number, position: MT5Position): Promise<boolean> {
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
  }

  private calculatePositionSize(riskAmount: number, position: MT5Position): number {
    // Implement position sizing logic based on risk amount and current price
    return Math.min(riskAmount / 2000, this.riskParams.maxLotSize);
  }
}
