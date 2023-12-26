const Venue = require('../models/Venue')


const getAllReview = (req, res, next) => {
    Venue.findById(req.params.venue_id)
        .then((venue) => {
            if (!venue) return res.status(404).json({ error: " venue not found" })
            res.json(venue.reviews)
        })
        .catch(next)

}

const createReview = (req, res, next) => {
    Venue.findById(req.params.venue_id)
        .then((venue) => {
            if (!venue) return res.status(404).json({ error: " venue not found" })
          
            const review = {
                text: req.body.text,
                user: req.user.id,
                userName:`${ req.user.fName} ${req.user.lName}`
            }
            venue.reviews.push(review)
            venue.save()
                .then((venue) => res
                    .status(201)
                    .json(venue.reviews[venue.reviews.length - 1]))
                .catch(next)
        })
        .catch(next)
}



// const deleteAllReviews = (req, res, next) => {
//     Venue.findById(req.params.book_id)
//         .then((venue) => {
//             if (!venue) return res.status(404).json({ error: 'venue not found' })
//             venue.reviews = []
//             venue.save()
//                 .then((venue) => res.status(204).end())
//                 .catch(next)
//         }).catch(next)
// }



//by id
const getReviewById = (req, res, next) => {
    Venue.findById(req.params.venue_id)
        .then(venue => {
            if (!venue) return res.status(404).json({ error: 'venue not found' })
            const review = venue.reviews.id(req.params.review_id)
            if (!review) return res.status(404).json({ error: 'review not found' })
            res.json(review)
        }).catch(next)
}

const updateReviewById = (req, res, next) => {
    Venue.findById(req.params.venue_id)
      .then((venue) => {
        if (!venue) return res.status(404).json({ error: 'venue not found' });
  
        const reviewToUpdate = venue.reviews.find((r) => r.id === req.params.review_id);
  
        if (!reviewToUpdate) return res.status(404).json({ error: 'review not found' });
  
        if (reviewToUpdate.user.toString() !== req.user.id) {
          return res.status(403).json({ error: 'You are not authorized to edit this review' });
        }
  
        reviewToUpdate.text = req.body.text;
  
        venue.save()
          .then(() => res.json(reviewToUpdate))
          .catch(next);
      })
      .catch(next);
  };
  

const deleteReviewById = (req, res, next) => {
    Venue.findById(req.params.venue_id)
        .then(venue => {
            if (!venue) return res.status(404).json({ error: 'venue not found' })
            venue.reviews = venue.reviews.filter((r) => {
                return (r.id !== req.params.review_id
                    && r.user !== req.user.id)
            })
            venue.save()
                .then(venue => res.status(204).end())
                .catch(next)
        }).catch(next)
}

module.exports = {
    getAllReview,
    createReview,
    // deleteAllReviews,
    getReviewById,
    updateReviewById,
    deleteReviewById

}