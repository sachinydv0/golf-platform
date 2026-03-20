const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Stripe webhook needs raw body — must be before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/users',        require('./routes/users'));
app.use('/api/scores',       require('./routes/scores'));
app.use('/api/draws',        require('./routes/draws'));
app.use('/api/charities',    require('./routes/charities'));
app.use('/api/payments',     require('./routes/payments'));
app.use('/api/winners',      require('./routes/winners'));
app.use('/api/admin',        require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// TEMPORARY SEED ROUTE — remove after seeding
app.get('/api/seed-now', async (req, res) => {
  try {
    const User    = require('./models/User');
    const Charity = require('./models/Charity');

    await User.deleteMany({ role: 'admin' });
    await Charity.deleteMany({});

    await User.create({
      firstName: 'Platform',
      lastName:  'Admin',
      email:     'admin@golfcharity.com',
      password:  'Admin@123',
      role:      'admin',
      subscription: { status: 'active', plan: 'yearly' },
    });

    const charities = [
      { name: 'Cancer Research UK',       slug: 'cancer-research-uk',       description: 'Funding pioneering research to defeat cancer.',                          shortDesc: 'World-leading cancer research charity.',   category: 'Health', isFeatured: true  },
      { name: 'Golf Foundation',          slug: 'golf-foundation',          description: 'Inspiring young people through golf across the UK.',                    shortDesc: 'Golf access for young people.',            category: 'Sport',  isFeatured: true  },
      { name: 'MacMillan Cancer Support', slug: 'macmillan-cancer-support', description: 'Support for people living with cancer.',                                shortDesc: 'Support for cancer patients.',             category: 'Health', isFeatured: false },
      { name: 'Alzheimers Society',       slug: 'alzheimers-society',       description: 'Research into dementia and support for those living with Alzheimers.',   shortDesc: 'Leading dementia charity.',                category: 'Health', isFeatured: false },
      { name: 'British Heart Foundation', slug: 'british-heart-foundation', description: 'Fighting heart disease through research and education.',                 shortDesc: 'Heart disease research and support.',      category: 'Health', isFeatured: true  },
    ];
    await Charity.insertMany(charities);

    res.json({ success: true, message: 'Seeded! Admin: admin@golfcharity.com / Admin@123' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`));
