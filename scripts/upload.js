const mongoose = require('mongoose');
const fs = require('fs');
const Constitution_Data = require('../models/ConstitutionPart');

const mongo_uri = process.env.MONGODB_URI;

mongoose
    .connect(mongo_uri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

async function uploadData() {
    const partsArray = JSON.parse(fs.readFileSync('Constitution.json', 'utf-8'));

    try {
        await Constitution_Data.deleteMany({});
        await Constitution_Data.insertMany(partsArray);
        console.log("✅ Constitution inserted successfully");
    } catch (err) {
        console.error("❌ Upload error:", err);
    } finally {
        mongoose.disconnect();
    }
}
uploadData()