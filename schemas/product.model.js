const mongoose = require('mongoose')

const Product = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    name: {type: String, required: true},
    price: {type: Number, required: true},
    author: {type: String},
    description: {type:String},
    imgPath: {type:String},
    demand_amount: {type: Number, default: 0}
})

module.exports = mongoose.model('Product', Product)