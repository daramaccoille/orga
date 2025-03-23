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

export interface FlowNode {
  id: string;
  type: 'INDICATOR' | 'PATTERN' | 'FILTER' | 'CONDITION' | 'ACTION';
  data: any;
  position: { x: number; y: number };
  connections: string[];
}
