interface AdvancedStrategyComponent extends StrategyComponent {
  subComponents?: StrategyComponent[];
  logicOperator?: 'AND' | 'OR' | 'THEN';
  timeframes: ('1H' | '4H' | '1D')[];
  filters?: {
    volatility?: { min?: number; max?: number };
    volume?: { min?: number; max?: number };
    time?: { start?: string; end?: string; timezone?: string };
  };
}

interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  components: AdvancedStrategyComponent[];
}
