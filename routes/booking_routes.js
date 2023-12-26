const express = require('express')
const router = express.Router()
const venueController = require('../controllers/venue_controller')
const bookingVenueController = require('../controllers/booking_venue_controller')
const { verifyOwner, verifyUser } = require('../middleware/auth')
const Venue = require('../models/Venue')
const Booking = require('../models/Booking')



//booking
router.route('/')
    .get(verifyOwner, bookingVenueController.getAllBookingVenue)
    // .put((req, res) => {
    //     res.status(405).json({ error: "PUT request is not allowed" })
    // })
    // .delete((req, res) => {
    //     res.status(405).json({ error: "DELETE request is not allowed" })
    // })
    // .post((req, res) => {
    //     res.status(405).json({ error: "POST request is not allowed" })
    // })

router.route('/:venue_id')
    .post(verifyUser, bookingVenueController.createBookingVenue)

// only by users
router.route('/allbookings')
    .get(verifyUser, bookingVenueController.getAllBookings)


router.route('/:booking_id')
    .get(bookingVenueController.getBookingVenueById)
    .put(bookingVenueController.updateBookingVenueById)
    .delete(bookingVenueController.deleteBookingVenueById)





module.exports = router

