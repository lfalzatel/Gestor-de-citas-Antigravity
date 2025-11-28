
const BASE_URL = 'http://127.0.0.1:3000/api';
let TOKEN = '';

async function runVerification() {
    console.log('Starting Admin Features Verification...');

    // 1. Login to get token
    console.log('\n1. Logging in...');
    // Assuming the user created in previous step exists, or create a new one
    const uniqueSuffix = Date.now();

    // Register a new admin/employee user for testing
    await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: `admin${uniqueSuffix}@example.com`,
            password: 'password123',
            name: 'Admin User'
        })
    });

    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: `admin${uniqueSuffix}@example.com`,
            password: 'password123'
        })
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200) {
        console.error('Login Failed:', loginData);
        return;
    }
    TOKEN = loginData.token;
    console.log('Token received');

    // 2. List Users (Clients)
    console.log('\n2. Testing List Users...');
    const usersRes = await fetch(`${BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const usersData = await usersRes.json();
    console.log('List Users Status:', usersRes.status);
    console.log('Users Found:', usersData.length);
    if (usersRes.status !== 200) {
        console.error('List Users Failed:', usersData);
    }

    // 3. List Employees
    console.log('\n3. Testing List Employees...');
    const employeesRes = await fetch(`${BASE_URL}/employees`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const employeesData = await employeesRes.json();
    console.log('List Employees Status:', employeesRes.status);
    console.log('Employees Found:', employeesData.length);
    if (employeesRes.status !== 200) {
        console.error('List Employees Failed:', employeesData);
    }

    console.log('\nVerification Complete!');
}

runVerification().catch(console.error);
