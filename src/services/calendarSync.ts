import { EventItem, TicketPurchase } from '../types';

/**
 * Calendar Sync Utility for Abohoman Arts Trust Events
 * Prevents scheduling conflicts by offering direct 1-click sync to Google Calendar,
 * Outlook, Apple iCal, and native standard .ics calendar file downloads.
 */

export interface CalendarEventPayload {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  url?: string;
}

// Convert event data to Date range
export function parseEventDates(event: EventItem): { start: Date; end: Date } {
  const baseDate = new Date(event.isoDate + "T10:00:00+05:30"); // IST default
  const end = new Date(baseDate.getTime() + 4 * 60 * 60 * 1000); // 4 hour duration
  return { start: baseDate, end };
}

// Format date to iCal / Google UTC string (YYYYMMDDTHHmmssZ)
export function formatDateToICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Generate Google Calendar 1-Click Direct Sync URL
export function generateGoogleCalendarUrl(event: EventItem, ticket?: TicketPurchase): string {
  const { start, end } = parseEventDates(event);
  const startStr = formatDateToICS(start);
  const endStr = formatDateToICS(end);

  const title = encodeURIComponent(`${event.title} [Abohoman Arts Trust]`);
  let detailsText = `${event.description}\n\nVenue: ${event.venue}, ${event.city}\nCategory: ${event.category}`;
  if (ticket) {
    detailsText += `\n\nYour Ticket Code: ${ticket.ticketCode}\nPass Count: ${ticket.ticketCount} Attendee(s)\nStatus: Confirmed Pass`;
  }
  detailsText += `\n\nOfficial Trust Archive: https://abohoman-arts.org`;
  const details = encodeURIComponent(detailsText);
  const location = encodeURIComponent(`${event.venue}, ${event.city}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}&sf=true&output=xml`;
}

// Generate Outlook Web Calendar Sync URL
export function generateOutlookCalendarUrl(event: EventItem, ticket?: TicketPurchase): string {
  const { start, end } = parseEventDates(event);
  const subject = encodeURIComponent(`${event.title} [Abohoman Arts Trust]`);
  const body = encodeURIComponent(`${event.description}\nVenue: ${event.venue}\nTicket: ${ticket ? ticket.ticketCode : 'Registered'}`);
  const location = encodeURIComponent(`${event.venue}, ${event.city}`);
  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${subject}&body=${body}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&location=${location}`;
}

// Generate standard RFC 5545 iCalendar (.ics) file and trigger instant download
export function downloadICSFile(event: EventItem, ticket?: TicketPurchase) {
  const { start, end } = parseEventDates(event);
  const now = formatDateToICS(new Date());
  const startStr = formatDateToICS(start);
  const endStr = formatDateToICS(end);
  const uid = `abohoman-evt-${event.id}-${Date.now()}@abohoman-arts.org`;

  let desc = `${event.description.replace(/\n/g, '\\n')} - Curated by Abohoman Public Trust for Artists.`;
  if (ticket) {
    desc += `\\nYour Pass: ${ticket.ticketCode} (${ticket.ticketCount} person(s))`;
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Abohoman Arts Trust//Bengali Contemporary Arts Archive//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${event.title.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${event.venue.replace(/,/g, '\\,')}\\, ${event.city}`,
    'STATUS:CONFIRMED',
    'CATEGORIES:ART,EXHIBITION,BENGAL MODERNISM',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Upcoming Abohoman Arts Trust Event Tomorrow',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `abohoman-${event.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
