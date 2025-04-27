var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class EnhancedAlertManager {
    constructor(socket) {
        this.initializeNotificationProviders();
    }
    initializeNotificationProviders() {
        this.notificationProviders = new Map([
            ['EMAIL', new EmailNotifier()],
            ['TELEGRAM', new TelegramNotifier()],
            ['DISCORD', new DiscordNotifier()],
            ['WEBHOOK', new WebhookNotifier()],
        ]);
    }
    addEnhancedAlert(alert) {
        return __awaiter(this, void 0, void 0, function* () {
            this.activeAlerts.set(crypto.randomUUID(), alert);
            yield this.notifyAllChannels(alert);
        });
    }
    notifyAllChannels(alert) {
        return __awaiter(this, void 0, void 0, function* () {
            const notifications = alert.channels.map((channel) => { var _a; return (_a = this.notificationProviders.get(channel)) === null || _a === void 0 ? void 0 : _a.send(alert); });
            yield Promise.all(notifications);
        });
    }
    checkVolatilityAlerts(symbol, atr) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [id, alert] of this.activeAlerts) {
                const volatilityConditions = alert.conditions.filter((c) => c.type === 'VOLATILITY');
                for (const condition of volatilityConditions) {
                    if (this.evaluateCondition(atr, condition)) {
                        yield this.notifyAllChannels(alert);
                    }
                }
            }
        });
    }
    // add helper methods
    evaluateCondition(value, condition) {
        switch (condition.operator) {
            case '>': return value > condition.value;
            case '<': return value < condition.value;
            case '>=': return value >= condition.value;
            case '<=': return value <= condition.value;
            case '==': return value == condition.value;
            default: return false;
        }
    }
}
class BaseNotifier {
    constructor(providerName) {
        this.providerName = providerName;
    }
    send(alert) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Sending ${this.providerName} notification for alert:`, alert);
        });
    }
}
class EmailNotifier extends BaseNotifier {
    constructor() {
        super('EMAIL');
    }
}
class TelegramNotifier extends BaseNotifier {
    constructor() {
        super('TELEGRAM');
    }
}
class DiscordNotifier extends BaseNotifier {
    constructor() {
        super('DISCORD');
    }
}
class WebhookNotifier extends BaseNotifier {
    constructor() {
        super('WEBHOOK');
    }
}
