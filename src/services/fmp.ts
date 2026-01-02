import https from 'https';
import { EconomicEvent } from '../renderer/types/events';

const FMP_API_KEY = process.env.FMP_API_KEY || '';
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

function makeRequest(endpoint: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${FMP_API_KEY}`;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error || parsed['Error Message']) {
            reject(new Error(parsed.error || parsed['Error Message']));
          } else {
            resolve(parsed);
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

export async function getEconomicEvents(): Promise<EconomicEvent[]> {
  try {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const data: any = await makeRequest(
      `/economic_calendar?from=${formatDate(now)}&to=${formatDate(endOfMonth)}`
    );

    if (Array.isArray(data)) {
      return data.map((event: any) => ({
        date: event.date,
        country: event.country || 'US',
        event: event.event,
        impact: event.impact?.toLowerCase() || 'medium',
        actual: event.actual,
        estimate: event.estimate,
        previous: event.previous
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching economic events from FMP:', error);
    return [];
  }
}
