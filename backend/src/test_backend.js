const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testBackend() {
    console.log('🔍 Probando conexión al backend...\n');

    // Test 1: Health check
    try {
        console.log('1. Probando /api/health...');
        const health = await axios.get(`${BASE_URL.replace('/api', '')}/api/health`);
        console.log('✅ Health check OK:', health.data);
    } catch (error) {
        console.log('❌ Health check falló:', error.message);
    }

    // Test 2: Login con credenciales correctas
    try {
        console.log('\n2. Probando login con credenciales correctas...');
        const login = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@greenforce.com',
            password: 'admin123'
        });
        console.log('✅ Login exitoso!');
        console.log('Token:', login.data.token.substring(0, 20) + '...');
        console.log('Usuario:', login.data.user);
    } catch (error) {
        console.log('❌ Login falló:', error.response?.data || error.message);
    }

    // Test 3: Login con credenciales incorrectas
    try {
        console.log('\n3. Probando login con credenciales incorrectas...');
        await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@greenforce.com',
            password: 'wrongpassword'
        });
    } catch (error) {
        console.log('✅ Error esperado:', error.response?.data?.error);
    }

    console.log('\n✅ Pruebas completadas');
}

testBackend();
