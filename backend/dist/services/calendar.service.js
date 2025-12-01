"use strict";
// Calendar service for generating iCal (.ics) files
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAppointmentICal = exports.generateICalEvent = void 0;
const generateICalEvent = (title, description, startDate, endDate, location = 'GreenForce Beauty') => {
    // Format dates for iCal (YYYYMMDDTHHMMSSZ)
    const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    const startTime = formatDate(startDate);
    const endTime = formatDate(endDate);
    // Generate unique ID for the event
    const uid = `appointment-${Date.now()}@greenforce.com`;
    // Create iCal content
    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GreenForce Beauty//Appointment System//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDate(new Date())}
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Recordatorio de cita
END:VALARM
END:VEVENT
END:VCALENDAR`;
    return {
        content: icalContent,
        filename: 'appointment.ics',
        contentType: 'text/calendar; charset=UTF-8; method=REQUEST'
    };
};
exports.generateICalEvent = generateICalEvent;
// Generate appointment iCal
const generateAppointmentICal = (clientName, serviceName, appointmentDate, startTime, endTime) => {
    const title = `Cita - ${serviceName}`;
    const description = `Cita programada para ${clientName}\\nServicio: ${serviceName}\\nFecha: ${appointmentDate.toLocaleDateString('es-ES')}\\nHora: ${startTime} - ${endTime}`;
    // Parse start and end times
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startDate = new Date(appointmentDate);
    startDate.setHours(startHour, startMin, 0, 0);
    const endDate = new Date(appointmentDate);
    endDate.setHours(endHour, endMin, 0, 0);
    return (0, exports.generateICalEvent)(title, description, startDate, endDate);
};
exports.generateAppointmentICal = generateAppointmentICal;
