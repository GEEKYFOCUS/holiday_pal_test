# 🎉 Slack Holiday Reminder Bot

A powerful Slack bot that helps global remote teams stay aware of public holidays across different countries. Built with Node.js, Express, and TypeScript.

## ✨ Features

- **🌍 Multi-Country Support**: Track holidays from 8+ countries with easy configuration
- **🔔 Scheduled Reminders**: Daily and weekly holiday notifications at configurable times
- **💬 Customizable Messages**: Fun facts and country-specific information included
- **🛠️ Admin Panel**: Beautiful web interface for managing bot configuration
- **📱 Slack Integration**: Slash commands, mentions, and direct messages
- **⚡ Real-time Updates**: Instant holiday information via Calendarific API
- **🎨 Modern UI**: Responsive admin panel with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Slack workspace with admin permissions
- Calendarific API key

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd slack-holiday-bot
npm install
```

### 2. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
# Slack Configuration
SLACK_BOT_TOKEN=xapp-1-A095AH65EUF-9306659901760-e74e277354f361e6a7a3997df1ac8afe88575b3d297e19b2a29c4f5c2a66cfa2
SLACK_SIGNING_SECRET=db0842a67475ade063196f8e87ffc940

# Calendarific API Configuration
CALENDARIFIC_API_KEY=7lkQgBMkbfj3LBxLT6ybHj0z42KH7jFi
CALENDARIFIC_API_URL=https://calendarific.com/api/v2

# Bot Configuration
BOT_NAME=Holiday Reminder Bot
DEFAULT_TIMEZONE=UTC
REMINDER_HOUR=9
REMINDER_MINUTE=0

# Server Configuration
PORT=3000
ADMIN_PORT=3001
NODE_ENV=development
```

### 3. Build and Run

```bash
# Build TypeScript
npm run build

# Start the bot
npm start

# Or run in development mode
npm run dev
```

The bot will start on port 3000, and the admin panel will be available at `http://localhost:3001`.

## 🔧 Slack App Setup

### 1. Create Slack App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "Holiday Reminder Bot")
4. Select your workspace

### 2. Configure Bot Token Scopes

Under "OAuth & Permissions", add these scopes:

**Bot Token Scopes:**
- `chat:write` - Send messages to channels
- `channels:read` - Read channel information
- `commands` - Add slash commands
- `app_mentions:read` - Respond to mentions

### 3. Install App to Workspace

1. Go to "Install App" in the sidebar
2. Click "Install to Workspace"
3. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### 4. Configure Event Subscriptions

1. Go to "Event Subscriptions"
2. Enable events and add your bot's URL: `https://your-domain.com/slack/events`
3. Subscribe to these bot events:
   - `app_mention`
   - `message.im`

### 5. Add Slash Commands

1. Go to "Slash Commands"
2. Create command:
   - Command: `/holidays`
   - Request URL: `https://your-domain.com/slack/events`
   - Description: "Get holiday information"

## 📱 Usage

### Slash Commands

- `/holidays` - Show upcoming holidays for all countries
- `/holidays tomorrow` - Show tomorrow's holidays
- `/holidays help` - Show help information

### Direct Messages

- Mention the bot in any channel
- Send direct messages for help

### Admin Panel

Access the admin panel at `http://localhost:3001` to:

- Configure countries and channels
- Set reminder times
- Test holiday API integration
- Manage bot settings

## 🏗️ Architecture

```
src/
├── index.ts              # Main application entry point
├── types/                # TypeScript type definitions
├── config/               # Configuration files
├── services/             # Core business logic
│   ├── holiday-service.ts    # Calendarific API integration
│   ├── slack-service.ts      # Slack bot functionality
│   └── reminder-service.ts   # Scheduled reminders
└── admin/                # Admin panel
    ├── admin-panel.ts        # Express admin server
    └── public/               # Web interface
```

## 🔌 API Endpoints

### Admin Panel API

- `GET /api/config` - Get current configuration
- `POST /api/config` - Update configuration
- `GET /api/countries` - List all countries
- `POST /api/countries` - Add new country
- `PUT /api/countries/:code` - Update country
- `DELETE /api/countries/:code` - Delete country
- `GET /api/test-holiday/:code` - Test holiday API
- `GET /health` - Health check

## 🌍 Supported Countries

The bot comes pre-configured with these countries:

- 🇺🇸 United States (US)
- 🇬🇧 United Kingdom (GB)
- 🇯🇵 Japan (JP)
- 🇩🇪 Germany (DE)
- 🇦🇺 Australia (AU)
- 🇨🇦 Canada (CA)
- 🇮🇳 India (IN)
- 🇧🇷 Brazil (BR)

## 🚀 Deployment

### Heroku

1. Create a new Heroku app
2. Set environment variables
3. Deploy:

```bash
heroku create your-holiday-bot
heroku config:set SLACK_BOT_TOKEN=your-token
heroku config:set SLACK_SIGNING_SECRET=your-secret
heroku config:set CALENDARIFIC_API_KEY=your-key
git push heroku main
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SLACK_BOT_TOKEN` | Bot user OAuth token | Yes |
| `SLACK_SIGNING_SECRET` | Slack app signing secret | Yes |
| `CALENDARIFIC_API_KEY` | Calendarific API key | Yes |
| `PORT` | Bot server port | No (default: 3000) |
| `ADMIN_PORT` | Admin panel port | No (default: 3001) |
| `NODE_ENV` | Environment mode | No (default: development) |

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📝 Configuration

### Bot Configuration

The bot configuration is stored in `config/bot-config.json` and includes:

- Country settings (codes, names, channels, timezones)
- Reminder schedules
- Message templates
- Fun facts for each country

### Message Templates

Customize holiday messages using these placeholders:

- `{countryFlag}` - Country flag emoji
- `{countryName}` - Full country name
- `{holidayName}` - Holiday name
- `{funFact}` - Random fun fact about the country

## 🔒 Security

- Environment variables for sensitive data
- Input validation and sanitization
- CORS protection
- Helmet.js security headers
- Rate limiting (configurable)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Check the [Issues](https://github.com/your-repo/issues) page
- Review the [Wiki](https://github.com/your-repo/wiki)
- Contact: your-email@example.com

## 🔮 Roadmap

- [ ] Slack modal configuration interface
- [ ] More holiday APIs (fallback support)
- [ ] Advanced scheduling options
- [ ] Holiday calendar export
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Webhook support for external integrations

---

**Built with ❤️ for global remote teams** 