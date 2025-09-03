import { BotConfig } from '../types';

export const defaultConfig: BotConfig = {
  countries: [
    {
      countryCode: 'US',
      countryName: 'United States',
      channels: ['#general'],
      enabled: true,
      timezone: 'America/New_York'
    },
    {
      countryCode: 'GB',
      countryName: 'United Kingdom',
      channels: ['#general'],
      enabled: true,
      timezone: 'Europe/London'
    },
    {
      countryCode: 'JP',
      countryName: 'Japan',
      channels: ['#general'],
      enabled: true,
      timezone: 'Asia/Tokyo'
    },
    {
      countryCode: 'DE',
      countryName: 'Germany',
      channels: ['#general'],
      enabled: true,
      timezone: 'Europe/Berlin'
    },
    {
      countryCode: 'AU',
      countryName: 'Australia',
      channels: ['#general'],
      enabled: true,
      timezone: 'Australia/Sydney'
    },
    {
      countryCode: 'CA',
      countryName: 'Canada',
      channels: ['#general'],
      enabled: true,
      timezone: 'America/Toronto'
    },
    {
      countryCode: 'IN',
      countryName: 'India',
      channels: ['#general'],
      enabled: true,
      timezone: 'Asia/Kolkata'
    },
    {
      countryCode: 'BR',
      countryName: 'Brazil',
      channels: ['#general'],
      enabled: true,
      timezone: 'America/Sao_Paulo'
    }
  ],
  reminderTime: '09:00',
  defaultChannel: '#general',
  messageTemplate: "🎉 Heads up! {countryFlag} {countryName} has a public holiday tomorrow: **{holidayName}**\n\n💡 Fun Fact: {funFact}",
  funFacts: {
    'US': [
      'The United States has no official language, but English is the most widely spoken.',
      'The US has the world\'s largest economy by nominal GDP.',
      'The Statue of Liberty was a gift from France in 1886.'
    ],
    'GB': [
      'The UK has the world\'s oldest underground railway system, opened in 1863.',
      'The Queen owns all the swans in the River Thames.',
      'The UK has the world\'s largest library collection at the British Library.'
    ],
    'JP': [
      'Japan has the world\'s highest life expectancy.',
      'The bullet train (Shinkansen) can reach speeds of 320 km/h.',
      'Japan has more than 3,000 McDonald\'s restaurants.'
    ],
    'DE': [
      'Germany has the largest economy in Europe.',
      'The first printed book was in German (Gutenberg Bible).',
      'Germany has over 1,500 different types of beer.'
    ],
    'AU': [
      'Australia is the only continent without an active volcano.',
      'The Great Barrier Reef is the world\'s largest living structure.',
      'Australia has the world\'s largest cattle station (ranch).'
    ],
    'CA': [
      'Canada has the world\'s longest coastline.',
      'Canada has more lakes than any other country.',
      'The Canadian flag was officially adopted in 1965.'
    ],
    'IN': [
      'India has the world\'s largest democracy.',
      'India invented the number zero and the decimal system.',
      'India has the world\'s largest film industry (Bollywood).'
    ],
    'BR': [
      'Brazil is the world\'s largest coffee producer.',
      'Brazil has the world\'s largest rainforest (Amazon).',
      'Brazil has won the FIFA World Cup 5 times.'
    ]
  }
};

export const countryFlags: Record<string, string> = {
  'US': '🇺🇸',
  'GB': '🇬🇧',
  'JP': '🇯🇵',
  'DE': '🇩🇪',
  'AU': '🇦🇺',
  'CA': '🇨🇦',
  'IN': '🇮🇳',
  'BR': '🇧🇷'
}; 