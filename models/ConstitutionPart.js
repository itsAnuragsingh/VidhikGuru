const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
    ArtNo: String,
    Name: String,
    ArtDesc: String,
}, {_id: false});

const PartSchema = new mongoose.Schema({
    PartNo: String,
    Name: String,
    Articles: [ArticleSchema]
}, {_id: false});

module.exports = mongoose.model('Constitution_Data', PartSchema);