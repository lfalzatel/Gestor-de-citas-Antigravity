const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testDropdowns() {
    console.log('📋 Probando rutas de dropdowns mejoradas...\n');

    try {
        // 1. Login
        console.log('1. Iniciando sesión...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@greenforce.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('✅ Login exitoso');

        // 2. Test clients dropdown
        console.log('\n2. Probando dropdown de clientes...');
        const clientsRes = await axios.get(`${BASE_URL}/clients/dropdown`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Clientes obtenidos:', clientsRes.data.length);
        if (clientsRes.data.length > 0) {
            console.log('📝 Ejemplo cliente:', clientsRes.data[0]);
        }

        // 3. Test employees dropdown
        console.log('\n3. Probando dropdown de empleados...');
        const employeesRes = await axios.get(`${BASE_URL}/employees/dropdown`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Empleados obtenidos:', employeesRes.data.length);
        if (employeesRes.data.length > 0) {
            console.log('👨‍💼 Ejemplo empleado:', employeesRes.data[0]);
        }

        // 4. Test services dropdown
        console.log('\n4. Probando dropdown de servicios...');
        const servicesRes = await axios.get(`${BASE_URL}/services/dropdown`);
        console.log('✅ Servicios obtenidos:', servicesRes.data.length);
        if (servicesRes.data.length > 0) {
            console.log('💅 Ejemplo servicio:', servicesRes.data[0]);
        }

        console.log('\n🎉 ¡Todas las rutas de dropdown funcionan correctamente!');
        console.log('💡 Ahora la app móvil puede mostrar información detallada en los selectores');

    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }
}

testDropdowns();