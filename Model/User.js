const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    mobile:{
        type:String,
    },
    address:{
        type:String,
    },
});

//Export the model
module.exports = mongoose.model('User', userSchema);