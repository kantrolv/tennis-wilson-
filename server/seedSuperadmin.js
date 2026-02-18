/**
 * Seed Superadmin Script
 * 
 * Run: node seedSuperadmin.js
 * 
 * Creates a superadmin user if one doesn't already exist.
 * Credentials can be customized via environment variables or defaults below.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const SUPERADMIN = {
    name: process.env.SUPERADMIN_NAME || 'Super Admin',
    email: process.env.SUPERADMIN_EMAIL || 'superadmin@wilson.com',
    password: process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@123',
    role: 'superadmin',
    region: null, // Superadmin has no region restriction
};

const seedSuperadmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected...');

        const existing = await User.findOne({ email: SUPERADMIN.email });

        if (existing) {
            console.log(`\n⚠️  Superadmin already exists:`);
            console.log(`   Email: ${existing.email}`);
            console.log(`   Role:  ${existing.role}`);
            console.log(`   ID:    ${existing._id}`);
            console.log('\n   No changes made.\n');
        } else {
            const admin = await User.create(SUPERADMIN);
            console.log(`\n✅ Superadmin created successfully:`);
            console.log(`   Name:     ${admin.name}`);
            console.log(`   Email:    ${admin.email}`);
            console.log(`   Role:     ${admin.role}`);
            console.log(`   Password: ${SUPERADMIN.password}`);
            console.log(`   ID:       ${admin._id}`);
            console.log('\n   ⚠️  Change the password immediately in production!\n');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding superadmin:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
};

seedSuperadmin();
