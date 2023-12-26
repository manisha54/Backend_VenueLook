require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')
const user_routes = require('./routes/user_routes')
const venue_routes = require('./routes/venue_routes')
const booking_routes = require('./routes/booking_routes')
const { verifyUser } = require('./middleware/auth')
const { verifyOwner } = require('./middleware/auth')
const upload = require('./middleware/upload')
const Venue = require('./models/Venue')
const User = require('./models/User')


const MONGODB_URL = process.env.NODE_ENV === 'test'
        ?process.env.TEST_DB_URL
        : process.env.DB_URL



mongoose.connect(MONGODB_URL)
  .then(()=>{
    console.log(`connected to the ${MONGODB_URL} server`)
  })
  .catch((err) => console.log(err))



const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('public'))  
app.use(morgan('tiny'))

app.get('/', (req, res) => {
  res.send("testing")
})


app.use('/users', user_routes)
app.use('/bookings', verifyUser, booking_routes)
app.use('/venues', verifyUser, venue_routes)
//app.post('/upload/:venue_id', upload.single('photo'), (req, res, next) => {
  

// app.post('/upload/', upload.single('photo'), (req, res, next) => {
  
//   res.json({data: req.file.filename})

// })


app.post('/upload', upload.single('photo'), (req, res, next) => {
  console.log(req.file)
  
  res.json({data: req.file.filename})

})




//error handling middleware
app.use((err, req, res, next) => {
  console.log(err)
  if (err.name === 'ValidatioError') res.status(400)
  else if (err.name === 'CastError') res.status(400)
  console.log(err.message)
  res.json({ error: err.message })
})



//unknown path

app.use((req, res) => {
  res.status(404).json({ error: "path not found" })
})

module.exports = app