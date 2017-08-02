/*
 * db.js
 * Connects to the db (named test in this case)
 */

var mongoose = require('mongoose');

var addr = process.env.MONGO_PORT_27017_TCP_ADDR
var port = process.env.MONGO_PORT_27017_TCP_PORT

mongoose.connect('mongodb://' + addr + ':' + port +'/test', {useMongoClient: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to DB');
});

module.exports = db;
