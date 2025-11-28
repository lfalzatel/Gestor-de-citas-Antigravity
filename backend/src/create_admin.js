const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        // Verificar si ya existe el usuario
        const existingUser = await prisma.user.findUnique({
            where: { email: 'admin@greenforce.com' }
        });

        if (existingUser) {
            console.log('✅ Usuario admin ya existe');
            console.log('Email: admin@greenforce.com');
            console.log('Password: admin123');
            return;
        }

        // Crear usuario admin
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const user = await prisma.user.create({
            data: {
                email: 'admin@greenforce.com',
                password: hashedPassword,
                name: 'Administrador',
                role: 'ADMIN'
            }
        });

        console.log('✅ Usuario admin creado exitosamente!');
        console.log('Email: admin@greenforce.com');
        console.log('Password: admin123');
        console.log('User ID:', user.id);

        // Crear algunos datos de ejemplo
        console.log('\n📦 Creando datos de ejemplo...');

        // Cliente de ejemplo
        const client = await prisma.client.create({
            data: {
                nombre: 'María',
                apellido: 'García',
                email: 'maria.garcia@example.com',
                telefono: '3001234567',
                notas: 'Cliente preferencial'
            }
        });
        console.log('✅ Cliente creado:', client.nombre, client.apellido);

        // Servicio de ejemplo
        const service = await prisma.service.create({
            data: {
                nombre: 'Manicura Clásica',
                descripcion: 'Manicura tradicional con esmaltado',
                categoria: 'Manicura',
                duracion: 60,
                precio: 25000,
                activo: true
            }
        });
        console.log('✅ Servicio creado:', service.nombre);

        console.log('\n🎉 ¡Todo listo! Puedes iniciar sesión ahora.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();
