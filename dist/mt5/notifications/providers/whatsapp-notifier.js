var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Suggested code may be subject to a license. Learn more: ~LicenseLog:2597805074.
// Suggested code may be subject to a license. Learn more: ~LicenseLog:3936713146.
import { Client } from 'whatsapp-web.js';
export class WhatsAppNotifier {
    constructor(recipients) {
        this.client = new Client({
            puppeteer: {
                args: ['--no-sandbox'],
            },
        });
        this.recipients = recipients;
        this.initialize();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.initialize();
            this.client.on('qr', (qr) => {
                console.log('WhatsApp QR Code:', qr);
            });
            this.client.on('ready', () => {
                console.log('WhatsApp client ready');
            });
        });
    }
    send(alert) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = this.formatMessage(alert);
            yield Promise.all(this.recipients.map((recipient) => this.client.sendMessage(recipient, message)));
        });
    }
    // add helper methods for formatMessage using
    formatMessage(alert) {
        return `
*Alert Notification*
*Symbol:* ${alert.symbol}
*Action:* ${alert.action}
*Price:* ${alert.price}
*Timestamp:* ${new Date(alert.timestamp).toLocaleString()}
    `;
    }
}
