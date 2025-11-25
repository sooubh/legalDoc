import { POVTimelineEvent } from '../types/legal';

export const generateICS = (events: POVTimelineEvent[]): string => {
    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//LegalEase AI//Smart Timeline//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ].join('\r\n');

    events.forEach(event => {
        // Parse date string (YYYY-MM-DD)
        const dateParts = event.date.split('-');
        if (dateParts.length !== 3) return;

        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];

        // Create start and end date strings (all day event)
        // DTSTART;VALUE=DATE:20251010
        const dateStr = `${year}${month}${day}`;

        // Create unique ID
        const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@legalease.ai`;

        const eventBlock = [
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
            `DTSTART;VALUE=DATE:${dateStr}`,
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${event.subtitle}\\n\\n${event.description}`,
            'STATUS:CONFIRMED',
            'TRANSP:TRANSPARENT',
            'END:VEVENT'
        ].join('\r\n');

        icsContent += '\r\n' + eventBlock;
    });

    icsContent += '\r\nEND:VCALENDAR';

    return icsContent;
};

export const downloadICS = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
