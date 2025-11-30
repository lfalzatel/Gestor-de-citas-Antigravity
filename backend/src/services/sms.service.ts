import twilio from 'twilio';

// Initialize Twilio client only if credentials are available and valid
let client: twilio.Twilio | null = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
    try {
        client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    } catch (error) {
        console.log('Twilio initialization failed:', error instanceof Error ? error.message : 'Unknown error');
    }
}

// SMS templates
const smsTemplates = {
    newAppointment: (clientName: string, date: string, time: string, service: string) => ({
        message: `¡Hola ${clientName}! ✅ Tu cita ha sido confirmada para ${date} a las ${time}. Servicio: ${service}. GreenForce Beauty 💚`
    }),

    statusChange: (clientName: string, newStatus: string, date: string, time: string, service: string) => ({
        message: `¡Hola ${clientName}! 📢 El estado de tu cita cambió a: ${newStatus}. ${date} ${time}. Servicio: ${service}. GreenForce Beauty 💚`
    }),

    reminder: (clientName: string, date: string, time: string, service: string) => ({
        message: `¡Hola ${clientName}! ⏰ Recordatorio: Tienes una cita mañana ${date} a las ${time}. Servicio: ${service}. GreenForce Beauty 💚`
    })
};

// Send SMS function
export const sendSMS = async (to: string, template: { message: string }) => {
    try {
        // Check if Twilio client is available
        if (!client) {
            console.log('SMS not sent: Twilio credentials not configured');
            return { success: false, error: 'Twilio not configured' };
        }

        // Ensure phone number has country code
        const phoneNumber = to.startsWith('+') ? to : `+57${to}`;

        const message = await client.messages.create({
            body: template.message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        console.log('SMS sent:', message.sid);
        return { success: true, messageId: message.sid };
    } catch (error) {
        console.error('Error sending SMS:', error);
        return { success: false, error };
    }
};

// Export templates
export { smsTemplates };