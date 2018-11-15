const mongoose = require('mongoose')

const Product = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    name: {type: String, required: true},
    price: {type: Number, required: true},
    author: {type: String},
    description: {type:String},
    request_amount: {type:Number}
})

module.exports = mongoose.model('Product', Product)