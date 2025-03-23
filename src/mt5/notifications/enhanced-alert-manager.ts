interface EnhancedAlert extends Alert {
  channels: NotificationChannel[];
  expiryTime?: Date;
  repeatInterval?: number;
  conditions: AlertCondition[];
}

type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'TELEGRAM' | 'DISCORD' | 'WEBHOOK';

interface AlertCondition {
  type: 'PRICE' | 'INDICATOR' | 'PATTERN' | 'TIME' | 'VOLUME' | 'VOLATILITY';
  operator: '>' | '<' | '==' | '>=' | '<=' | 'CROSSES_ABOVE' | 'CROSSES_BELOW';
  value: number | string;
  timeframe?: '1H' | '4H' | '1D';
}

export class EnhancedAlertManager extends AlertManager {
  private notificationProviders: Map<NotificationChannel, NotificationProvider>;
  private activeAlerts: Map<string, EnhancedAlert>;

  constructor(socket: any) {
    super(socket);
    this.initializeNotificationProviders();
  }

  private initializeNotificationProviders() {
    this.notificationProviders = new Map([
      ['EMAIL', new EmailNotifier()],
      ['TELEGRAM', new TelegramNotifier()],
      ['DISCORD', new DiscordNotifier()],
      ['WEBHOOK', new WebhookNotifier()],
    ]);
  }

  async addEnhancedAlert(alert: EnhancedAlert) {
    this.activeAlerts.set(crypto.randomUUID(), alert);
    await this.notifyAllChannels(alert);
  }

  private async notifyAllChannels(alert: EnhancedAlert) {
    const notifications = alert.channels.map((channel) =>
      this.notificationProviders.get(channel)?.send(alert)
    );
    await Promise.all(notifications);
  }

  async checkVolatilityAlerts(symbol: string, atr: number) {
    for (const [id, alert] of this.activeAlerts) {
      const volatilityConditions = alert.conditions.filter((c) => c.type === 'VOLATILITY');

      for (const condition of volatilityConditions) {
        if (this.evaluateCondition(atr, condition)) {
          await this.notifyAllChannels(alert);
        }
      }
    }
  }
}
