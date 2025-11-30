const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testUpdateNotifications() {
    console.log('🔄 Probando notificaciones en actualizaciones...\n');

    try {
        // 1. Login
        console.log('1. Iniciando sesión...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@greenforce.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('✅ Login exitoso');

        // 2. Get existing appointment
        console.log('\n2. Obteniendo citas existentes...');
        const appointmentsRes = await axios.get(`${BASE_URL}/appointments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (appointmentsRes.data.length === 0) {
            console.log('❌ No hay citas para probar actualizaciones');
            return;
        }

        const appointmentId = appointmentsRes.data[0].id;
        console.log('✅ Cita encontrada:', appointmentId);

        // 3. Update appointment status (this should send status change notification)
        console.log('\n3. Actualizando estado de cita (debería enviar notificación)...');
        const updateRes = await axios.put(`${BASE_URL}/appointments/${appointmentId}`, {
            estado: 'CONFIRMADA'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Cita actualizada exitosamente');
        console.log('📧 Deberías recibir notificación de cambio de estado');
        console.log('📱 SMS de cambio de estado (si Twilio configurado)');

        // 4. Update appointment time (this should send update notification)
        console.log('\n4. Actualizando hora de cita (debería enviar notificación)...');
        const newTime = '16:00';
        const updateTimeRes = await axios.put(`${BASE_URL}/appointments/${appointmentId}`, {
            horaInicio: newTime
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Hora de cita actualizada exitosamente');
        console.log('📧 Deberías recibir notificación de actualización');
        console.log('📅 Archivo .ics actualizado adjunto');

    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }
}

testUpdateNotifications();