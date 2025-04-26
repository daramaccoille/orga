
// src/mt5/types.ts
import * as tf from '@tensorflow/tfjs-node';
export interface Point {
  x: number;
  y: number;
  time: Date;
}

export interface HarmonicPattern {
  type: string;
  points: Point[];
  completion: number;
  direction: 'bullish' | 'bearish';
  fibRatios: {
    XA: number;
    AB: number;
    BC: number;
    CD: number;
    XB?: number;
    AC?: number;
    XD?: number;
  };
}
// Export FlowNode for enhanced-flow-builder
export interface FlowNode {
  id: string;
  type: string;
  data: any;
  position: { x: number; y: number };
}
export interface FlowNode {
  id: string;
  typeFlow: 'INDICATOR' | 'PATTERN' | 'FILTER' | 'CONDITION' | 'ACTION';
  data: any;
  position: { x: number; y: number };
  connections: string[];
}


export interface TimeframedData {
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
  time: Date[];
}

export interface TradingStrategies {
  macdStrategy: (indicators: any) => Promise<{ action: 'BUY' | 'SELL' | 'HOLD'; confidence: number }>;
}

export interface RiskManager {
  validateTrade: (currentCapital: number, position: MT5Position) => Promise<boolean>;
}

export interface BacktestResult {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  netProfit: number;
  maxDrawdown: number;
  trades: Trade[];
  equity: number[];
  metrics: {
    sharpeRatio: number;
    sortino: number;
    maxConsecutiveLosses: number;
  };
}

export interface Trade {
  entry: { price: number; time: Date };
  exit: { price: number; time: Date };
  profit: number;
  type: 'BUY' | 'SELL';
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

export interface NeuralBacktester{
  [key: string]: any
}

export interface NeuralNetworkConfig {
    inputShape: number[];
    layers: LayerConfig[];
}

export interface GANConfig {
  latentDim: number;
  generatorLayers: LayerConfig[];
  discriminatorLayers: number[];
  inputFeatures: string[];
  inputShape: number[];
}

export interface AutoEncoderConfig {
  encoderLayers: number[];
  decoderLayers: number[];
  latentDim: number;
  inputFeatures: string[];
  inputShape: number[];
}

export interface LayerConfig {
    units: number;
    activation?: string;
    dropoutRate?: number;
}


export interface Alert {
  symbol: string;
  condition: any;
  action: string; // buy, sell, hold
}


export interface NotificationProvider {
  send(alert: EnhancedAlert): Promise<void>;
}

export interface EnhancedAlert {
  symbol: any;
  action: any;
  price: any;
  timestamp: string | number | Date;
  message: string;
  type: string;
}

export interface MT5Position{
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

export interface OpenPositionResult {
  retcode: number;
  order: number;
  deal: number;
  comment: string;
  request_id: number;
  time_setup: string;
}