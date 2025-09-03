// import cron from 'node-cron';
// import { HolidayService } from './holiday-service';
// import { SlackService } from './slack-service';
// import { countryFlags, defaultConfig } from '../config/default-config';
// import { Holiday, CountryHolidaySummaryItem } from '../types';

// export class ReminderService {
//   private holidayService: HolidayService;
//   private slackService: SlackService;
//   private cronJobs: cron.ScheduledTask[] = [];

//   constructor(holidayService: HolidayService, slackService: SlackService) {
//     this.holidayService = holidayService;
//     this.slackService = slackService;
//   }

//   startScheduledReminders(): void {
//     // Schedule daily reminder at 09:00 AM UTC
//     const dailyReminder = cron.schedule('0 9 * * *', async () => {
//       console.log('⏰ Starting daily holiday reminder cron job at', new Date().toISOString());
//       await this.sendDailyHolidayReminders();
//     }, {
//       scheduled: true,
//       timezone: 'UTC'
//     });

//     this.cronJobs.push(dailyReminder);

//     // Schedule weekly summary every Monday at 9 AM UTC
//     const weeklyReminder = cron.schedule('0 9 * * 1', async () => {
//       console.log('⏰ Starting weekly holiday summary cron job at', new Date().toISOString());
//       await this.sendWeeklyHolidaySummary();
//     }, {
//       scheduled: true,
//       timezone: 'UTC'
//     });

//     this.cronJobs.push(weeklyReminder);

//     console.log('✅ Scheduled reminders started');
//   }

//   private async sendDailyHolidayReminders(): Promise<void> {
//     console.log('🔔 Sending daily holiday reminders...');
//     let hasHolidays = false;

//     for (const countryConfig of defaultConfig.countries) {
//       if (!countryConfig.enabled) {
//         console.log(`Skipping disabled country: ${countryConfig.countryCode}`);
//         continue;
//       }

//       try {
//         const tomorrowHolidays = await this.holidayService.getHolidaysForTomorrow(countryConfig.countryCode);
//         console.log(`Holidays for ${countryConfig.countryCode} tomorrow:`, tomorrowHolidays);

//         if (tomorrowHolidays.length > 0) {
//           hasHolidays = true;
//           for (const holiday of tomorrowHolidays) {
//             for (const channel of countryConfig.channels) {
//               console.log(`Sending reminder for ${holiday.name} in ${countryConfig.countryCode} to channel ${channel}`);
//               await this.slackService.sendHolidayReminder(
//                 countryConfig.countryCode,
//                 holiday,
//                 channel
//               );
//             }
//           }
//         } else {
//           console.log(`No holidays found for ${countryConfig.countryCode}`);
//         }
//       } catch (error) {
//         console.error(`Error fetching/sending reminders for ${countryConfig.countryCode}:`, error);
//       }
//     }

//     if (!hasHolidays) {
//       console.log('No holidays found for any country tomorrow');
//       const defaultChannel = defaultConfig.defaultChannel;
//       await this.slackService.sendMessage({
//         channel: defaultChannel,
//         text: 'No public holidays tomorrow across all configured countries.',
//         blocks: [
//           {
//             type: "header",
//             text: {
//               type: "plain_text",
//               text: "📅 No Public Holidays Tomorrow",
//               emoji: true
//             }
//           },
//           {
//             type: "section",
//             text: {
//               type: "mrkdwn",
//               text: "No public holidays scheduled for tomorrow across all configured countries."
//             }
//           }
//         ]
//       });
//     }
//   }

//   private async sendWeeklyHolidaySummary(): Promise<void> {
//     console.log('📅 Sending weekly holiday summary...');
    
//     const summaryList: CountryHolidaySummaryItem[] = [];
    
