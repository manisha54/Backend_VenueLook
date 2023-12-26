
const mongoose = require('mongoose')

const bookingVenueSchema = new mongoose.Schema({
    date: {
        type: String,
        // default: Date.now,
        required:true
    },
    time: {
        type: String,
        required: true,
       
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fullName:{
        type: String
    },
    contactNumber:{
        type: String
    },
    venue:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue'         
    }
})


//remove unnessary thing
bookingVenueSchema.set('toJSON', {
    transform: (document, returnedDocument) => {
        returnedDocument.id = document._id.toString()
        delete returnedDocument._id
        delete returnedDocument.__v

    }
}, { timestamps: true })


module.exports = mongoose.model('Booking', bookingVenueSchema)