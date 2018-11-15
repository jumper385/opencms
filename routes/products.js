const express = require('express')
const mongoose = require('mongoose')
const url = require('url')
const router = express.Router()

// MODELS
const Product = require('../schemas/product.model')

// Home Route 
router.route('/')
    .get((req, res, next) => {
        Product.find()
            .select('name price _id description author')
            .then(response => {
                let display = response.map((acc) => {
                    if (response.length < 1) res.json(null)
                    else{
                        return {
                            ...acc._doc,
                            url: `http://${req.headers.host}/api/products/${acc._doc._id}`
                        }
                    }
                })
                res.status(200).json({
                    count: response.length,
                    message: 'Current Product Inventory',
                    currentProducts: {
                        display
                    }
                })
            })
            .catch(err => {
                res.status(500).json({
                    message: `We cannot retrive the products`
                })
            })
    })
    .post((req, res, next) => {
        console.log(req.body)
        const product = new Product({
            _id: new mongoose.Types.ObjectId,
            ...req.body
        })

        product.save()
            .then(result => res.status(200).json({
                message: 'handling POST requests to /api/products',
                newProduct: {
                    ...product._doc,
                    method: 'GET',
                    url: `http://${req.headers.host}/api/products/${product._doc._id}`
                }
            }))
            .catch(err => res.status(500).json({
                error: err.message
            }))
    })

// Search a Product by ID
router.route('/:id')
    .get((req, res, next) => {

        Product.findById(req.params.id)
            .select('_id price name')
            .then(part => {
                res.status(200).json({
                    message:`Your request for '${part.name}' was successful`,
                    product:{
                        part
                    }
                })
            })
            .catch(err => {
                res.status(500).json({
                    error: err.message
                })
            })
    })
    .patch((req, res, next) => {
        const updates = Object.entries(req.body).reduce((acc, curr) => {
            acc[curr[0]] = curr[1]
            return acc
        }, {})
        Product.updateOne({
                _id: req.params.id
            }, {
                $set: updates
            })
            .then(result => {
                res.status(200).json({
                    message: 'The patch was successful',
                    updates:{...updates},
                    url:`http://${req.headers.host}/api/products/${req.params.id}`
                })
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                })
            })
    })
    .delete((req, res, next) => {
        Product.deleteOne({_id: req.params.id})
            .then(result => res.status(200).json({
                message:'The Product was Deleted',
                returnHome:`http://${req.headers.host}/api/products`
            }))
            .catch(err => res.status(500).json({
                error: err.message
            }))
    })

module.exports = router