//     for (const countryConfig of defaultConfig.countries) {
//       if (!countryConfig.enabled) continue;
//       try {
//         const upcomingHolidays = await this.holidayService.getUpcomingHolidays(countryConfig.countryCode, 14);
//         summaryList.push({
//           countryFlag: countryFlags[countryConfig.countryCode] || '🏳️',
//           countryCode: countryConfig.countryCode,
//           countryName: countryConfig.countryName,
//           holidays: upcomingHolidays,
//           count: upcomingHolidays.length
//         });
//       } catch (error) {
//         console.error(`Error fetching weekly summary for ${countryConfig.countryCode}:`, error);
//         summaryList.push({
//           countryFlag: countryFlags[countryConfig.countryCode] || '🏳️',
//           countryCode: countryConfig.countryCode,
//           countryName: countryConfig.countryName,
//           holidays: [],
//           count: 0
//         });
//       }
//     }

//     const summaryMessage = this.formatWeeklySummary(summaryList);
//     await this.slackService.sendMessage({
//       channel: defaultConfig.defaultChannel,
//       text: summaryMessage
//     });
//   }

//   private formatWeeklySummary(summaryList: CountryHolidaySummaryItem[]): string {
//     let message = '📅 *Upcoming Public Holidays (Next 2 Weeks):*\n\n';
//     summaryList.forEach(item => {
//       message += `*${item.countryName}* ${item.countryFlag}:\n`;
//       if (item.holidays.length === 0) {
//         message += '  • None\n\n';
//         return;
//       }
//       item.holidays.forEach(holiday => {
//         const date = new Date(holiday.date).toLocaleDateString();
//         message += `  • ${holiday.name} (${date})\n`;
//       });
//       message += '\n';
//     });
//     return message;
//   }

//   // async sendManualReminder(countryCode: string, channel: string): Promise<void> {
//   //   try {
//   //     const tomorrowHolidays = await this.holidayService.getHolidaysForTomorrow(countryCode);
      
//   //     if (tomorrowHolidays.length === 0) {
//   //       await this.slackService.sendMessage({
//   //         channel,
//   //         text: `No public holidays tomorrow in ${countryCode}.`,
//   //         blocks: [
//   //           {
//   //             type: "header",
//   //             text: {
//   //               type: "plain_text",
//   //               text: `📅 No Holidays Tomorrow in ${countryCode}`,
//   //               emoji: true
//   //             }
//   //           },
//   //           {
//   //             type: "section",
//   //             text: {
//   //               type: "mrkdwn",
//   //               text: `No public holidays scheduled for tomorrow in ${countryCode}.`
//   //             }
//   //           }
//   //         ]
//   //       });
//   //       return;
//   //     }

//   //     for (const holiday of tomorrowHolidays) {
//   //       await this.slackService.sendHolidayReminder(countryCode, holiday, channel);
//   //     }
//   //   } catch (error) {
//   //     console.error(`Error sending manual reminder for ${countryCode}:`, error);
//   //   }
//   // }

//   stopScheduledReminders(): void {
//     this.cronJobs.forEach(job => job.stop());
//     this.cronJobs = [];
//     console.log('⏹️ Scheduled reminders stopped');
//   }

//   getCronJobs(): cron.ScheduledTask[] {
//     return this.cronJobs;
//   }
// }


import cron from 'node-cron';
import { HolidayService } from './holiday-service';
import { SlackService } from './slack-service';
import { countryFlags, defaultConfig } from '../config/default-config';
import { Holiday, CountryHolidaySummaryItem } from '../types';

export class ReminderService {
  private holidayService: HolidayService;
  private slackService: SlackService;
  private cronJobs: cron.ScheduledTask[] = [];

  constructor(holidayService: HolidayService, slackService: SlackService) {
    this.holidayService = holidayService;
    this.slackService = slackService;
  }

