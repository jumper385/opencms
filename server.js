const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const port = 4000
const app = express()
const chalk = require('chalk')
const serverName = 'SERVER'

// MONGODB SETUP
const password = 'nova'
// const url = 'mongodb://127.0.0.1:27017/store'
const url = `mongodb+srv://nova:${password}@sandbox-ztrfz.azure.mongodb.net/test?retryWrites=true`
mongoose.connect(url,{ useNewUrlParser: true })
    .then(_=>{
        console.log(chalk.cyan('Database Connection Established...'))
    })
    .catch(err => {
        console.log(chalk.red('Could not Connect to Database...'))
    })

// MIDDLE WEAR
app.use(morgan('dev')) // MORGAN MIDDLEWEAR
app.use('/uploads',express.static('uploads')) // SET THE IMAGE STATIC FILE
app.use(bodyParser.urlencoded({extended:true})) // PARSING URL ENCODED
app.use(bodyParser.json()) // PARSING JSON
app.use((req,res,next) => { // PREVENTING CORS ERRORS
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers','*')
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({})
    }
    next()
})

// ROUTES
const Orders = require('./routes/orders')
const Products = require('./routes/products')
app.use('/api/products', Products)
app.use('/api/orders', Orders)

// ERROR HANDLING
app.use((req,res,next) => {
    const err = new Error(`page not found`)
    err.status = 404
    next(err)
})
app.use((err,req,res,next) => {
    res.status(err.status || 500).json({
        error:{message:err.message}
    })
    next()
})

app.listen(port, (err) => {
    if(err)return console.log('houston... we have a problem')
    console.log(chalk.green(`[${serverName}] We're listening on PORT:${port}`))
})