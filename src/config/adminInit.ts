import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// const prisma = new PrismaClient();

export async function initializeAdmin() {
  try {
    // Check if any admin exists
    const adminExists = await prisma.user.findFirst({
      where: {
        role: 'ADMIN' // Adjust based on your schema
      }
    });

    if (adminExists) {
      console.log('✅ Admin account already exists');
      return;
    }

    // Create default admin account
    const defaultAdminEmail = process.env.ADMIN_EMAIL || 'admin@guidely.com';
    const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    
    const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        email: defaultAdminEmail,
        passwordHash: hashedPassword,
        name: 'System Admin',
        role: 'ADMIN', // Adjust based on your schema
        // Add any other required fields from your schema
      }
    });

    console.log('✅ Default admin account created successfully');
    console.log(`📧 Email: ${defaultAdminEmail}`);
    console.log(`🔑 Password: ${defaultAdminPassword}`);
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error initializing admin account:', error);
    throw error;
  }
}