export class AlertManager {
    constructor(socket) {
        this.alerts = [];
        this.socket = socket;
    }
    addAlert(alert) {
        this.alerts.push(alert);
        this.notifyClient(alert);
    }
    notifyClient(alert) {
        this.socket.emit('alert', {
            type: alert.type,
            message: alert.message,
            priority: alert.priority,
            timestamp: new Date(),
        });
    }
    checkPriceAlerts(price, symbol) {
        this.alerts
            .filter((alert) => alert.type === 'PRICE')
            .forEach((alert) => {
            // Check price conditions and notify if met
            if (this.evaluateCondition(price, alert.condition)) {
                this.notifyClient(alert);
            }
        });
    }
    checkPatternAlerts(patterns) {
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
