const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/CourseUser');
const Course = require('../models/Course');

// Load env vars from absolute path to be sure it finds them
dotenv.config({ path: path.join(__dirname, '../../.env') });

const users = [
    {
        name: 'Admin User',
        email: 'admin@wazzifni.com',
        phone: '9647000000000',
        password: 'admin123', // This will be hashed by User model hook
        role: 'admin',
        emailVerified: true
    },
    {
        name: 'Dr. Ahmed Mohammed',
        email: 'ahmed@wazzifni.com',
        phone: '9647000000001',
        password: 'instructor123',
        role: 'instructor',
        emailVerified: true,
        bio: 'Expert in Web Development with 10+ years experience',
        expertise: ['JavaScript', 'React', 'Node.js']
    },
    {
        name: 'Sarah Khalid',
        email: 'sarah@example.com',
        phone: '9647000000002',
        password: 'student123',
        role: 'student',
        emailVerified: true
    }
];

const courses = [
    {
        name: 'Professional Web Development',
        description: 'Complete web development course from basics to advanced. This course covers frontend and backend technologies including HTML, CSS, JavaScript, React, and Node.js.',
        shortDescription: 'Master web development in 3 months',
        category: 'programming',
        level: 'beginner',
        type: 'paid',
        price: 500000,
        totalSeats: 30,
        startDate: new Date('2024-04-01'),
        instructorName: 'Dr. Ahmed Mohammed',
        isPublished: true,
        isFeatured: true,
        learningOutcomes: [
            'Build responsive websites',
            'Master JavaScript',
            'Create full-stack applications'
        ],
        syllabus: [
            {
                week: 1,
                title: 'HTML & CSS Basics',
                topics: ['HTML5', 'CSS3', 'Responsive Design']
            },
            {
                week: 2,
                title: 'JavaScript Fundamentals',
                topics: ['Variables', 'Functions', 'DOM Manipulation']
            }
        ]
    },
    {
        name: 'UI/UX Design Masterclass',
        description: 'Learn modern design principles and tools. Focus on user research, wireframing, and high-fidelity prototyping using Figma.',
        shortDescription: 'Become a professional UI/UX designer',
        category: 'design',
        level: 'intermediate',
        type: 'paid',
        price: 350000,
        totalSeats: 25,
        startDate: new Date('2024-04-15'),
        instructorName: 'Dr. Ahmed Mohammed',
        isPublished: true,
        isFeatured: true
    },
    {
        name: 'Business English',
        description: 'Improve your English for business communication. Ideal for professionals looking to enhance their speaking and writing skills in a corporate environment.',
        shortDescription: 'Master business English in 2 months',
        category: 'language',
        level: 'beginner',
        type: 'free',
        totalSeats: 50,
        startDate: new Date('2024-05-01'),
        instructorName: 'Dr. Ahmed Mohammed',
        isPublished: true
    }
];

const seedDatabase = async (exitOnFinish = true, forceClear = false) => {
    try {
        // Connect if not already connected
        if (mongoose.connection.readyState === 0) {
             console.log('🔗 Connecting to MongoDB...');
             if (!process.env.MONGODB_URI) {
                 throw new Error('❌ MONGODB_URI is not defined in .env file');
             }
             await mongoose.connect(process.env.MONGODB_URI);
             console.log('✅ Connected to MongoDB successfully');
        }

        // Check if data exists
        const userCount = await User.countDocuments();
        const courseCount = await Course.countDocuments();

        if (!forceClear && userCount > 0) {
            console.log('ℹ️ Course data already exists, skipping seed.');
            return;
        }

        console.log('🌱 Starting database seeding...');

        // Clear existing data if forced or if we're running as a standalone script
        if (forceClear) {
            console.log('🗑️ Clearing existing data...');
            await User.deleteMany({});
            await Course.deleteMany({});
            console.log('✅ Cleared existing data');
        }

        // Create users
        console.log('👥 Creating users...');
        // We use create() on each to ensure the pre-save password hook runs
        const createdUsers = [];
        for (const userData of users) {
            const user = await User.create(userData);
            createdUsers.push(user);
        }
        console.log(`✅ Created ${createdUsers.length} users successfully`);

        // Find instructor
        const instructor = createdUsers.find(u => u.role === 'instructor');
        if (!instructor) {
            throw new Error('❌ Instructor user not found in created users');
        }

        // Update courses with instructor ID
        const coursesWithInstructor = courses.map(course => ({
            ...course,
            instructor: instructor._id
        }));

        // Create courses
        console.log('📚 Creating courses...');
        const createdCourses = await Course.create(coursesWithInstructor);
        console.log(`✅ Created ${createdCourses.length} courses`);

        console.log('🎉 Database seeded successfully! 🌱');
        if (exitOnFinish) {
            console.log('Closing connection...');
            await mongoose.connection.close();
            process.exit(0);
        }
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        if (exitOnFinish) process.exit(1);
        throw error;
    }
};

// Check if script is run directly
if (require.main === module) {
    seedDatabase(true, true); // Force clear when run directly
}

module.exports = seedDatabase;
