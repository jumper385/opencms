const express = require('express')
const mongoose = require('mongoose')
const url = require('url')
const router = express.Router()
const multer = require('multer')
const uniqid = require('uniqid')

// MULTER STORAGE ENGINE
const storage = multer.diskStorage({
    destination:'./uploads',
    filename:(req,file,cb)=>{
        console.log(file.mimetype)
        cb(null,uniqid.process() + '_' + Date.now() + '_' + file.originalname)
    }
})

const fileFilter = (req,file,cb) => {
    if(file.mimetype == 'image/jpeg' || 'image/png'){
        cb(null,true)
    } else {
        cb(null, false)
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024*1024,
    },
    fileFilter: fileFilter
})

// MODELS
const Product = require('../schemas/product.model')
const Order = require('../schemas/order.model')

// Home Route 
router.route('/')
    .get((req, res, next) => {
        Product.find()
            .select('imgPath demand_amount name price _id description author')
            .then(response => {
                let display = response.map((acc) => {
                    if (response.length < 1) res.json(null)
                    else{
                        return {
                            ...acc._doc,
                            url: `http://${req.headers.host}/api/products/idsearch/${acc._doc._id}`
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
    .post(upload.single('productImage'),(req, res, next) => {
        console.log(req.file)
        const product = new Product({
            _id: new mongoose.Types.ObjectId,
            ...req.body,
            imgPath:`http://${req.headers.host}/${req.file.path}`
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
router.route('/idsearch/:id')
    .get((req, res, next) => {

        Product.findById(req.params.id)
            .select('imgPath demand_amount name price _id description author')
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

router.route('/demand')
    .get((req,res) => {
        Order.aggregate([
            {$lookup:{
                from:'products',
                localField:'product',
                foreignField:'_id',
                as:'book_details'
            }},
            {$group:{
                _id:'$product',
                total:{$sum:'$quantity'},
                book_details:{$first: '$book_details'}
            }},
            {$project: {
                book_details:1,
                _id:0,
                total:1,
            }}
        ])
            .then(docs => {
                let display = docs.map(acc => {
                    return {
                        name:acc.book_details[0].name,
                        book_id:acc.book_details[0]._id,
                        demand_amount:acc.total
                    }
                })
                res.status(200).json({
                    message:'Order Breakdown (per product)',
                    order_breakdown:display
                })
            })
            .catch(err => {
                res.status(500).json({
                    error:err.message
                })
            })
    })

module.exports = router