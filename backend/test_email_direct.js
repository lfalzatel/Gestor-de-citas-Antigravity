require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmailDirect() {
    console.log('🔍 Probando envío directo de email con Resend...\n');

    try {
        const { data, error } = await resend.emails.send({
            from: 'GreenForce Beauty <onboarding@resend.dev>',
            to: ['lfalzatel29@gmail.com'], // Send to owner's email for testing
            subject: 'Test Email from Resend',
            html: '<p>This is a test email to verify Resend is working.</p>'
        });

        if (error) {
            console.error('❌ Error sending email:', error);
            return;
        }

        console.log('✅ Email sent successfully!');
        console.log('Email ID:', data.id);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testEmailDirect();