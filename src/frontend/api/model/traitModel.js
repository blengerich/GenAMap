var mongoose = require('mongoose')
  ,Schema = mongoose.Schema

var traitSchema = new Schema({
  fileName: String,
  traits: Array
});

module.exports = mongoose.model('trait', traitSchema);