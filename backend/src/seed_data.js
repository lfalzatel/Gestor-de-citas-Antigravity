const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Poblando base de datos con datos de ejemplo...');

    // Limpiar datos existentes (excepto el admin)
    await prisma.appointment.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.client.deleteMany({});
    // No eliminamos usuarios para mantener el admin

    console.log('✅ Datos anteriores limpiados');

    // ==================== CLIENTES ====================
    console.log('👥 Creando clientes...');

    const clientes = await Promise.all([
        prisma.client.create({
            data: {
                nombre: 'María',
                apellido: 'González',
                email: 'maria.gonzalez@email.com',
                telefono: '3001234567',
                notas: 'Prefiere citas en la mañana'
            }
        }),
        prisma.client.create({
            data: {
                nombre: 'Laura',
                apellido: 'Martínez',
                email: 'laura.martinez@email.com',
                telefono: '3009876543',
                notas: 'Cliente frecuente, le gusta el diseño en uñas'
            }
        }),
        prisma.client.create({
            data: {
                nombre: 'Carolina',
                apellido: 'Rodríguez',
                email: 'carolina.rodriguez@email.com',
                telefono: '3012345678',
                notas: null
            }
        }),
        prisma.client.create({
            data: {
                nombre: 'Andrea',
                apellido: 'López',
                email: 'andrea.lopez@email.com',
                telefono: '3023456789',
                notas: 'Alérgica a ciertos esmaltes, usar hipoalergénicos'
            }
        }),
        prisma.client.create({
            data: {
                nombre: 'Valentina',
                apellido: 'Hernández',
                email: 'valentina.hernandez@email.com',
                telefono: '3034567890',
                notas: 'Prefiere tonos nude y naturales'
            }
        }),
        prisma.client.create({
            data: {
                nombre: 'Camila',
                apellido: 'García',
                email: 'camila.garcia@email.com',
                telefono: '3045678901',
                notas: null
            }
        }),
        prisma.client.create({
            data: {
                nombre: 'Isabella',
                apellido: 'Ramírez',
                email: 'isabella.ramirez@email.com',
                telefono: '3056789012',
                notas: 'Cliente VIP, siempre puntual'
            }
        }),
        prisma.client.create({
            data: {
                nombre: 'Sofía',
                apellido: 'Torres',
                email: 'sofia.torres@email.com',
                telefono: '3067890123',
                notas: null
            }
        })
    ]);

    console.log(`✅ ${clientes.length} clientes creados`);

    // ==================== SERVICIOS ====================
    console.log('💅 Creando servicios...');

    const servicios = await Promise.all([
        // Manicura
        prisma.service.create({
            data: {
                nombre: 'Manicura Clásica',
                descripcion: 'Limado, cutícula, hidratación y esmaltado',
                categoria: 'Manicura',
                duracion: 45,
                precio: 25000,
                activo: true
            }
        }),
        prisma.service.create({
            data: {
                nombre: 'Manicura Spa',
                descripcion: 'Manicura completa con exfoliación y masaje',
                categoria: 'Manicura',
                duracion: 60,
                precio: 35000,
                activo: true
            }
        }),
        // Pedicura
        prisma.service.create({
            data: {
                nombre: 'Pedicura Clásica',
                descripcion: 'Limado, cutícula, hidratación y esmaltado de pies',
                categoria: 'Pedicura',
                duracion: 60,
                precio: 30000,
                activo: true
            }
        }),
        prisma.service.create({
            data: {
                nombre: 'Pedicura Spa',
                descripcion: 'Pedicura completa con exfoliación, masaje y parafina',
                categoria: 'Pedicura',
                duracion: 75,
                precio: 45000,
                activo: true
            }
        }),
        // Uñas Acrílicas
        prisma.service.create({
            data: {
                nombre: 'Uñas Acrílicas Completas',
                descripcion: 'Aplicación completa de uñas acrílicas',
                categoria: 'Uñas Acrílicas',
                duracion: 120,
                precio: 80000,
                activo: true
            }
        }),
        prisma.service.create({
            data: {
                nombre: 'Relleno Acrílico',
                descripcion: 'Mantenimiento de uñas acrílicas',
                categoria: 'Uñas Acrílicas',
                duracion: 90,
                precio: 50000,
                activo: true
            }
        }),
        // Uñas de Gel
        prisma.service.create({
            data: {
                nombre: 'Uñas de Gel Completas',
                descripcion: 'Aplicación completa de uñas de gel',
                categoria: 'Uñas de Gel',
                duracion: 90,
                precio: 70000,
                activo: true
            }
        }),
        prisma.service.create({
            data: {
                nombre: 'Esmaltado Semipermanente',
                descripcion: 'Esmaltado en gel de larga duración',
                categoria: 'Uñas de Gel',
                duracion: 45,
                precio: 35000,
                activo: true
            }
        }),
        // Arte en Uñas
        prisma.service.create({
            data: {
                nombre: 'Diseño en Uñas Básico',
                descripcion: 'Diseño simple con detalles',
                categoria: 'Arte en Uñas',
                duracion: 30,
                precio: 15000,
                activo: true
            }
        }),
        prisma.service.create({
            data: {
                nombre: 'Diseño en Uñas Premium',
                descripcion: 'Diseño elaborado con técnicas avanzadas',
                categoria: 'Arte en Uñas',
                duracion: 60,
                precio: 40000,
                activo: true
            }
        }),
        // Spa de Manos
        prisma.service.create({
            data: {
                nombre: 'Spa de Manos Completo',
                descripcion: 'Tratamiento completo con exfoliación, mascarilla y parafina',
                categoria: 'Spa de Manos',
                duracion: 45,
                precio: 40000,
                activo: true
            }
        }),
        // Spa de Pies
        prisma.service.create({
            data: {
                nombre: 'Spa de Pies Completo',
                descripcion: 'Tratamiento completo con exfoliación, mascarilla y parafina',
                categoria: 'Spa de Pies',
                duracion: 60,
                precio: 45000,
                activo: true
            }
        }),
        // Tratamientos
        prisma.service.create({
            data: {
                nombre: 'Tratamiento Fortalecedor',
                descripcion: 'Tratamiento para uñas débiles y quebradizas',
                categoria: 'Tratamientos',
                duracion: 30,
                precio: 25000,
                activo: true
            }
        }),
        prisma.service.create({
            data: {
                nombre: 'Retiro de Acrílico/Gel',
                descripcion: 'Retiro seguro de uñas artificiales',
                categoria: 'Tratamientos',
                duracion: 45,
                precio: 20000,
                activo: true
            }
        })
    ]);

    console.log(`✅ ${servicios.length} servicios creados`);

    // ==================== EMPLEADOS ====================
    console.log('👩‍💼 Creando empleados...');

    // Crear usuarios para empleados
    const hashedPassword = await bcrypt.hash('empleado123', 10);

    const empleado1User = await prisma.user.create({
        data: {
            email: 'sofia.nail.artist@greenforce.com',
            password: hashedPassword,
            name: 'Sofía Morales',
            role: 'EMPLOYEE'
        }
    });

    const empleado2User = await prisma.user.create({
        data: {
            email: 'daniela.spa.expert@greenforce.com',
            password: hashedPassword,
            name: 'Daniela Ruiz',
            role: 'EMPLOYEE'
        }
    });

    const empleado3User = await prisma.user.create({
        data: {
            email: 'valentina.designer@greenforce.com',
            password: hashedPassword,
            name: 'Valentina Castro',
            role: 'EMPLOYEE'
        }
    });

    const empleado4User = await prisma.user.create({
        data: {
            email: 'camila.specialist@greenforce.com',
            password: hashedPassword,
            name: 'Camila Vargas',
            role: 'EMPLOYEE'
        }
    });

    // Crear perfiles de empleados
    const empleados = await Promise.all([
        prisma.employee.create({
            data: {
                userId: empleado1User.id,
                nombre: 'Sofía',
                apellido: 'Morales',
                email: 'sofia.nail.artist@greenforce.com',
                telefono: '3101234567',
                direccion: 'Calle 45 #23-10, Rionegro',
                fechaNacimiento: new Date('1995-03-15'),
                fechaContratacion: new Date('2022-01-15'),
                especialidad: 'Manicura',
                activo: true
            }
        }),
        prisma.employee.create({
            data: {
                userId: empleado2User.id,
                nombre: 'Daniela',
                apellido: 'Ruiz',
                email: 'daniela.spa.expert@greenforce.com',
                telefono: '3109876543',
                direccion: 'Carrera 50 #30-25, Rionegro',
                fechaNacimiento: new Date('1992-07-22'),
                fechaContratacion: new Date('2021-06-01'),
                especialidad: 'Spa de Manos',
                activo: true
            }
        }),
        prisma.employee.create({
            data: {
                userId: empleado3User.id,
                nombre: 'Valentina',
                apellido: 'Castro',
                email: 'valentina.designer@greenforce.com',
                telefono: '3112345678',
                direccion: 'Avenida 40 #15-30, Rionegro',
                fechaNacimiento: new Date('1998-11-08'),
                fechaContratacion: new Date('2023-02-10'),
                especialidad: 'Arte en Uñas',
                activo: true
            }
        }),
        prisma.employee.create({
            data: {
                userId: empleado4User.id,
                nombre: 'Camila',
                apellido: 'Vargas',
                email: 'camila.specialist@greenforce.com',
                telefono: '3123456789',
                direccion: 'Calle 52 #18-45, Rionegro',
                fechaNacimiento: new Date('1990-05-30'),
                fechaContratacion: new Date('2020-09-15'),
                especialidad: 'Uñas Acrílicas',
                activo: true
            }
        })
    ]);

    console.log(`✅ ${empleados.length} empleados creados`);

    console.log('\n🎉 ¡Base de datos poblada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - ${clientes.length} clientes`);
    console.log(`   - ${servicios.length} servicios`);
    console.log(`   - ${empleados.length} empleados`);
    console.log('\n🔐 Credenciales de empleados:');
    console.log('   Email: [empleado]@greenforce.com');
    console.log('   Password: empleado123');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
