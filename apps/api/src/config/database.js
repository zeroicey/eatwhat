const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uriEnv = process.env.MONGODB_URI;
    const user = process.env.MONGODB_USER;
    const pass = process.env.MONGODB_PASSWORD;
    const authSource = process.env.MONGODB_AUTH_SOURCE || 'admin';
    const dbName = process.env.MONGODB_DB;

    let uri = uriEnv;
    if (!uri && process.env.MONGODB_HOST) {
      const host = process.env.MONGODB_HOST;
      const port = process.env.MONGODB_PORT || '27017';
      const db = dbName || 'eatwhat';
      uri = `mongodb://${host}:${port}/${db}`;
    } else if (uri && dbName && !uri.includes('/?') && !uri.match(/\/[A-Za-z0-9_\-]+(\?|$)/)) {
      uri = uri.endsWith('/') ? `${uri}${dbName}` : `${uri}/${dbName}`;
    }

    const options = {};
    if (user && pass) {
      options.user = user;
      options.pass = pass;
      options.authSource = authSource;
    }

    const conn = await mongoose.connect(uri, options);

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
