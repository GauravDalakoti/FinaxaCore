import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import FinancialRecord from '../models/FinancialRecord.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(' Connected to MongoDB');

        await User.deleteMany();
        await FinancialRecord.deleteMany();
        console.log('  Cleared existing data');

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@finance.com',
            password: 'Admin@123',
            role: 'admin',
            status: 'active',
        });

        const analyst = await User.create({
            name: 'Analyst User',
            email: 'analyst@finance.com',
            password: 'Analyst@123',
            role: 'analyst',
            status: 'active',
        });

        await User.create({
            name: 'Viewer User',
            email: 'viewer@finance.com',
            password: 'Viewer@123',
            role: 'viewer',
            status: 'active',
        });

        console.log('👥 Users created');

        const categories = ['salary', 'freelance', 'food', 'transport', 'utilities', 'entertainment', 'rent', 'investment'];
        const records = [];

        for (let i = 0; i < 60; i++) {
            const isIncome = i % 3 === 0;
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 365));

            records.push({
                title: isIncome ? `Income Entry ${i + 1}` : `Expense Entry ${i + 1}`,
                amount: parseFloat((Math.random() * 5000 + 100).toFixed(2)),
                type: isIncome ? 'income' : 'expense',
                category: categories[Math.floor(Math.random() * categories.length)],
                date,
                notes: `Sample note for record ${i + 1}`,
                createdBy: i % 2 === 0 ? admin._id : analyst._id,
            });
        }

        await FinancialRecord.insertMany(records);
        console.log(' Financial records created');

        console.log('\n Seed complete! Login credentials:');
        console.log('  Admin:   admin@finance.com / Admin@123');
        console.log('  Analyst: analyst@finance.com / Analyst@123');
        console.log('  Viewer:  viewer@finance.com / Viewer@123');

        process.exit(0);
    } catch (err) {
        console.error(' Seed error:', err);
        process.exit(1);
    }
};

seedData();