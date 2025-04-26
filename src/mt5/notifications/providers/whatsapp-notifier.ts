// Suggested code may be subject to a license. Learn more: ~LicenseLog:2597805074.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:3936713146.
import { Client } from 'whatsapp-web.js';
import { NotificationProvider, EnhancedAlert } from '../../types';

export class WhatsAppNotifier implements NotificationProvider {
  private client: Client;
  private recipients: string[];

  constructor(recipients: string[]) {
    this.client = new Client({
      puppeteer: {
        args: ['--no-sandbox'],
      },
    });
    this.recipients = recipients;
    this.initialize();
  }

  private async initialize() {
    await this.client.initialize();

    this.client.on('qr', (qr) => {
      console.log('WhatsApp QR Code:', qr);
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client ready');
    });
  }

  async send(alert: EnhancedAlert): Promise<void> {
    const message = this.formatMessage(alert);

    await Promise.all(
      this.recipients.map((recipient) => this.client.sendMessage(recipient, message))
    );
  }
// add helper methods for formatMessage using
  private formatMessage(alert: EnhancedAlert): string {
    return `
*Alert Notification*
*Symbol:* ${alert.symbol}
*Action:* ${alert.action}
*Price:* ${alert.price}
*Timestamp:* ${new Date(alert.timestamp).toLocaleString()}
    `;
  }

}
