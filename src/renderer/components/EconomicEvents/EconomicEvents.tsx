import React from 'react';
import { useEconomicEvents } from '../../hooks/useMarketData';
import './EconomicEvents.css';

export default function EconomicEvents() {
  const { eventData, loading } = useEconomicEvents();

  if (loading) {
    return <div className="economic-events loading">Loading events...</div>;
  }

  if (!eventData || eventData.events.length === 0) {
    return <div className="economic-events">No economic events this week</div>;
  }

  return (
    <div className="economic-events">
      <h2>Economic Events This Week</h2>
      <div className="events-list">
        {eventData.events.map((event, index) => (
          <div key={index} className={`event-card impact-${event.impact}`}>
            <div className="event-date">{new Date(event.date).toLocaleDateString()}</div>
            <div className="event-name">{event.event}</div>
            <div className="event-country">{event.country}</div>
            {event.previous && <div className="event-detail">Previous: {event.previous}</div>}
            {event.estimate && <div className="event-detail">Estimate: {event.estimate}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
