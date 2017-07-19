var mongoose = require('mongoose')
   ,Schema = mongoose.Schema

var dataSchema = new Schema({
    fileName: String,
    index: Number,
    data: Array,
});

//dataSchema.index({ firstName: 1, index: 1}, { unique: true });

module.exports = mongoose.model('Data', dataSchema);