import express from 'express';
import { BotConfig, CountryConfig, CountryHolidaySummaryItem } from '../types';
import { defaultConfig } from '../config/default-config';
import fs from 'fs/promises';
import path from 'path';
import { HolidayService } from '../services/holiday-service';

export class AdminPanel {
  private app: express.Application;
  private configPath: string;
  private currentConfig: BotConfig;
  private holidayService: HolidayService;

  constructor() {
    this.app = express();
    this.configPath = path.join(process.cwd(), 'config', 'bot-config.json');
    this.currentConfig = { ...defaultConfig } as BotConfig;
    this.holidayService = new HolidayService();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.loadConfig();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  private setupRoutes(): void {
    // Get current configuration
    this.app.get('/api/config', (req, res) => {
      res.json(this.currentConfig);
    });

    // Update configuration
    this.app.post('/api/config', async (req, res) => {
      try {
        const newConfig: BotConfig = req.body;
        this.currentConfig = { ...newConfig };
        await this.saveConfig();
        res.json({ success: true, message: 'Configuration updated successfully' });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating configuration' });
      }
    });

    // Get countries list
    this.app.get('/api/countries', (req, res) => {
      res.json(this.currentConfig.countries);
    });

    // Update country configuration
    this.app.put('/api/countries/:countryCode', async (req, res) => {
      try {
        const { countryCode } = req.params;
        const updatedCountry: CountryConfig = req.body;
        
        const index = this.currentConfig.countries.findIndex(c => c.countryCode === countryCode);
        if (index !== -1) {
          this.currentConfig.countries[index] = updatedCountry;
          await this.saveConfig();
          res.json({ success: true, message: 'Country updated successfully' });
        } else {
          res.status(404).json({ success: false, message: 'Country not found' });
        }
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating country' });
      }
    });

    // Add new country
    this.app.post('/api/countries', async (req, res) => {
      try {
        const newCountry: CountryConfig = req.body;
        
        // Check if country already exists
        if (this.currentConfig.countries.find(c => c.countryCode === newCountry.countryCode)) {
          res.status(400).json({ success: false, message: 'Country already exists' });
          return;
        }
        
        this.currentConfig.countries.push(newCountry);
        await this.saveConfig();
        res.json({ success: true, message: 'Country added successfully' });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding country' });
      }
    });

    // Delete country
    this.app.delete('/api/countries/:countryCode', async (req, res) => {
      try {
        const { countryCode } = req.params;
        
        const index = this.currentConfig.countries.findIndex(c => c.countryCode === countryCode);
        if (index !== -1) {
          this.currentConfig.countries.splice(index, 1);
          await this.saveConfig();
          res.json({ success: true, message: 'Country deleted successfully' });
        } else {
          res.status(404).json({ success: false, message: 'Country not found' });
        }
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting country' });
      }
    });

    // Test holiday API - returns formatted object for one country
    this.app.get('/api/test-holiday/:countryCode', async (req, res) => {
      try {
        const { countryCode } = req.params;
        const country = this.currentConfig.countries.find(c => c.countryCode === countryCode.toUpperCase());
        if (!country) {
          res.status(404).json({ success: false, message: 'Country not configured' });
          return;
        }
        const days = parseInt((req.query.days as string) || '14');
        const holidays = await this.holidayService.getUpcomingHolidays(country.countryCode, days);
        const result: CountryHolidaySummaryItem = {
          countryCode: country.countryCode,
          countryName: country.countryName,
          holidays,
          count: holidays.length
        };
        res.json({ success: true, data: result });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error testing holiday API' });
      }
    });

    // New: Summary endpoint across all configured countries
    this.app.get('/api/summary', async (req, res) => {
      try {
        const days = parseInt((req.query.days as string) || '14');
        const summary: CountryHolidaySummaryItem[] = [];
        for (const country of this.currentConfig.countries) {
          const holidays = await this.holidayService.getUpcomingHolidays(country.countryCode, days);
          summary.push({
            countryCode: country.countryCode,
            countryName: country.countryName,
            holidays,
            count: holidays.length
          });
        }
        res.json({ success: true, data: summary });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to build summary' });
      }
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
  }

  private async loadConfig(): Promise<void> {
    try {
      const configData = await fs.readFile(this.configPath, 'utf-8');
      this.currentConfig = { ...defaultConfig, ...JSON.parse(configData) };
    } catch (error) {
      console.log('No existing config found, using default configuration');
      await this.saveConfig();
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      const configDir = path.dirname(this.configPath);
      await fs.mkdir(configDir, { recursive: true });
      await fs.writeFile(this.configPath, JSON.stringify(this.currentConfig, null, 2));
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  }

  getConfig(): BotConfig {
    return this.currentConfig;
  }

  getApp(): express.Application {
    return this.app;
  }

  start(port: number): void {
    this.app.listen(port, () => {
      console.log(`🔧 Admin panel running on http://localhost:${port}`);
    });
  }
} 