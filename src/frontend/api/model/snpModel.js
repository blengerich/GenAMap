var mongoose = require('mongoose')
   ,Schema = mongoose.Schema

var snpSchema = new Schema({
    name: { type: String, unique: true },
    allels: String,
    chrom: String,
    basePair: Number,
    index: Number
});

module.exports = mongoose.model('SNP', snpSchema);