const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')

const venueController = require('../controllers/venue_controller')
const reviewController = require('../controllers/review_controller')
const { verifyOwner, verifyUser } = require('../middleware/auth')



router.route('/')
    .get(venueController.getAllVenues)
    .post(verifyOwner, venueController.createVenue) //only owner can able to create venue
    // .put((req, res) => {
    //     res.status(405).json({ error: "PUT request is not allowed" })
    // })
   // .delete(verifyOwner,venueController.deleteAllvenues)

router.route('/:venue_id')
    .get(venueController.getVenueById)
    // .post((req, res) => {
    //     res.status(404).json({ error: 'POST request is not allowed' })
    // })
    .put(verifyOwner , venueController.updateVenueById)
    .delete(verifyOwner,venueController.deleteVenueById)




// router.route('/:venue_id/upload', upload.single('photo'))
//     .post(verifyOwner, venueController.uploadImage)

//reviews

router.route('/:venue_id/reviews')
    .get(reviewController.getAllReview)
    .post(verifyUser, reviewController.createReview)
    // .put((req, res) => {
    //     res.status(405).json({ error: "PUT request is not allowed" })
    // })
   // .delete(verifyOwner, reviewController.deleteAllReviews)


router.route('/:venue_id/reviews/:review_id')
    .get(reviewController.getReviewById)
    .put(reviewController.updateReviewById)
    .delete(reviewController.deleteReviewById)
    // .post((req, res) => {
    //     res.status(405).json({ error: 'POST request is not allowed' })
    // })








module.exports = router
