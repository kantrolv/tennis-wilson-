const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Admin = require('./models/Admin');
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        try {
            const usersToMigrate = await User.find({ role: { $in: ['admin', 'superadmin'] } });
            console.log(`Found ${usersToMigrate.length} admins/superadmins in User collection. migrating...`);

            for (const user of usersToMigrate) {
                // preserve the same _id so existing tokens don't break
                const exists = await Admin.findById(user._id);
                if (!exists) {
                    await Admin.create({
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        password: user.password,
                        role: user.role,
                        region: user.region,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    });
                    console.log(`Migrated ${user.email}`);
                } else {
                    console.log(`Already found in Admin: ${user.email}`);
                }

                // Remove from User collection
                await User.findByIdAndDelete(user._id);
            }

            console.log('Migration complete.');
        } catch (e) {
            console.error(e);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
