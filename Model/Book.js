const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var bookSchema = new mongoose.Schema({
    name: { type: String },
   genre: { type: String },
   authorId: { type: String },
});
 

//Export the model
module.exports = mongoose.model('books', bookSchema);
