var mongoose = require('mongoose')
   ,Schema = mongoose.Schema

var snpSchema = new Schema({
    rid: Number,
    name: String,
    allels: String,
    chrom: String,
    basePair: Number,
    index: Number
});

module.exports = mongoose.model('SNP', snpSchema);