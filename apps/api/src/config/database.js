const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 6+ no longer needs these options
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Create indexes after connection
    await createIndexes();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // Indexes will be created when models are initialized
    console.log('Database indexes ready');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

module.exports = connectDB;
