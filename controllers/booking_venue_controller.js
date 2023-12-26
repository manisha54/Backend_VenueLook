
const Booking = require('../models/Booking')
const Venue = require('../models/Venue')



const getAllBookingVenue = (req, res, next) =>{
    Booking.find()
    .then(bookings => res.
        json(bookings))
    .catch(next)
}






const createBookingVenue = (req, res) => {
    Venue.findById(req.params.venue_id)
    .then(venue => {
        if (!venue) return res.status(404).json({ error: " venue not found" })
        const user_id = req.user.id;
        const newBooking = {
            time: req.body.time,
            date: req.body.date,
            contactNumber: req.body.contactNumber,
            user: user_id,
            venue: req.params.venue_id,
            fullName:`${ req.user.fName} ${req.user.lName}`
        
        }
        // res.json(newBooking);
        Booking.create(newBooking)
            .then(successBooking => {
                res.json({
                    success:true,
                    data:[successBooking]
                });
            })
            .catch(err => res.json({ error: err.message }))

        // res.json(venue);
    })
    .catch(err => res.json({ error: err.message }))
}


const getBookingVenueById = (req, res) => {
    const bookingId = req.params.booking_id;

    // Assuming you have a Booking model that represents bookings in your database
    Booking.findById(bookingId)
        .then(booking => {
            if (!booking) {
                return res.status(404).json({ error: "Booking not found" });
            }
            res.json({
                success: true,
                data: [booking]
            });
        })
        .catch(err => res.status(500).json({ error: err.message }));
}


const updateBookingVenueById = (req, res) => {
    const bookingId = req.params.booking_id;

    // Assuming you have a Booking model that represents bookings in your database
    Booking.findByIdAndUpdate(bookingId, req.body, { new: true })
        .then(updatedBooking => {
            if (!updatedBooking) {
                return res.status(404).json({ error: "Booking not found" });
            }
            res.json({
                success: true,
                data: [updatedBooking]
            });
        })
        .catch(err => res.status(500).json({ error: err.message }));
}


const deleteBookingVenueById = (req, res) => {
    const bookingId = req.params.booking_id;

    // Assuming you have a Booking model that represents bookings in your database
    Booking.findByIdAndDelete(bookingId)
        .then(deletedBooking => {
            if (!deletedBooking) {
                return res.status(404).json({ error: "Booking not found" });
            }
            res.json({
                success: true,
                data: [deletedBooking]
            });
        })
        .catch(err => res.status(500).json({ error: err.message }));
}


const getAllBookings = (req, res, next) => {
    Booking.find({
        user: req.user.id
    })
        .then(booking => {
            res.json({
                success: true,
                count: booking.length,
                data: booking,
            })
        })
        .catch(err => next(err));
}






module.exports ={
    getAllBookingVenue,
    createBookingVenue,
    // createBookingVenueById,
    getBookingVenueById,
    updateBookingVenueById,
    deleteBookingVenueById,
    getAllBookings
   
}