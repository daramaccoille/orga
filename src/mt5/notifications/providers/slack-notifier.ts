import { WebClient } from '@slack/web-api';

export class SlackNotifier implements NotificationProvider {
  private client: WebClient;
  private channel: string;

  constructor(token: string, channel: string) {
    this.client = new WebClient(token);
    this.channel = channel;
  }

  async send(alert: EnhancedAlert): Promise<void> {
    try {
      await this.client.chat.postMessage({
        channel: this.channel,
        text: this.formatMessage(alert),
        blocks: this.createBlocks(alert),
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      throw error;
    }
  }

  private createBlocks(alert: EnhancedAlert) {
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
