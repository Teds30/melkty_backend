const express = require('express')
const app = express()

const mysql = require('mysql')
const moment = require('moment')
const cors = require('cors')
const path = require('path')

const PORT = process.env.PORT || 4000

connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'milktea_shop',
})

const logger = (req, res, next) => {
    console.log(
        `${req.protocol}://${req.get('host')}${
            req.originalUrl
        } : ${moment().format()}`
    )

    next()
}

// app.use(logger)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

/*============================
@
@      P R O D U C T S
@
/============================*/

app.get('/api/test', (req, res) => {
    try {
        res.json({
            status: 200,
            message: 'Get data has successfully',
        })
    } catch (error) {
        console.error(error)
        return res.status(500).send('Server error')
    }
})

// FETCH PRODUCTS
app.get('/api/products', (req, res) => {
    connection.query(
        'SELECT * FROM product WHERE is_available = 1',
        (err, rows, fields) => {
            if (err) throw err
            res.json(rows)
        }
    )
})

// FETCH PRODUCT by ID
app.get('/api/products/:id', (req, res) => {
    var id = req.params.id

    connection.query(
        `SELECT * FROM product WHERE id = '${id}'`,
        (err, rows, fields) => {
            if (err) throw err

            if (rows.length > 0) {
                res.json(rows)
            } else {
                res.status(400).json({ msg: `No product with an id of ${id}` })
            }
        }
    )
})
// FETCH CATEGOREIS
app.get('/api/categories', (req, res) => {
    connection.query('SELECT * FROM category', (err, rows, fields) => {
        if (err) throw err
        res.json(rows)
    })
})

// FETCH PRODUCT by Category
app.get('/api/category-products/:id', (req, res) => {
    var id = req.params.id

    connection.query(
        `SELECT * FROM product WHERE category_id = '${id}' AND is_available = 1`,
        (err, rows, fields) => {
            if (err) throw err

            if (rows.length > 0) {
                res.json(rows)
            } else {
                res.status(400).json({ msg: `No category with an id of ${id}` })
            }
        }
    )
})

/*============================
@
@      O R D E R S
@
/============================*/

// FETCH ORDERS
app.get('/api/orders', (req, res) => {
    connection.query('SELECT * FROM orders', (err, rows, fields) => {
        if (err) throw err
        res.json(rows)
    })
})

// CREATE NEW ORDER
app.post('/api/orders', (req, res) => {
    var { customer_id, customer_address, shipping_fee, total_amount } = req.body

    connection.query(
        `INSERT INTO orders (customer_id, customer_address, shipping_fee, total_amount) VALUES ('${customer_id}','${customer_address}' ,'${shipping_fee}', '${total_amount}')`,
        (err, rows, fields) => {
            if (err) throw err
            res.json({
                msg: `1 row was inserted id: ${rows.insertId}`,
                id: `${rows.insertId}`,
            })
        }
    )
})

/*============================
@
@    O R D E R   I T E M S
@
/============================*/

// FETCH ORDER ITEMS
app.get('/api/orderitems', (req, res) => {
    connection.query('SELECT * FROM order_items', (err, rows, fields) => {
        if (err) throw err
        res.json(rows)
    })
})

// CREATE NEW ORDER ITEM
app.post('/api/orderitems', (req, res) => {
    var { order_id, product_id, name, price, quantity, amount } = req.body

    connection.query(
        `INSERT INTO order_items (order_id,product_id, name, price, quantity, amount) VALUES ('${order_id}', '${product_id}', '${name}','${price}', '${quantity}', '${amount}')`,
        (err, rows, fields) => {
            if (err) throw err
            res.json({
                msg: `1 row was inserted id: ${rows.insertId}`,
                id: `${rows.insertId}`,
            })
        }
    )
})

/*============================
@
@    A C C O U N T S
@
/============================*/

// FETCH all acounts
app.get('/api/accounts/', (req, res) => {
    connection.query('SELECT * FROM customer_account', (err, rows, fields) => {
        if (err) throw err
        res.json(rows)
    })
})

/*============================
@
@    A U T H E N T I C A T E
@
/============================*/

// auth account
app.post('/api/auth/login', (req, res) => {
    var { phone_number, password } = req.body

    connection.query(
        `SELECT * FROM customer_account WHERE phone_number = '${phone_number}' AND password = '${password}'`,
        (err, rows, fields) => {
            if (err) throw err
            if (rows.length === 0) {
                res.status(400).json({
                    msg: `Account not found!`,
                    status: `ACC_NOT_FOUND`,
                    data: null,
                })
            }

            if (rows.length > 0) {
                res.json({
                    msg: `Found an account`,
                    status: `ACC_FOUND`,
                    data: rows[0],
                })
            }
        }
    )
})

app.use(express.static(path.join('.')))

app.listen(PORT, () => {
    console.log(`Server is started in port ${PORT}`)
})

// Export the Express API
module.exports = app
