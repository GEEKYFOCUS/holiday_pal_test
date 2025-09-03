export interface Holiday {
  name: string;
  date: string;
  description?: string;
  type: string;
  country: string;
  countryCode: string;
}

export interface CountryConfig {
  countryCode: string;
  countryName: string;
  channels: string[];
  enabled: boolean;
  timezone: string;
}

export interface BotConfig {
  countries: CountryConfig[];
  reminderTime: string;
  defaultChannel: string;
  messageTemplate: string;
  funFacts: Record<string, string[]>;
}

export interface CalendarificResponse {
  response: {
    holidays: Array<{
      name: string;
      date: {
        iso: string;
      };
      description: string;
      type: string[];
      country: {
        id: string;
        name: string;
      };
    }>;
  };
}

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
}

export interface ReminderSchedule {
  countryCode: string;
  channel: string;
  time: string;
  enabled: boolean;
}

export interface CountryHolidaySummaryItem {
  countryFlag: string;
  countryCode: string;
  countryName: string;
  holidays: Holiday[];
  count: number;
  
} 