const mongoose = require('mongoose');
const fs = require('fs');
const Constitution_Data = require('../models/ConstitutionPart');

const MONGO_URI = "mongodb+srv://aditya:aditya1510@h4b-4.mbcn7j9.mongodb.net/VidhikGuru"

mongoose
    .connect(MONGO_URI)
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