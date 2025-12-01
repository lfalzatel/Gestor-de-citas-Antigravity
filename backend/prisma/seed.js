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
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const servicesData = [
    // ========== MANICURA Y UÑAS ==========
    {
        name: 'Manicure Clásico',
        description: 'Limpieza, corte, limado, y esmalte regular.',
        duration: 45,
        price: 25000.00,
        categoria: 'Manicura'
    },
    {
        name: 'Manicura en Gel',
        description: 'Esmalte en gel de larga duración con diseño básico.',
        duration: 60,
        price: 55000.00,
        categoria: 'Uñas de Gel'
    },
    {
        name: 'Esmalte Semipermanente',
        description: 'Esmalte de larga duración (2–3 semanas).',
        duration: 90,
        price: 45000.00,
        categoria: 'Manicura'
    },
    {
        name: 'Acrílicas Completas',
        description: 'Aplicación de uñas acrílicas con esmalte.',
        duration: 95,
        price: 135000.00,
        categoria: 'Uñas Acrílicas'
    },
    {
        name: 'Refuerzo de Uñas en Gel',
        description: 'Relleno y mantenimiento de uñas en gel para mantener su look y durabilidad.',
        duration: 45,
        price: 40000.00,
        categoria: 'Uñas de Gel'
    },
    {
        name: 'Retiro de Esmalte (Semipermanente/Gel)',
        description: 'Remoción segura de esmalte semipermanente o gel sin dañar la uña natural.',
        duration: 30,
        price: 15000.00,
        categoria: 'Manicura'
    },
    {
        name: 'Diseño Francés',
        description: 'El clásico y elegante diseño de uñas francesas, con esmalte semipermanente.',
        duration: 60,
        price: 50000.00,
        categoria: 'Arte en Uñas'
    },
    {
        name: 'Decoración de Uñas (Nail Art)',
        description: 'Diseños personalizados con decoraciones (piedras, stickers, purpurina, etc.).',
        duration: 60,
        price: 35000.00,
        categoria: 'Arte en Uñas'
    },
    {
        name: 'Tratamiento de Cutículas',
        description: 'Hidratación y cuidado profundo de la cutícula para mejorar la salud de la uña.',
        duration: 20,
        price: 18000.00,
        categoria: 'Spa de Manos'
    },
    {
        name: 'Mascarilla de Manos',
        description: 'Tratamiento hidratante y nutritivo para suavizar y rejuvenecer las manos.',
        duration: 15,
        price: 20000.00,
        categoria: 'Spa de Manos'
    },
    // ========== PEDICURA Y PIES ==========
    {
        name: 'Pedicure Clásica',
        description: 'Limpieza, corte, limado y esmalte regular para pies.',
        duration: 50,
        price: 31000.00,
        categoria: 'Pedicura'
    },
    {
        name: 'Pedicure Spa',
        description: 'Pedicura con masaje y exfoliación.',
        duration: 75,
        price: 75000.00,
        categoria: 'Spa de Pies'
    },
    {
        name: 'Pedicure Terapéutica',
        description: 'Tratamiento enfocado en problemas comunes como callosidades, durezas y hongos.',
        duration: 90,
        price: 85000.00,
        categoria: 'Spa de Pies'
    },
    // ========== CEJAS Y PESTAÑAS ==========
    {
        name: 'Diseño de Cejas (Brow Shaping)',
        description: 'Perfilado profesional de cejas con pinza, hilo o cera según la forma del rostro.',
        duration: 30,
        price: 20000.00,
        categoria: 'Cejas y Pestañas'
    },
    {
        name: 'Ondulación de Pestañas (Lash Lifting)',
        description: 'Ondulación de pestañas naturales con tinte para mayor curvatura y definición, sin extensiones.',
        duration: 45,
        price: 94000.00,
        categoria: 'Cejas y Pestañas'
    },
    {
        name: 'Pestañas Tecnológicas (Tech Lashes)',
        description: 'Extensiones de pestañas con efecto 3D, volumen ruso o Black Velvet para un look impactante.',
        duration: 90,
        price: 150000.00,
        categoria: 'Cejas y Pestañas'
    },
    {
        name: 'Microblading',
        description: 'Micropigmentación semipermanente para diseñar y rellenar las cejas con un efecto hiperrealista de pelo a pelo.',
        duration: 120,
        price: 180000.00,
        categoria: 'Cejas y Pestañas'
    },
    {
        name: 'Tinte de Cejas y Pestañas',
        description: 'Aplicación de tinte profesional para dar color y definición a las cejas y/o pestañas.',
        duration: 25,
        price: 25000.00,
        categoria: 'Cejas y Pestañas'
    },
    // ========== FACIALES Y SPA ==========
    {
        name: 'Limpieza Facial Profunda',
        description: 'Extracción de impurezas, exfoliación, mascarilla personalizada y protección solar.',
        duration: 75,
        price: 70000.00,
        categoria: 'Faciales'
    },
    {
        name: 'Hidratación Facial',
        description: 'Tratamiento con activos hidratantes para piel seca o deshidratada.',
        duration: 60,
        price: 55000.00,
        categoria: 'Faciales'
    },
    {
        name: 'Mascarilla Facial Personalizada',
        description: 'Aplicación de una mascarilla específica según las necesidades de tu piel (anti-acné, iluminadora, anti-edad, etc.).',
        duration: 30,
        price: 35000.00,
        categoria: 'Faciales'
    },
    {
        name: 'Masaje Descontracturante',
        description: 'Masaje profundo enfocado en liberar nudos musculares y tensión acumulada.',
        duration: 60,
        price: 70000.00,
        categoria: 'Tratamientos'
    },
    // ========== PAQUETES ESPECIALES ==========
    {
        name: 'Paquete Novia Especial',
        description: 'Incluye: Manicura en Gel, Pedicure Spa y Diseño de Cejas. La preparación perfecta para tu día especial.',
        duration: 240,
        price: 180000.00,
        categoria: 'Paquetes'
    },
    {
        name: 'Paquete Día de Spa',
        description: 'Incluye: Pedicure Spa, Limpieza Facial Profunda y Mascarilla de Manos. Un día completo de relax.',
        duration: 180,
        price: 160000.00,
        categoria: 'Paquetes'
    }
];
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🌱 Starting seed...');
        // 1. Create Owner User (Optional if already exists, but good to ensure)
        const ownerEmail = 'admin@greenforce.com'; // Updated to user's preferred email
        const ownerPassword = yield bcryptjs_1.default.hash('admin123', 10);
        const owner = yield prisma.user.upsert({
            where: { email: ownerEmail },
            update: {},
            create: {
                email: ownerEmail,
                name: 'Admin Spa',
                password: ownerPassword,
                role: 'OWNER',
            },
        });
        console.log(`👤 Owner ensured: ${owner.email}`);
        // 2. Update existing services or create new ones
        console.log('🔄 Updating/Creating services...');
        for (const service of servicesData) {
            // Try to update existing service by name
            const result = yield prisma.service.updateMany({
                where: { nombre: service.name },
                data: {
                    descripcion: service.description,
                    categoria: service.categoria,
                    duracion: service.duration,
                    precio: service.price,
                    activo: true
                }
            });
            if (result.count === 0) {
                // If not found, create it
                yield prisma.service.create({
                    data: {
                        nombre: service.name,
                        descripcion: service.description,
                        categoria: service.categoria,
                        duracion: service.duration,
                        precio: service.price,
                        activo: true
                    },
                });
                console.log(`➕ Created: ${service.name}`);
            }
            else {
                console.log(`🔄 Updated: ${service.name}`);
            }
        }
        console.log(`✨ Processed ${servicesData.length} services`);
        // 3. Create Dummy Clients
        console.log('👥 Creating dummy clients...');
        const clientsData = [
            { nombre: 'Maria', apellido: 'Gonzalez', email: 'maria@test.com', telefono: '3001234567', notas: 'Cliente frecuente' },
            { nombre: 'Juan', apellido: 'Perez', email: 'juan@test.com', telefono: '3109876543', notas: 'Alergia al latex' },
            { nombre: 'Ana', apellido: 'Martinez', email: 'ana@test.com', telefono: '3205551234', notas: 'Prefiere citas en la mañana' },
            { nombre: 'Carlos', apellido: 'Rodriguez', email: 'carlos@test.com', telefono: '3012223344', notas: '' },
            { nombre: 'Laura', apellido: 'Lopez', email: 'laura@test.com', telefono: '3158889900', notas: 'VIP' }
        ];
        for (const client of clientsData) {
            yield prisma.client.upsert({
                where: { email: client.email },
                update: {},
                create: client
            });
        }
        console.log(`✅ Created ${clientsData.length} clients`);
        // 4. Create Dummy Employees
        console.log('👷 Creating dummy employees...');
        const employeesData = [
            { nombre: 'Sofia', apellido: 'Ramirez', email: 'sofia@greenforce.com', telefono: '3001112233', especialidad: 'Manicura', fechaContratacion: new Date('2024-01-15') },
            { nombre: 'Camila', apellido: 'Torres', email: 'camila@greenforce.com', telefono: '3104445566', especialidad: 'Pedicura', fechaContratacion: new Date('2024-02-01') },
            { nombre: 'Valentina', apellido: 'Herrera', email: 'valentina@greenforce.com', telefono: '3207778899', especialidad: 'Cejas y Pestañas', fechaContratacion: new Date('2024-03-10') }
        ];
        for (const emp of employeesData) {
            // Create User for employee first
            const empPassword = yield bcryptjs_1.default.hash('employee123', 10);
            const user = yield prisma.user.upsert({
                where: { email: emp.email },
                update: {},
                create: {
                    email: emp.email,
                    name: `${emp.nombre} ${emp.apellido}`,
                    password: empPassword,
                    role: 'ADMIN' // Or EMPLOYEE if role exists
                }
            });
            // Create Employee profile
            yield prisma.employee.upsert({
                where: { userId: user.id },
                update: {},
                create: {
                    userId: user.id,
                    nombre: emp.nombre,
                    apellido: emp.apellido,
                    email: emp.email,
                    telefono: emp.telefono,
                    especialidad: emp.especialidad,
                    fechaContratacion: emp.fechaContratacion,
                    activo: true
                }
            });
        }
        console.log(`✅ Created ${employeesData.length} employees`);
        // 5. Create Dummy Appointments
        console.log('📅 Creating dummy appointments...');
        const allClients = yield prisma.client.findMany();
        const allServices = yield prisma.service.findMany();
        const allEmployees = yield prisma.employee.findMany();
        if (allClients.length > 0 && allServices.length > 0 && allEmployees.length > 0) {
            const appointmentsData = [
                // Past appointments (COMPLETADA)
                {
                    clienteId: allClients[0].id,
                    servicioId: allServices[0].id, // Manicure Clasico
                    empleadoId: allEmployees[0].id, // Sofia
                    fecha: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 days ago
                    horaInicio: '10:00',
                    estado: 'COMPLETADA',
                    total: allServices[0].precio
                },
                {
                    clienteId: allClients[1].id,
                    servicioId: allServices[1].id, // Manicura Gel
                    empleadoId: allEmployees[0].id, // Sofia
                    fecha: new Date(new Date().setDate(new Date().getDate() - 1)), // 1 day ago
                    horaInicio: '14:00',
                    estado: 'COMPLETADA',
                    total: allServices[1].precio
                },
                // Future appointments (PROGRAMADA)
                {
                    clienteId: allClients[2].id,
                    servicioId: allServices[2].id, // Esmalte Semipermanente
                    empleadoId: allEmployees[1].id, // Camila
                    fecha: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
                    horaInicio: '09:00',
                    estado: 'PROGRAMADA',
                    total: allServices[2].precio
                },
                {
                    clienteId: allClients[3].id,
                    servicioId: allServices[3].id, // Acrilicas
                    empleadoId: allEmployees[2].id, // Valentina
                    fecha: new Date(new Date().setDate(new Date().getDate() + 2)), // In 2 days
                    horaInicio: '11:00',
                    estado: 'PROGRAMADA',
                    total: allServices[3].precio
                },
                // Cancelled/No Show
                {
                    clienteId: allClients[4].id,
                    servicioId: allServices[0].id,
                    empleadoId: allEmployees[1].id,
                    fecha: new Date(new Date().setDate(new Date().getDate() - 5)),
                    horaInicio: '16:00',
                    estado: 'CANCELADA',
                    total: allServices[0].precio
                }
            ];
            for (const apt of appointmentsData) {
                yield prisma.appointment.create({
                    data: apt
                });
            }
            console.log(`✅ Created ${appointmentsData.length} appointments`);
        }
        console.log('✅ Seed completed successfully!');
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
