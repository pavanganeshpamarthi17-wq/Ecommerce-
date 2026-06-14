const mongoose = require('mongoose');
const logger = require('./logger');
const Category = require('../models/Category');
const Product = require('../models/Product');

let mongoServer;

const seedData = async () => {
  try {
    await Category.deleteMany({});
    await Product.deleteMany({});

    logger.info('Database cleared. Seeding default categories and products...');

      // 1. Create categories
      const electronics = await Category.create({
        name: 'Electronics',
        description: 'Latest gadgets, smartwatches, headphones, and more.',
        isActive: true,
        sortOrder: 1,
      });

      const clothing = await Category.create({
        name: 'Clothing',
        description: 'Trendy apparel, activewear, and fashion accessories.',
        isActive: true,
        sortOrder: 2,
      });

      const homeKitchen = await Category.create({
        name: 'Home & Kitchen',
        description: 'Modern furniture, decor, and kitchen essentials.',
        isActive: true,
        sortOrder: 3,
      });

      logger.info('Categories seeded successfully!');

      // 2. Create products
      const productsData = [
        {
          title: 'Wireless Noise-Canceling Headphones',
          description: 'Experience pure music bliss with these premium wireless headphones. Features active noise cancellation, 40-hour battery life, and plush memory foam earcups for ultimate all-day comfort. Perfect for traveling, remote work, or intense workouts.',
          price: 14999,
          discountPrice: 12999,
          category: electronics._id,
          brand: 'SoundPro',
          stock: 45,
          isFeatured: true,
          tags: ['headphones', 'wireless', 'electronics', 'audio'],
          images: [
            {
              url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
              publicId: 'seeder/headphones_main',
              alt: 'Wireless Headphones Main'
            }
          ]
        },
        {
          title: 'Smart Fitness Watch Active',
          description: 'Track your fitness goals, monitor heart rate, sleep quality, and receive notifications on the go. Equipped with a sleek AMOLED screen, built-in GPS, water resistance up to 50m, and up to 10 days of battery life per charge.',
          price: 8999,
          discountPrice: 7499,
          category: electronics._id,
          brand: 'FitLife',
          stock: 80,
          isFeatured: true,
          tags: ['watch', 'smartwatch', 'fitness', 'wearables'],
          images: [
            {
              url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
              publicId: 'seeder/smartwatch_main',
              alt: 'Smart Watch Main'
            }
          ]
        },
        {
          title: 'Minimalist Slim Leather Wallet',
          description: 'Handcrafted from premium full-grain leather, this slim wallet offers RFID blocking protection, storage for up to 8 cards, and a convenient quick-access pull-tab. Designed to fit comfortably in your front pocket without the bulk.',
          price: 2499,
          discountPrice: 1999,
          category: clothing._id,
          brand: 'HideSkin',
          stock: 120,
          isFeatured: false,
          tags: ['wallet', 'leather', 'accessories', 'men'],
          images: [
            {
              url: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=800&q=80',
              publicId: 'seeder/wallet_main',
              alt: 'Leather Wallet Main'
            }
          ]
        },
        {
          title: 'Ergonomic Office Chair',
          description: 'Upgrade your work-from-home setup with our premium ergonomic office chair. Designed with high-density mesh backrest, adjustable 3D armrests, dynamic lumbar support, and smooth-rolling nylon casters. Protect your posture during long hours.',
          price: 18999,
          discountPrice: 15999,
          category: homeKitchen._id,
          brand: 'ComfortSeat',
          stock: 25,
          isFeatured: true,
          tags: ['chair', 'furniture', 'office', 'ergonomic'],
          images: [
            {
              url: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=800',
              publicId: 'seeder/chair_main',
              alt: 'Ergonomic Chair Main'
            }
          ]
        },
        {
          title: 'Vacuum Insulated Water Bottle',
          description: 'Keep your drinks ice cold for 24 hours or piping hot for 12 hours. Made of premium food-grade 18/8 stainless steel, 100% BPA-free, and leak-proof. Perfect for the gym, hiking, cycling, or office use.',
          price: 1499,
          discountPrice: 0,
          category: homeKitchen._id,
          brand: 'HydroGo',
          stock: 200,
          isFeatured: false,
          tags: ['bottle', 'water', 'kitchen', 'fitness'],
          images: [
            {
              url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
              publicId: 'seeder/bottle_main',
              alt: 'Water Bottle Main'
            }
          ]
        },
        {
          title: 'Organic Cotton Classic Tee',
          description: 'Crafted from 100% certified organic cotton, this t-shirt is super soft, breathable, and features a classic crew-neck fit. Pre-shrunk fabric ensures shape and color retention through multiple washes. Sustainably sourced.',
          price: 1199,
          discountPrice: 899,
          category: clothing._id,
          brand: 'EcoWear',
          stock: 150,
          isFeatured: false,
          tags: ['tshirt', 'clothing', 'organic', 'unisex'],
          images: [
            {
              url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
              publicId: 'seeder/tshirt_main',
              alt: 'Organic T-Shirt Main'
            }
          ]
        }
      ];

      await Product.create(productsData);
      logger.info('Products seeded successfully!');
  } catch (error) {
    logger.error(`Error seeding default database data: ${error.message}`);
  }
};

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri || mongoUri === 'memory' || mongoUri.includes('<username>')) {
      logger.info('Starting MongoDB Memory Server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      process.env.MONGO_URI = mongoUri;
      logger.info(`MongoDB Memory Server started at: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default data
    await seedData();
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB error: ${err.message}`);
});

module.exports = connectDB;
