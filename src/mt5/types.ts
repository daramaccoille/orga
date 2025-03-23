// src/mt5/types.ts

export interface TimeframedData {
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
  time: Date[];
}

export interface TradingStrategies {
  [key: string]: any; // Example: MACD, RSI, etc. Add more specific properties as needed
}

export interface RiskManager {
  [key: string]: any; // Example: StopLoss, TakeProfit. Add more specific properties as needed
}

export interface AdvancedBacktester {
  runBacktest(symbol: string, startDate: Date, endDate: Date, initialCapital: number): Promise<AdvancedBacktestResult>;
  optimizeStrategy(parameters: any): Promise<any>;
  shuffleTrades(trades: any): Promise<any>;
  calculateEquityCurve(trades: any): Promise<number[]>;
  calculateConfidenceIntervals(trades: any): Promise<any>;
  calculateDrawdownDistribution(trades: any): Promise<any>;
  calculateProfitDistribution(trades: any): Promise<any>;
}

export interface NeuralNetworkConfig {
    inputShape: number[];
    layers: LayerConfig[];
}
export interface LayerConfig {
    units: number;
    activation?: string;
}
export interface HarmonicPattern {
  type: string;
  xA: number;
  ab: number;
  bc: number;
  cd: number;
  tolerance: number;
  isBullish: boolean;
}

export interface Alert {
  symbol: string;
  condition: any;
  action: string; // buy, sell, hold
}

export interface NotificationProvider {
  send(alert: EnhancedAlert): Promise<void>;
}

export interface MT5Position {
  ticket: number;
  symbol: string;
  type: number; // 0: buy, 1: sell
  volume: number;
  openPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  openTime: Date;
  closeTime?: Date;
  closePrice?: number;
  profit?: number;
  swap?: number;
  commission?: number;
  magic?: number;
}

export interface AdvancedBacktestResult {
  trades: any[];
  metrics: any;
}


export interface ModelResult {
  model: tf.LayersModel;
  train: (data: tf.Tensor) => Promise<tf.History>;
}