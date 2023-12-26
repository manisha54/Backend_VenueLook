const mongoose = require('mongoose')




//review venue schema
const reviewScheme = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        minLength: 10
    },

    //for user id on review (name should match with model name )
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userName: {
        type: String
    }
})


//remove unnessary

reviewScheme.set('toJSON', {
    transform: (document, returnedDocument) => {
        returnedDocument.id = document._id.toString()
        delete returnedDocument._id

    }

})

const venueScheme = new mongoose.Schema({
    venueName: {
        type: String,
        required: true
    },
    picture: {
        type: String
    },
    established: {
        type: String,
        required: true
    },
    location: {
        type: String,
        require: true
    },
    advancePayment: {
        type: String,
        required: true
    },
    spacePreference: {
        type: String,
        required: true
    },
    venueType: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    perPlate: {
        type: String,
        required: true
    },
    venueHallCapacity: {
        type: String,
        required: true
    },
    reviews: [reviewScheme],
    photo: {
        type: String
    }



}, { timestamps: true })




//remove unnessary thing
venueScheme.set('toJSON', {
    transform: (document, returnedDocument) => {
        returnedDocument.id = document._id.toString()
        delete returnedDocument._id
        delete returnedDocument.__v

    }
})




module.exports = mongoose.model('Venue', venueScheme)