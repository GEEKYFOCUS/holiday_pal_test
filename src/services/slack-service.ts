import { App, LogLevel, SayFn, RespondFn, AckFn, KnownBlock } from '@slack/bolt';
import { Holiday, SlackMessage } from '../types';
import { defaultConfig, countryFlags } from '../config/default-config';
import { HolidayService } from "./holiday-service";

export class SlackService {
  private app: App;
  private botToken: string;
  private holidayService: HolidayService;

  constructor() {
    this.botToken = process.env.SLACK_BOT_TOKEN || '';
    this.holidayService = new HolidayService();
    this.app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      socketMode: true,
      appToken: process.env.SLACK_APP_TOKEN,
      logLevel: LogLevel.INFO,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.app.event('app_mention', async ({ event, say }: { event: any; say: SayFn }) => {
      await say(`Hello! I'm your Holiday Reminder Bot. Use \`/holidays\` to see upcoming holidays or \`/holidays help\` for more commands.`);
    });

    this.app.command('/holidays', async ({ command, ack, respond }: { command: any; ack: AckFn<any>; respond: RespondFn }) => {
      await ack();
      
      const text = command.text?.toLowerCase() || '';
      
      if (text.includes('help')) {
        await respond({
          response_type: "in_channel",
          text: 'Available commands:\n• `/holidays` - Show upcoming holidays\n• `/holidays tomorrow` - Show tomorrow\'s holidays\n• `/holidays help` - Show this help message',
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "🎉 Holiday Bot Commands",
                emoji: true
              }
            },
            {
              type: "divider"
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*Available Commands:*"
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "• `/holidays` - Show upcoming holidays for all countries\n• `/holidays tomorrow` - Show tomorrow's holidays\n• `/holidays help` - Show this help message"
              }
            },
            {
              type: "divider"
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: "💡 Use these commands in any channel to get holiday information!"
                }
              ]
            }
          ]
        });
        return;
      }

      if (text.includes('tomorrow')) {
        await this.handleTomorrowHolidays(respond);
        return;
      }

      await this.handleUpcomingHolidays(respond);
    });

    this.app.message(async ({ message, say }: { message: any; say: SayFn }) => {
      if (message.channel_type === 'im') {
        await say('Hello! I can help you with holiday information. Use `/holidays` in any channel or DM me for help.');
      }
    });
  }

  private async handleTomorrowHolidays(respond: any): Promise<void> {
    const tomorrowHolidays = await this.getTomorrowHolidaysForAllCountries();
    
    if (tomorrowHolidays.every(({ holidays }) => holidays.length === 0)) {
      await respond({
        response_type: "in_channel",
        text: 'No public holidays tomorrow across all configured countries.',
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "📅 No Public Holidays Tomorrow",
              emoji: true
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "No public holidays scheduled for tomorrow across all configured countries."
            }
          }
        ]
      });
      return;
    }

    const blocks = this.formatTomorrowHolidaysBlocks(tomorrowHolidays);
    console.log(JSON.stringify(blocks, null, 2), "tomorrow blocks");
    await respond({
      response_type: "in_channel",
      text: this.formatTomorrowHolidaysMessage(tomorrowHolidays),
      blocks: blocks
    });
  }

  private async handleUpcomingHolidays(respond: any): Promise<void> {
    const upcomingHolidays = await this.getUpcomingHolidaysForAllCountries();
    if (upcomingHolidays.every(({ holidays }) => holidays.length === 0)) {
      await respond({
        response_type: "in_channel",
        text: 'No upcoming public holidays found.',
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "📅 No Upcoming Public Holidays",
              emoji: true
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "No public holidays found in the next 30 days across all configured countries."
            }
          }
        ]
      });
      return;
    }

    const blocks = this.formatUpcomingHolidaysBlocks(upcomingHolidays);
    console.log(JSON.stringify(blocks, null, 2), "upcoming blocks");
    await respond({
      response_type: "in_channel",
      text: this.formatUpcomingHolidaysMessage(upcomingHolidays),
      blocks: blocks
    });
  }

  private async getTomorrowHolidaysForAllCountries(): Promise<Array<{ country: string; holidays: Holiday[] }>> {
    const results: Array<{ country: string; holidays: Holiday[] }> = [];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const countryConfig of defaultConfig.countries) {
      if (!countryConfig.enabled) continue;
      try {
        const holidays = await this.holidayService.getHolidaysForTomorrow(countryConfig.countryCode);
        results.push({ country: countryConfig.countryCode, holidays });
      } catch (error) {
        console.error(`Error fetching tomorrow's holidays for ${countryConfig.countryCode}:`, error);
        results.push({ country: countryConfig.countryCode, holidays: [] });
      }
    }
    return results;
  }

  private async getUpcomingHolidaysForAllCountries(): Promise<Array<{ country: string; holidays: Holiday[] }>> {
    const results: Array<{ country: string; holidays: Holiday[] }> = [];
    for (const countryConfig of defaultConfig.countries) {
      if (!countryConfig.enabled) continue;
      try {
        const upcomingHolidays = await this.holidayService.getUpcomingHolidays(countryConfig.countryCode, 30);
        results.push({ country: countryConfig.countryCode, holidays: upcomingHolidays });
      } catch (error) {
        console.error(`Error fetching upcoming holidays for ${countryConfig.countryCode}:`, error);
        results.push({ country: countryConfig.countryCode, holidays: [] });
      }
    }
    return results;
  }

  private formatTomorrowHolidaysMessage(countryHolidays: Array<{ country: string; holidays: Holiday[] }>): string {
    let message = '🎉 Tomorrow\'s Public Holidays:\n';
    let hasHolidays = false;

    countryHolidays.forEach(({ country, holidays }) => {
      if (holidays.length === 0) return;
      hasHolidays = true;
      const flag = countryFlags[country] || '🏳️';
      const countryName = defaultConfig.countries.find(c => c.countryCode === country)?.countryName || country;
      message += `${flag} ${countryName}: `;
      const holidayNames = holidays.map(holiday => holiday.name).join(', ');
      message += `${holidayNames}\n`;
    });

    return hasHolidays ? message.trim() : 'No public holidays tomorrow across all configured countries.';
  }

  private formatUpcomingHolidaysMessage(countryHolidays: Array<{ country: string; holidays: Holiday[] }>): string {
    let message = '📅 Upcoming Public Holidays (Next 30 Days):\n';
    let hasHolidays = false;

    countryHolidays.forEach(({ country, holidays }) => {
      const flag = countryFlags[country] || '🏳️';
      const countryName = defaultConfig.countries.find(c => c.countryCode === country)?.countryName || country;
      message += `\n${flag} ${countryName}: `;
      if (holidays.length === 0) {
        message += 'No holidays\n';
      } else {
        hasHolidays = true;
        const holidayStrings = holidays.map(holiday => {
          const date = new Date(holiday.date).toLocaleDateString();
          return `${holiday.name} (${date})`;
        });
        message += `${holidayStrings.join(', ')}\n`;
      }
    });

    return hasHolidays ? message.trim() : 'No upcoming public holidays found in the next 30 days.';
  }

  private formatTomorrowHolidaysBlocks(countryHolidays: Array<{ country: string; holidays: Holiday[] }>): KnownBlock[] {
    const blocks: KnownBlock[] = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🎉 Tomorrow's Public Holidays",
          emoji: true
        }
      },
      {
        type: "divider"
      }
    ];

    countryHolidays.forEach(({ country, holidays }) => {
      const flag = countryFlags[country] || '🏳️';
      const countryName = defaultConfig.countries.find(c => c.countryCode === country)?.countryName || country;

      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${flag} *${countryName}*`
        }
      });

      if (holidays.length === 0) {
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: "• No holidays tomorrow"
          }
        });
      } else {
        holidays.forEach(holiday => {
          blocks.push({
            type: "section",
            text: {
              type: "mrkdwn",
              text: `• *${holiday.name}*`
            }
          });
        });
      }

      blocks.push({
        type: "divider"
      });
    });

    return blocks;
  }

  private formatUpcomingHolidaysBlocks(countryHolidays: Array<{ country: string; holidays: Holiday[] }>): KnownBlock[] {
    const blocks: KnownBlock[] = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📅 Upcoming Public Holidays (Next 30 Days)",
          emoji: true
        }
      },
      {
        type: "divider"
      }
    ];

    countryHolidays.forEach(({ country, holidays }) => {
      const flag = countryFlags[country] || '🏳️';
      const countryName = defaultConfig.countries.find(c => c.countryCode === country)?.countryName || country;

      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${flag} *${countryName}*`
        }
      });

      if (holidays.length === 0) {
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: "• No holidays in the next 30 days"
          }
        });
      } else {
        holidays.forEach(holiday => {
          const date = new Date(holiday.date).toLocaleDateString();
          blocks.push({
            type: "section",
            text: {
              type: "mrkdwn",
              text: `• *${holiday.name}* (${date})`
            }
          });
        });
      }

      blocks.push({
        type: "divider"
      });
    });

    console.log(JSON.stringify(blocks, null, 2), "upcoming blocks");
    return blocks;
  }

  async sendMessage(message: SlackMessage): Promise<void> {
    try {
      console.log(`Sending message to channel ${message.channel}:`, message.text, 'Blocks:', JSON.stringify(message.blocks || [], null, 2));
      await this.app.client.chat.postMessage({
        token: this.botToken,
        channel: message.channel,
        text: message.text,
        blocks: message.blocks || []
      });
    } catch (error) {
      console.error('Error sending Slack message:', error);
      throw error;
    }
  }

  async sendHolidayReminder(countryCode: string, holiday: Holiday, channel: string): Promise<void> {
    const countryConfig = defaultConfig.countries.find(c => c.countryCode === countryCode);
    if (!countryConfig) {
      console.error(`No country config found for ${countryCode}`);
      return;
    }

    const flag = countryFlags[countryCode] || '🏳️';
    const funFacts = defaultConfig.funFacts[countryCode] || [];
    const randomFunFact = funFacts[Math.floor(Math.random() * funFacts.length)] || 'This country has many interesting traditions!';

    const messageText = defaultConfig.messageTemplate
      .replace('{countryFlag}', flag)
      .replace('{countryName}', countryConfig.countryName)
      .replace('{holidayName}', holiday.name)
      .replace('{funFact}', randomFunFact);

    const blocks: KnownBlock[] = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `🎉 Holiday Reminder: ${holiday.name}`,
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${flag} *${countryConfig.countryName}*\nTomorrow is *${holiday.name}*!`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `💡 *Fun Fact*: ${randomFunFact}`
        }
      },
      {
        type: "divider"
      }
    ];

    try {
      await this.sendMessage({
        channel,
        text: messageText,
        blocks
      });
    } catch (error) {
      console.error(`Failed to send holiday reminder for ${countryCode} to ${channel}:`, error);
    }
  }

  async start(): Promise<void> {
    try {
      await this.app.start(process.env.PORT || 3000);
      console.log('⚡️ Slack bot is running!');
    } catch (error) {
      console.error('Error starting Slack bot:', error);
    }
  }

  getApp(): App {
    return this.app;
  }
}