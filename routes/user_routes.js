const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router()
const User = require('../models/User')
const { verifyUser, verifyOwner } = require('../middleware/auth')

const userController = require('../controllers/user_controller')

//register
router.post('/register', (req, res, next) => {
    const { fName, lName, email, phoneNumber, password, role } = req.body
    User.findOne({ email: req.body.email })
        .then((user) => {
            // res.json(user)
            if (user) return res.status(400).json({ error: 'user already exist' })
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) return res.status(500).json({ error: err.message })
                User.create({ fName, lName, email, phoneNumber, role, password: hash })
                    .then((user) => {
                        res.status(201).json(user)
                    }).catch(next)
            })
        }).catch(next)
})




//login
router.post('/login', (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (!user) return res.status(400).json({ error: 'user is not registered' })
            bcrypt.compare(req.body.password, user.password, (err, success) => {
                if (err) return res.status(500).json({ error: err.message })
                if (!success) return res.status(400).json({ error: 'password does not match' })
                const payload = {
                    id: user.id,
                    fName: user.fName,
                    lName: user.lName,
                    email: user.email,
                    role: user.role
                }
                // console.log(payload)
                jwt.sign(payload,
                    process.env.SECRET,
                    { expiresIn: '20d' },
                    (err, token) => {
                        if (err) return res.status(500).json({ error: err.message })
                        res.json({ status: 'login successfully', token: token })
                    })
            })
        }).catch(next)

})




router.route('/')
    .get(userController.getAllUsers)
    .delete((req, res, next) => {
        // Add the logic to delete all users here
        User.deleteMany({})
            .then(() => {
                res.status(200).json({ message: 'All users deleted successfully.' });
            })
            .catch(next);
    })
    // .post((req, res) => {
    //     res.status(405).json({ error: 'POST request is not allowed' })
    // })
    // .put((req, res) => {
    //     res.status(405).json({ error: "PUT request is not allowed" })
    // })



router.route('/userinfo')
    .get(verifyUser, userController.getUserById)
    // .post((req, res) => {
    //     res.status(405).json({ error: 'POST request is not allowed' })
    // })
    .put(verifyUser, userController.updateUserById)
    .delete(verifyUser, userController.deleteUserById)







module.exports = router