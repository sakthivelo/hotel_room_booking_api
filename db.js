const mongoose = require('mongoose');

// Connection URL
const url = 'mongodb://localhost:27017/hotelbooking'; // Replace with your MongoDB server's URL and database name

// Connect to MongoDB
 mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 50000 })
    .then(() => {
        console.log('Connected successfully to MongoDB server');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

module.exports = mongoose;