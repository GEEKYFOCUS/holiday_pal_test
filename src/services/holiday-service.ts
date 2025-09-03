import axios from 'axios';
import { Holiday, CalendarificResponse } from '../types';

export class HolidayService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.CALENDARIFIC_API_KEY || '';
    this.apiUrl = process.env.CALENDARIFIC_API_URL || 'https://calendarific.com/api/v2';
  }

  async getHolidays(countryCode: string, year: number): Promise<Holiday[]> {

    console.log("")
    try {
      const response = await axios.get<CalendarificResponse>(`${this.apiUrl}/holidays`, {
        params: {
          api_key: this.apiKey,
          country: countryCode,
          year: year,
          type: 'national'
        }
      });   
      console.log(response.data.response.holidays, "result")

      if (!response.data.response?.holidays) {
        return [];
      }

      return response.data.response.holidays.map(holiday => ({
        name: holiday.name,
        date: holiday.date.iso,
        description: holiday.description,
        type: holiday.type.join(', '),
        country: holiday.country?.name,
        countryCode: holiday.country?.id
      }));
    } catch (error) {
      console.error(`Error fetching holidays for ${countryCode}:`, error);
      return [];
    }
  }

  async getUpcomingHolidays(countryCode: string, daysAhead: number = 7): Promise<Holiday[]> {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    const [currentYearHolidays] = await Promise.all([
      this.getHolidays(countryCode, currentYear),
      // this.getHolidays(countryCode, nextYear)
    ]);

    // const allHolidays = [...currentYearHolidays, ...nextYearHolidays];
    const allHolidays = [...currentYearHolidays];
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + daysAhead);

    return allHolidays
      .filter(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate >= today && holidayDate <= targetDate;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getHolidaysForTomorrow(countryCode: string): Promise<Holiday[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const currentYear = tomorrow.getFullYear();
    const holidays = await this.getHolidays(countryCode, currentYear);
    
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    return holidays.filter(holiday => 
      holiday.date.startsWith(tomorrowStr)
    );
  }

  async getHolidaysForDate(countryCode: string, date: Date): Promise<Holiday[]> {
    const year = date.getFullYear();
    const holidays = await this.getHolidays(countryCode, year);
    
    const dateStr = date.toISOString().split('T')[0];
    
    return holidays.filter(holiday => 
      holiday.date.startsWith(dateStr)
    );
  }
} 