import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
const emailTemplates = {
    newAppointment: (clientName: string, date: string, time: string, service: string) => ({
        subject: '✅ Cita Confirmada - GreenForce Beauty',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2e7d32;">¡Hola ${clientName}! 👋</h2>
                <p>Tu cita ha sido <strong>confirmada</strong> exitosamente.</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #2e7d32;">📅 Detalles de tu Cita</h3>
                    <p><strong>📆 Fecha:</strong> ${date}</p>
                    <p><strong>🕐 Hora:</strong> ${time}</p>
                    <p><strong>💅 Servicio:</strong> ${service}</p>
                </div>
                
                <p style="color: #666;">Si necesitas cancelar o reprogramar, por favor contáctanos con anticipación.</p>
                
                <p style="margin-top: 30px;">
                    ¡Te esperamos! 💚<br>
                    <strong>GreenForce Beauty</strong>
                </p>
            </div>
        `
    }),

    statusChange: (clientName: string, newStatus: string, date: string, time: string, service: string) => ({
        subject: `📢 Actualización de Cita - ${newStatus}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2e7d32;">¡Hola ${clientName}! 👋</h2>
                <p>El estado de tu cita ha cambiado a: <strong>${newStatus}</strong></p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #2e7d32;">📅 Detalles de la Cita</h3>
                    <p><strong>📆 Fecha:</strong> ${date}</p>
                    <p><strong>🕐 Hora:</strong> ${time}</p>
                    <p><strong>💅 Servicio:</strong> ${service}</p>
                </div>
                
                <p style="color: #666;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
                
                <p style="margin-top: 30px;">
                    Saludos cordiales 💚<br>
                    <strong>GreenForce Beauty</strong>
                </p>
            </div>
        `
    }),

    reminder: (clientName: string, date: string, time: string, service: string) => ({
        subject: '⏰ Recordatorio de Cita - Mañana',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2e7d32;">¡Hola ${clientName}! 👋</h2>
                <p>Te recordamos que tienes una cita <strong>mañana</strong>.</p>
                
                <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                    <h3 style="margin-top: 0; color: #856404;">⏰ Recordatorio</h3>
                    <p><strong>📆 Fecha:</strong> ${date}</p>
                    <p><strong>🕐 Hora:</strong> ${time}</p>
                    <p><strong>💅 Servicio:</strong> ${service}</p>
                </div>
                
                <p style="color: #666;">Por favor, llega 5 minutos antes de tu cita.</p>
                
                <p style="margin-top: 30px;">
                    ¡Te esperamos! 💚<br>
                    <strong>GreenForce Beauty</strong>
                </p>
            </div>
        `
    })
};

// Send email function using Resend
export const sendEmail = async (
    to: string,
    template: { subject: string; html: string },
    attachments?: Array<{ content: string; filename: string; contentType: string }>
) => {
    try {
        const emailData: any = {
            from: 'GreenForce Beauty <onboarding@resend.dev>',
            to: [to],
            subject: template.subject,
            html: template.html
        };

        if (attachments && attachments.length > 0) {
            emailData.attachments = attachments.map(att => ({
                filename: att.filename,
                content: Buffer.from(att.content).toString('base64'),
                content_type: att.contentType
            }));
        }

        const { data, error } = await resend.emails.send(emailData);

        if (error) {
            console.error('Error sending email:', error);
            return { success: false, error };
        }

        console.log('Email sent:', data?.id);
        return { success: true, messageId: data?.id };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};

// Export templates
export { emailTemplates };
