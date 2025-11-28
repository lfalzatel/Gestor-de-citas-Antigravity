
const BASE_URL = 'http://127.0.0.1:3000/api';
let TOKEN = '';
let SERVICE_ID = '';

async function runVerification() {
    console.log('Starting Single Tenant Verification...');

    // 1. Register
    console.log('\n1. Testing Registration...');
    const uniqueSuffix = Date.now();
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: `test${uniqueSuffix}@example.com`,
            password: 'password123',
            name: 'Test User'
        })
    });
    const registerData = await registerRes.json();
    console.log('Register Status:', registerRes.status);
    if (registerRes.status !== 201) {
        console.error('Register Failed:', registerData);
        return;
    }
    console.log('User Registered');

    // 2. Login
    console.log('\n2. Testing Login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: `test${uniqueSuffix}@example.com`,
            password: 'password123'
        })
    });
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    if (loginRes.status !== 200) {
        console.error('Login Failed:', loginData);
        return;
    }
    TOKEN = loginData.token;
    console.log('Token received');

    // 3. Create Service (Simulating Admin/Employee)
    console.log('\n3. Testing Create Service...');
    const serviceRes = await fetch(`${BASE_URL}/services`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
            name: 'Relaxing Massage',
            description: '60 min full body massage',
            duration: 60,
            price: 80
        })
    });
    const serviceData = await serviceRes.json();
    console.log('Create Service Status:', serviceRes.status);
    if (serviceRes.status !== 201) {
        console.error('Create Service Failed:', serviceData);
        return;
    }
    SERVICE_ID = serviceData.id;
    console.log('Service Created:', SERVICE_ID);

    // 4. List Services
    console.log('\n4. Testing List Services...');
    const listRes = await fetch(`${BASE_URL}/services`);
    const listData = await listRes.json();
    console.log('List Services Status:', listRes.status);
    console.log('Services Found:', listData.length);

    // 5. Book Appointment
    console.log('\n5. Testing Book Appointment...');
    const appointmentRes = await fetch(`${BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
            serviceId: SERVICE_ID,
            date: new Date(Date.now() + 86400000).toISOString() // Tomorrow
        })
    });
    const appointmentData = await appointmentRes.json();
    console.log('Book Appointment Status:', appointmentRes.status);
    if (appointmentRes.status !== 201) {
        console.error('Book Appointment Failed:', appointmentData);
        return;
    }
    console.log('Appointment Booked:', appointmentData.id);

    // 6. List My Appointments
    console.log('\n6. Testing List My Appointments...');
    const myApptsRes = await fetch(`${BASE_URL}/appointments/my-appointments`, {
        headers: {
            'Authorization': `Bearer ${TOKEN}`
        }
    });
    const myApptsData = await myApptsRes.json();
    console.log('List My Appointments Status:', myApptsRes.status);
    console.log('Appointments Found:', myApptsData.length);

    console.log('\nVerification Complete!');
}

runVerification().catch(console.error);
