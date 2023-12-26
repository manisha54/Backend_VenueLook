const Venue = require('../models/Venue')

// const getAllVenues = (req, res, next) => {
//     Venue.find()
//         .then(venues => res.json(venues))
//         .catch(next)
// }

const getAllVenues = (req, res, next) => {
    Venue.find()
        .then(venues => res.json({
            success: true,
            count: venues.length,
            data: venues,
        }))
        .catch(next)
}


const createVenue = (req, res, next) => {
    Venue.create(req.body)
        .then((venue) => res.status(201).json({
            success: true,
            data: [venue],
        }))
        .catch(err => next(err))
}


const deleteAllvenues = (req, res, next) => {
    Venue.deleteMany()
        .then(reply => res.json(reply))
        .catch(next)
}

const getVenueById = (req, res, next) => {
    Venue.findById(req.params.venue_id)
        .then((venue) => {
            if (!venue) {
                res.status(404).json({ error: 'venue not found' })
            }
            res.json({
                success: true,
                data: [venue],
            })
        })
        .catch(next)
}

const updateVenueById = (req, res, next) => {
    Venue.findByIdAndUpdate(
        req.params.venue_id,
        { $set: req.body },
        { new: true }
    ).then(updatedVenue => res.json({
        success: true,
        data: updatedVenue, // Make sure this field contains the updated venue data
      }))
        .catch(next)
}


const deleteVenueById = (req, res, next) => {
    Venue.findByIdAndDelete(req.params.venue_id)
        .then(reply => res.status(204).end())
        .catch(next)
}

// const addtofavourites = async (req, res,) => {
//     const { id } = req.params;
//     // Venue.findByIdAndUpdate(req.params.venue_id)
//     try {
//         const Venue = await Venue.findByIdAndUpdate(id, { isFavorite: true }, { new: true });

//         if (Venue) {
//             res.status(200).json({ message: 'Venue added to favorites successfully' });
//         } else {
//             res.status(404).json({ error: 'Venue not found' });
//         }
//     } catch (error) {
//         res.status(500).json({ error: 'Internal server error' });
//     }
// }

const uploadImage = (req, res, next) => {

    // console.log(req.user)
    res.json(req.file)

}
module.exports = {
    getAllVenues,
    createVenue,
    deleteAllvenues,
    getVenueById,
    updateVenueById,
    deleteVenueById,
    // addtofavourites,
    uploadImage
}