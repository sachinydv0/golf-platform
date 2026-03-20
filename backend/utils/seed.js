const dotenv   = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

const connectDB = require('../config/db');
const User      = require('../models/User');
const Charity   = require('../models/Charity');

const charities = [
  {
    name: 'Cancer Research UK', slug: 'cancer-research-uk',
    description: 'Funding pioneering research to defeat cancer.',
    shortDesc: 'World-leading cancer research charity.',
    category: 'Health', isFeatured: true,
    website: 'https://www.cancerresearchuk.org',
  },
  {
    name: 'Golf Foundation', slug: 'golf-foundation',
    description: 'Inspiring young people through golf across the UK.',
    shortDesc: 'Golf access for young people.',
    category: 'Sport', isFeatured: true,
    website: 'https://www.golf-foundation.org',
  },
  {
    name: 'MacMillan Cancer Support', slug: 'macmillan-cancer-support',
    description: 'Providing medical, emotional, practical, and financial support to cancer patients.',
    shortDesc: 'Support for people living with cancer.',
    category: 'Health', isFeatured: false,
    website: 'https://www.macmillan.org.uk',
  },
  {
    name: 'Alzheimer\'s Society', slug: 'alzheimers-society',
    description: 'Research into dementia and support for those living with Alzheimer\'s.',
    shortDesc: 'Leading dementia charity.',
    category: 'Health', isFeatured: false,
    website: 'https://www.alzheimers.org.uk',
  },
  {
    name: 'British Heart Foundation', slug: 'british-heart-foundation',
    description: 'Fighting heart disease through research and education.',
    shortDesc: 'Heart disease research and support.',
    category: 'Health', isFeatured: true,
    website: 'https://www.bhf.org.uk',
  },
];

const seed = async () => {
  try {
    await connectDB();
    console.log('Seeding database...');

    // Clear existing
    await User.deleteMany({ role: 'admin' });
    await Charity.deleteMany({});

    // Create admin
    const admin = await User.create({
      firstName: 'Platform',
      lastName:  'Admin',
      email:     process.env.ADMIN_EMAIL    || 'admin@golfcharity.com',
      password:  process.env.ADMIN_PASSWORD || 'Admin@123',
      role:      'admin',
      subscription: { status: 'active', plan: 'yearly' },
    });
    console.log(`Admin created: ${admin.email}`);

    // Create charities
    await Charity.insertMany(charities);
    console.log(`${charities.length} charities seeded`);

    console.log('\nSeed complete!');
    console.log(`Admin login: ${admin.email} / ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
