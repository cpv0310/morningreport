export interface EconomicEvent {
  date: string;
  country: string;
  event: string;
  impact: 'low' | 'medium' | 'high';
  actual?: string;
  estimate?: string;
  previous?: string;
}

export interface EconomicCalendar {
  events: EconomicEvent[];
  lastUpdated: Date;
}
