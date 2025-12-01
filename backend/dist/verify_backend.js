"use strict";
// import fetch from 'node-fetch'; // Using global fetch
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const BASE_URL = 'http://localhost:3000';
let TOKEN = '';
let USER_ID = '';
let BUSINESS_ID = '';
let SERVICE_ID = '';
function runVerification() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting Backend Verification...');
        // 1. Register
        console.log('\n1. Testing Registration...');
        const uniqueSuffix = Date.now();
        const registerRes = yield fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `test${uniqueSuffix}@example.com`,
                password: 'password123',
                name: 'Test User'
            })
        });
        const registerData = yield registerRes.json();
        console.log('Register Status:', registerRes.status);
        if (registerRes.status !== 201) {
            console.error('Register Failed:', registerData);
            return;
        }
        console.log('User Registered:', registerData);
        // 2. Login
        console.log('\n2. Testing Login...');
        const loginRes = yield fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `test${uniqueSuffix}@example.com`,
                password: 'password123'
            })
        });
        const loginData = yield loginRes.json();
        console.log('Login Status:', loginRes.status);
        if (loginRes.status !== 200) {
            console.error('Login Failed:', loginData);
            return;
        }
        TOKEN = loginData.token;
        console.log('Token received');
        // 3. Create Business
        console.log('\n3. Testing Create Business...');
        const businessRes = yield fetch(`${BASE_URL}/businesses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                name: `Business ${uniqueSuffix}`,
                description: 'A test business',
                address: '123 Test St'
            })
        });
        const businessData = yield businessRes.json();
        console.log('Create Business Status:', businessRes.status);
        if (businessRes.status !== 201) {
            console.error('Create Business Failed:', businessData);
            return;
        }
        BUSINESS_ID = businessData.id;
        console.log('Business Created:', BUSINESS_ID);
        // 4. Create Service
        console.log('\n4. Testing Create Service...');
        const serviceRes = yield fetch(`${BASE_URL}/businesses/${BUSINESS_ID}/services`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                name: 'Test Service',
                description: 'A test service',
                duration: 60,
                price: 50
            })
        });
        const serviceData = yield serviceRes.json();
        console.log('Create Service Status:', serviceRes.status);
        if (serviceRes.status !== 201) {
            console.error('Create Service Failed:', serviceData);
            return;
        }
        SERVICE_ID = serviceData.id;
        console.log('Service Created:', SERVICE_ID);
        // 5. List Businesses
        console.log('\n5. Testing List Businesses...');
        const listRes = yield fetch(`${BASE_URL}/businesses`);
        const listData = yield listRes.json();
        console.log('List Businesses Status:', listRes.status);
        console.log('Businesses Found:', listData.length);
        // 6. Book Appointment
        console.log('\n6. Testing Book Appointment...');
        const appointmentRes = yield fetch(`${BASE_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                businessId: BUSINESS_ID,
                serviceId: SERVICE_ID,
                date: new Date(Date.now() + 86400000).toISOString() // Tomorrow
            })
        });
        const appointmentData = yield appointmentRes.json();
        console.log('Book Appointment Status:', appointmentRes.status);
        if (appointmentRes.status !== 201) {
            console.error('Book Appointment Failed:', appointmentData);
            return;
        }
        console.log('Appointment Booked:', appointmentData.id);
        // 7. List My Appointments
        console.log('\n7. Testing List My Appointments...');
        const myApptsRes = yield fetch(`${BASE_URL}/appointments/my-appointments`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });
        const myApptsData = yield myApptsRes.json();
        console.log('List My Appointments Status:', myApptsRes.status);
        console.log('Appointments Found:', myApptsData.length);
        console.log('\nVerification Complete!');
    });
}
runVerification().catch(console.error);
