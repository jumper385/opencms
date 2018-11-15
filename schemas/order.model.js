const mongoose = require('mongoose')

const Order = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    date: {type: Date, default:Date.now},
    product: {type: mongoose.Schema.Types.ObjectId, ref:'Product', required:true},
    quantity: {type: Number, default: 1}
})

module.exports = mongoose.model('Order', Order)