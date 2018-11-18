const mongoose = require('mongoose')

const Product = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    name: {type: String, required: true},
    price: {type: Number, required: true},
    author: {type: String},
    description: {type:String},
    imgPath: {type:String}
})

module.exports = mongoose.model('Product', Product)