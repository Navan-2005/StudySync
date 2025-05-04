
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = () => {
  // const uri = 'mongodb+srv://agromitra123:12345@health-care.7lz0w0g.mongodb.net/?retryWrites=true&w=majority&appName=Health-care';
  
  mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("✅ Database connection established"))
    .catch((error) => {
      console.error("❌ Database connection error:", error.message);
    });
};

module.exports = connectDB;

