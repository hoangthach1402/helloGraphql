const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
     
    
    },
    stock:{
        type:Number,
        required:true,
      
    },
    type:{
        type:String,
        required:true,
       
    },
    img:{
        type:String,
        required:true,
      
    },
    price:{
        type:Number,
        required:true,
     
    },
});
  

//Export the model
module.exports = mongoose.model('product', productSchema);