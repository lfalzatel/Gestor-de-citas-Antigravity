const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testNotifications() {
    console.log('🔔 Probando notificaciones (Email + SMS + Calendario)...\n');

    try {
        // 1. Login
        console.log('1. Iniciando sesión...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@greenforce.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('✅ Login exitoso');

        // 2. Get existing client and service
        console.log('\n2. Obteniendo cliente y servicio...');
        const clientsRes = await axios.get(`${BASE_URL}/clients`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const servicesRes = await axios.get(`${BASE_URL}/services`);

        if (clientsRes.data.length === 0 || servicesRes.data.length === 0) {
            console.log('❌ No hay clientes o servicios disponibles para la prueba');
            return;
        }

        const clientId = clientsRes.data[0].id;
        const serviceId = servicesRes.data[0].id;
        console.log('✅ Cliente y servicio encontrados');

        // 3. Create appointment (this should trigger all notifications)
        console.log('\n3. Creando cita (debería enviar email, SMS y calendario)...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const appointmentDate = tomorrow.toISOString();

        const appointmentRes = await axios.post(`${BASE_URL}/appointments`, {
            clienteId: clientId,
            servicioId: serviceId,
            fecha: appointmentDate,
            horaInicio: '14:00'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Cita creada exitosamente');
        console.log('📧 Revisa tu email - debería incluir archivo .ics para calendario');
        console.log('📱 Si tienes Twilio configurado, deberías recibir SMS');
        console.log('📅 El archivo .ics se puede importar a Google Calendar, Outlook, etc.');

    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }
}

testNotifications();