  startScheduledReminders(): void {
    // Schedule daily reminder at 09:00 AM UTC
    const dailyReminder = cron.schedule('0 9 * * *', async () => {
      console.log('⏰ Starting daily holiday reminder cron job at', new Date().toISOString());
      await this.sendDailyHolidayReminders();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.cronJobs.push(dailyReminder);

    // Schedule weekly summary every Monday at 9 AM UTC
    const weeklyReminder = cron.schedule('0 9 * * 1', async () => {
      console.log('⏰ Starting weekly holiday summary cron job at', new Date().toISOString());
      await this.sendWeeklyHolidaySummary();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    this.cronJobs.push(weeklyReminder);

    console.log('✅ Scheduled reminders started');
  }

  private async sendDailyHolidayReminders(): Promise<void> {
    console.log('🔔 Sending daily holiday reminders...');
    let hasHolidays = false;

    for (const countryConfig of defaultConfig.countries) {
      if (!countryConfig.enabled) {
        console.log(`Skipping disabled country: ${countryConfig.countryCode}`);
        continue;
      }

      try {
        const tomorrowHolidays = await this.holidayService.getHolidaysForTomorrow(countryConfig.countryCode);
        console.log(`Holidays for ${countryConfig.countryCode} tomorrow:`, tomorrowHolidays);

        if (tomorrowHolidays.length > 0) {
          hasHolidays = true;
          for (const holiday of tomorrowHolidays) {
            for (const channel of countryConfig.channels) {
              console.log(`Sending reminder for ${holiday.name} in ${countryConfig.countryCode} to channel ${channel}`);
              await this.slackService.sendHolidayReminder(
                countryConfig.countryCode,
                holiday,
                channel
              );
            }
          }
        } else {
          console.log(`No holidays found for ${countryConfig.countryCode}`);
        }
      } catch (error) {
        console.error(`Error fetching/sending reminders for ${countryConfig.countryCode}:`, error);
      }
    }

    if (!hasHolidays) {
      console.log('No holidays found for any country tomorrow');
      const defaultChannel = defaultConfig.defaultChannel;
      await this.slackService.sendMessage({
        channel: defaultChannel,
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
    }
  }

  private async sendWeeklyHolidaySummary(): Promise<void> {
    console.log('📅 Sending weekly holiday summary...');
    
    const summaryList: CountryHolidaySummaryItem[] = [];
    
    for (const countryConfig of defaultConfig.countries) {
      if (!countryConfig.enabled) continue;
      try {
        const upcomingHolidays = await this.holidayService.getUpcomingHolidays(countryConfig.countryCode, 14);
        summaryList.push({
          countryFlag: countryFlags[countryConfig.countryCode] || '🏳️',
          countryCode: countryConfig.countryCode,
          countryName: countryConfig.countryName,
          holidays: upcomingHolidays,
          count: upcomingHolidays.length
        });
      } catch (error) {
        console.error(`Error fetching weekly summary for ${countryConfig.countryCode}:`, error);
        summaryList.push({
          countryFlag: countryFlags[countryConfig.countryCode] || '🏳️',
          countryCode: countryConfig.countryCode,
          countryName: countryConfig.countryName,
          holidays: [],
          count: 0
        });
      }
    }

    const summaryMessage = this.formatWeeklySummary(summaryList);
    await this.slackService.sendMessage({
      channel: defaultConfig.defaultChannel,
      text: summaryMessage
    });
  }

  private formatWeeklySummary(summaryList: CountryHolidaySummaryItem[]): string {
    let message = '📅 *Upcoming Public Holidays (Next 2 Weeks):*\n\n';
    summaryList.forEach(item => {
      message += `*${item.countryName}* ${item.countryFlag}:\n`;
      if (item.holidays.length === 0) {
        message += '  • None\n\n';
        return;
      }
      item.holidays.forEach(holiday => {
        const date = new Date(holiday.date).toLocaleDateString();
        message += `  • ${holiday.name} (${date})\n`;
      });
      message += '\n';
    });
    return message;
  }

  async testDailyReminder(): Promise<void> {
    console.log('🔔 Testing daily holiday reminders...');
    await this.sendDailyHolidayReminders();
  }

  stopScheduledReminders(): void {
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs = [];
    console.log('⏹️ Scheduled reminders stopped');
  }

  getCronJobs(): cron.ScheduledTask[] {
    return this.cronJobs;
  }
}