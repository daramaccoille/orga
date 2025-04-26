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
    // add more methods for checking other types of alerts
    checkIndicatorAlerts(indicators) {
        indicators.forEach((indicator) => {
            if (indicator.value > indicator.threshold) {
                this.addAlert({
                    type: 'INDICATOR',
                    condition: `${indicator.name} is above threshold`,
                    message: `${indicator.name} value ${indicator.value} is above threshold ${indicator.threshold}`,
                    priority: 'MEDIUM',
                });
            }
        });
    }
    checkRiskAlerts(risk) {
        risk.forEach((r) => {
            if (r.currentRisk > r.maxRisk) {
                this.addAlert({
                    type: 'RISK',
                    condition: `current risk ${r.currentRisk} above max risk ${r.maxRisk}`,
                    message: `current risk ${r.currentRisk} is above max risk ${r.maxRisk}`,
                    priority: 'HIGH',
                });
            }
        });
    }
    evaluateCondition(price, condition) {
        try {
            // Basic condition evaluation for price, e.g., "> 100", "< 50", "== 75"
            return eval(price + condition); // Use with caution, potential security risk
        }
        catch (error) {
            console.error('Error evaluating condition:', error);
            return false;
        }
    }
}
