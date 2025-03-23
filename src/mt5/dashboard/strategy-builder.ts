interface StrategyComponent {
  type: 'INDICATOR' | 'PATTERN' | 'CONDITION';
  parameters: any;
}

interface CustomStrategy {
  name: string;
  components: StrategyComponent[];
  conditions: string[];
  timeframes: ('1H' | '4H' | '1D')[];
}
