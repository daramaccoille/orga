interface Alert {
  type: 'PRICE' | 'PATTERN' | 'INDICATOR' | 'RISK';
  condition: string;
  message: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class AlertManager {
  private socket: any; // WebSocket connection
  private alerts: Alert[] = [];

  constructor(socket: any) {
    this.socket = socket;
  }

  addAlert(alert: Alert) {
    this.alerts.push(alert);
    this.notifyClient(alert);
  }

  private notifyClient(alert: Alert) {
    this.socket.emit('alert', {
      type: alert.type,
      message: alert.message,
      priority: alert.priority,
      timestamp: new Date(),
    });
  }

  checkPriceAlerts(price: number, symbol: string) {
    this.alerts
      .filter((alert) => alert.type === 'PRICE')
      .forEach((alert) => {
        // Check price conditions and notify if met
        if (this.evaluateCondition(price, alert.condition)) {
          this.notifyClient(alert);
        }
      });
  }

  checkPatternAlerts(patterns: HarmonicPattern[]) {
    patterns.forEach((pattern) => {
      if (pattern.completion > 0.9) {
        this.addAlert({
          type: 'PATTERN',
          condition: `${pattern.type} pattern found`,
          message: `${pattern.type} ${pattern.direction} pattern completed`,
          priority: 'HIGH',
        });
      }
    });
  }
}
