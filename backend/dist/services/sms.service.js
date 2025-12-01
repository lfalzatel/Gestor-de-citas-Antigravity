"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsTemplates = exports.sendSMS = void 0;
const twilio_1 = __importDefault(require("twilio"));
// Initialize Twilio client only if credentials are available and valid
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
    try {
        client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
    catch (error) {
        console.log('Twilio initialization failed:', error instanceof Error ? error.message : 'Unknown error');
    }
}
// SMS templates
const smsTemplates = {
    newAppointment: (clientName, date, time, service) => ({
        message: `¡Hola ${clientName}! ✅ Tu cita ha sido confirmada para ${date} a las ${time}. Servicio: ${service}. GreenForce Beauty 💚`
    }),
    statusChange: (clientName, newStatus, date, time, service) => ({
        message: `¡Hola ${clientName}! 📢 El estado de tu cita cambió a: ${newStatus}. ${date} ${time}. Servicio: ${service}. GreenForce Beauty 💚`
    }),
    reminder: (clientName, date, time, service) => ({
        message: `¡Hola ${clientName}! ⏰ Recordatorio: Tienes una cita mañana ${date} a las ${time}. Servicio: ${service}. GreenForce Beauty 💚`
    })
};
exports.smsTemplates = smsTemplates;
// Send SMS function
const sendSMS = (to, template) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if Twilio client is available
        if (!client) {
            console.log('SMS not sent: Twilio credentials not configured');
            return { success: false, error: 'Twilio not configured' };
        }
        // Ensure phone number has country code
        const phoneNumber = to.startsWith('+') ? to : `+57${to}`;
        const message = yield client.messages.create({
            body: template.message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });
        console.log('SMS sent:', message.sid);
        return { success: true, messageId: message.sid };
    }
    catch (error) {
        console.error('Error sending SMS:', error);
        return { success: false, error };
    }
});
exports.sendSMS = sendSMS;
