const BASE_URL = 'http://localhost:3000/api';

async function testResend() {
    console.log('🔍 Probando envío de email con Resend...\n');

    try {
        // 1. Login
        console.log('1. Iniciando sesión...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@greenforce.com',
                password: 'admin123'
            })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.error);
        const token = loginData.token;
        console.log('✅ Login exitoso');

        // 2. Get or create a client
        console.log('\n2. Obteniendo clientes...');
        const clientsRes = await fetch(`${BASE_URL}/clients`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const clientsData = await clientsRes.json();
        if (!clientsRes.ok) throw new Error(clientsData.error);

        let clientId;
        if (clientsData.length > 0) {
            clientId = clientsData[0].id;
            console.log('✅ Cliente encontrado:', clientId);
        } else {
            // Create a client
            console.log('Creando cliente...');
            const clientRes = await fetch(`${BASE_URL}/clients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre: 'Test',
                    apellido: 'Client',
                    email: 'test@example.com',
                    telefono: '1234567890'
                })
            });
            const clientData = await clientRes.json();
            if (!clientRes.ok) throw new Error(clientData.error);
            clientId = clientData.id;
            console.log('✅ Cliente creado:', clientId);
        }

        // 3. Get or create a service
        console.log('\n3. Obteniendo servicios...');
        const servicesRes = await fetch(`${BASE_URL}/services`);
        const servicesData = await servicesRes.json();
        if (!servicesRes.ok) throw new Error(servicesData.error);

        let serviceId;
        if (servicesData.length > 0) {
            serviceId = servicesData[0].id;
            console.log('✅ Servicio encontrado:', serviceId);
        } else {
            // Create a service
            console.log('Creando servicio...');
            const serviceRes = await fetch(`${BASE_URL}/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre: 'Test Service',
                    descripcion: 'Test description',
                    duracion: 60,
                    precio: 50
                })
            });
            const serviceData = await serviceRes.json();
            if (!serviceRes.ok) throw new Error(serviceData.error);
            serviceId = serviceData.id;
            console.log('✅ Servicio creado:', serviceId);
        }

        // 4. Create appointment (this should send email)
        console.log('\n4. Creando cita (esto debería enviar email)...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const appointmentDate = tomorrow.toISOString();

        const appointmentRes = await fetch(`${BASE_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                clienteId: clientId,
                servicioId: serviceId,
                fecha: appointmentDate,
                horaInicio: '10:00'
            })
        });
        const appointmentData = await appointmentRes.json();
        if (!appointmentRes.ok) throw new Error(appointmentData.error);

        console.log('✅ Cita creada:', appointmentData.id);
        console.log('📧 Si el email se envió correctamente, deberías ver un log en la consola del backend');

    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testResend();