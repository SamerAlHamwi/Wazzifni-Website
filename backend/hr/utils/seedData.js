const User = require('../models/User');

const seedAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });

    if (!adminExists) {
      console.log('Seeding admin user...');
      await User.create({
        name: 'Admin User',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        active: true,
        perms: {
          add: true,
          edit: true,
          del: true,
          pay: true,
          rep: true,
          adm: true,
        }
      });
      console.log('Admin user seeded successfully!');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

module.exports = seedAdminUser;
