const express = require('express')
const router = express()
const mongoose = require('mongoose')

// MODEL
// const Order = require('../schemas/order.model')
const Order = require('../schemas/order.model')
const Product = require('../schemas/product.model')

router.route('/')
    .get((req, res) => {
        Order.find()
            .select('date _id quantity product')
            .then(response => {
                res.status(200).json({
                    orders: response.map(acc => {
                        return {
                            _id: acc._id,
                            product: acc.product,
                            quantity: acc.quantity,
                            date: acc.date
                        }
                    })
                })
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                })
            })
    })
    .post((req, res) => {
        Product.findById(req.body.productID)
            .then(doc => {
                if(doc){
                    let new_order = new Order({
                        _id: new mongoose.Types.ObjectId,
                        product:req.body.productID,
                        quantity:req.body.quantity
                    })
                    new_order.save()
                        .then(result => {
                            res.status(200).json({
                                result
                            })
                        })
                        .catch(err => {
                            res.status(500).json({
                                error:err.message
                            })
                        })
                }
            })
            .catch(err => {
                res.status(500).json({
                    error:err.message
                })
            })
    })

router.route('/:id')
    .get((req,res) => {
        Order.findById(req.params.id)
            .select('_id product quantity')
            .then(doc => {
                res.status(200).json(doc)
            })
            .catch(err => {
                res.status(500).json({
                    error:err.message
                })
            })
    })
    .patch((req,res) => {
        Order.findById(req.params.id)
            .then(doc => {
                Order.updateOne({_id:req.params.id},req.body)
                    .exec()
                    .then(response => {
                        res.status(200).json({
                            message:'order updated'
                        })
                    })
                    .catch(err => {
                        res.status(500).json({message:err.message})
                    })
            })
            .catch(err => {
                res.status(500).json({
                    error:err.message
                })
            })
    })
    .delete((req,res) => {
        Order.findById(req.params.id)
            .then(doc => {
                Order.deleteOne({_id:req.params.id})
                    .then( _ => {
                        res.status(200).json({
                            message:'Order Deleted'
                        })
                    })
            })
            .catch(err => {
                res.status(500).json({
                    error: err.message
                })
            })
    })

module.exports = router