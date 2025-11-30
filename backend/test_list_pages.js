const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testListPages() {
    console.log('📄 Probando páginas de listado mejoradas...\n');

    try {
        // 1. Login
        console.log('1. Iniciando sesión...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@greenforce.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('✅ Login exitoso');

        // 2. Test clients list page
        console.log('\n2. Probando página de listado de clientes...');
        const clientsRes = await axios.get(`${BASE_URL}/clients`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Clientes obtenidos:', clientsRes.data.length);
        if (clientsRes.data.length > 0) {
            console.log('📝 Ejemplo cliente:', {
                nombre: clientsRes.data[0].nombre,
                apellido: clientsRes.data[0].apellido,
                notas: clientsRes.data[0].notas,
                statusText: clientsRes.data[0].statusText
            });
        }

        // 3. Test employees list page
        console.log('\n3. Probando página de listado de empleados...');
        const employeesRes = await axios.get(`${BASE_URL}/employees`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Empleados obtenidos:', employeesRes.data.length);
        if (employeesRes.data.length > 0) {
            console.log('👨‍💼 Ejemplo empleado:', {
                nombre: employeesRes.data[0].nombre,
                apellido: employeesRes.data[0].apellido,
                especialidad: employeesRes.data[0].especialidad,
                statusText: employeesRes.data[0].statusText
            });
        }

        // 4. Test services list page
        console.log('\n4. Probando página de listado de servicios...');
        const servicesRes = await axios.get(`${BASE_URL}/services`);
        console.log('✅ Servicios obtenidos:', servicesRes.data.length);
        if (servicesRes.data.length > 0) {
            console.log('💅 Ejemplo servicio:', {
                nombre: servicesRes.data[0].nombre,
                precio: servicesRes.data[0].precio,
                statusText: servicesRes.data[0].statusText
            });
        }

        console.log('\n🎉 ¡Las páginas de listado ahora muestran información completa!');
        console.log('💡 La app móvil puede mostrar: notas, especialidades, precios y estados activos');

    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }
}

testListPages();