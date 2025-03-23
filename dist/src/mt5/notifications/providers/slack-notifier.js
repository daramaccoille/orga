var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { WebClient } from '@slack/web-api';
export class SlackNotifier {
    constructor(token, channel) {
        this.client = new WebClient(token);
        this.channel = channel;
    }
    send(alert) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.chat.postMessage({
                    channel: this.channel,
                    text: this.formatMessage(alert),
                    blocks: this.createBlocks(alert),
                });
            }
            catch (error) {
                console.error('Failed to send Slack notification:', error);
                throw error;
            }
        });
    }
    createBlocks(alert) {
        return [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: `🚨 ${alert.type} Alert`,
                },
            },
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*Condition:*\n${alert.conditions
                            .map((c) => `${c.type} ${c.operator} ${c.value}`)
                            .join('\n')}`,
                    },
                    {
                        type: 'mrkdwn',
                        text: `*Priority:*\n${alert.priority}`,
                    },
                ],
            },
        ];
    }
}
