const supertest = require('supertest')
const app = require('../app')
const Venue = require('../models/Venue')
const User = require('../models/User')
const Booking = require('../models/Booking')
const { default: mongoose } = require('mongoose')
const sinon = require('sinon');
const chai = require('chai');
const chaiSpies = require('chai-spies');
const chaiHttp = require('chai-http');
const bookingVenueController = require('../controllers/booking_venue_controller');

chai.use(chaiHttp);
chai.use(chaiSpies);
const expect = chai.expect;
const sandbox = sinon.createSandbox();


const api = supertest(app)
let usertoken = ''
let ownertoken = ''
let venue_id = ''
let review_id = ''



beforeAll(async () => {
    await Venue.deleteMany()
    await User.deleteMany()
    await Booking.deleteMany()

    const ress = await api.post('/users/register')
        .send({
            fName: "Manju",
            lName: "Tharu",
            phoneNumber: "9800576062",
            email: "manju456@gmail.com",
            password: "manju123",
            role: "user"
        })

   // console.log(ress.body)


    const resss = await api.post('/users/login')
        .send({
            email: "manju456@gmail.com",
            password: "manju123"
        })
   // console.log(resss.body)
    usertoken = resss.body.token


    let data = await api.post('/users/register')
        .send({
            fName: "Owner",
            lName: "owner",
            phoneNumber: "9800576062",
            email: "owner@gmail.com",
            password: "owner123",
            role: "owner"
        })

  //  console.log(data.body)

    const res = await api.post('/users/login')
        .send({
            email: "owner@gmail.com",
            password: "owner123"
        })
  //  console.log(res.body)
    ownertoken = res.body.token


})





afterAll(async () => await mongoose.connection.close())

test('loggedin owner can create  list of venues', async () => {
    const res = await api.post('/venues/')
        .set('authorization', `bearer ${ownertoken}`)
        .send({
            venueName: "Kimchi Banquet",
            established: "2000",
            location: "Anamnagar,ktm",
            advancePayment: "30000",
            spacePreference: "outdoor",
            venueType: "party place",
            contactNumber: "9800562072",
            venueHallCapacity: "800",
            perPlate: "800"
        })
        .expect(201)
    // console.log(res.body)
})




test('loggedin user can get  list of venues', async () => {
    const res = await api.get('/venues/')
        .set('authorization', `bearer ${usertoken}`)

        .expect(200)
    console.log(res.body)
})


test('loggedin user can book venues', async () => {
    const venue = await Venue.create({
        venueName: "manisha banquet",
        established: "2000",
        location: "Anamnagar,ktm",
        advancePayment: "30000",
        spacePreference: "outdoor",
        venueType: "party place",
        contactNumber: "9800562072",
        venueHallCapacity: "800",
        perPlate: "800"
    });
 //   console.log(venue.body)
    const bookingData = {
        date: "2024/03/4",
        time: "5PM"
    };

    const res = await api.post(`/bookings/${venue._id}/`)
        .set('authorization', `bearer ${usertoken}`)
        .send(bookingData)
        .expect(200)
  //  console.log(res.body)
})


test('get all bookings for all venues', async () => {
    const res = await api.get('/bookings/')
        .set('authorization', `bearer ${ownertoken}`)
        .expect(200);
  //  console.log(res.body);
});


test('update a booking', async () => {
    // Fetch a valid venue from the database
    const venue = await Venue.create({
        venueName: "Kimchi Banquet",
        established: "2000",
        location: "Anamnagar,ktm",
        advancePayment: "30000",
        spacePreference: "outdoor",
        venueType: "party place",
        contactNumber: "9800562072",
        venueHallCapacity: "800",
        perPlate: "800"
    });

    // Create a booking to update
    const booking = await Booking.create({
        time: "5PM",
        date: "2024/03/04",
        contactNumber: "9876543210",
        user: "user_id_here",
        venue: venue._id, // Use the ObjectId of the fetched venue
        fullName: "John Doe"
    });

    const updatedData = {
        time: "6PM",
        date: "2024/03/05",
        contactNumber: "9876543210",
    };

    const res = await api.put(`/bookings/${booking._id}`)
        .set('authorization', `bearer ${ownertoken}`)
        .send(updatedData)
        .expect(200);

   // console.log(res.body);
});


test('get a specific booking', async () => {
    // Fetch a valid venue from the database
    const venue = await Venue.create({
        venueName: "Kimchi Banquet",
        established: "2000",
        location: "Anamnagar,ktm",
        advancePayment: "30000",
        spacePreference: "outdoor",
        venueType: "party place",
        contactNumber: "9800562072",
        venueHallCapacity: "800",
        perPlate: "800"
    });

    // Create a booking to fetch
    const booking = await Booking.create({
        time: "5PM",
        date: "2024/03/04",
        contactNumber: "9876543210",
        user: "user_id_here",
        venue: venue._id, // Use the ObjectId of the fetched venue
        fullName: "John Doe"
    });

    const res = await api.get(`/bookings/${booking._id}`)
        .set('authorization', `bearer ${ownertoken}`)
        .expect(200);

   // console.log(res.body);
});




test('delete a specific booking', async () => {
    // Fetch a valid venue from the database
    const venue = await Venue.create({
        venueName: "Kimchi Banquet",
        established: "2000",
        location: "Anamnagar,ktm",
        advancePayment: "30000",
        spacePreference: "outdoor",
        venueType: "party place",
        contactNumber: "9800562072",
        venueHallCapacity: "800",
        perPlate: "800"
    });

    // Create a booking to delete
    const booking = await Booking.create({
        time: "5PM",
        date: "2024/03/04",
        contactNumber: "9876543210",
        user: "user_id_here",
        venue: venue._id, // Use the ObjectId of the fetched venue
        fullName: "John Doe"
    });

    const res = await api.delete(`/bookings/${booking._id}`)
        .set('authorization', `bearer ${ownertoken}`)
        .expect(200);

    console.log(res.body);
});


test('get all bookings made by a specific user', async () => {
    const res = await api.get('/bookings/allbookings')
        .set('authorization', `bearer ${usertoken}`)
        .expect(200);

    console.log(res.body);
});

test('handle invalid routes for specific bookings', async () => {
    const invalidRoutes = [
        `/bookings/:booking_id`, // PUT route
        `/bookings/:booking_id`, // DELETE route
        `/bookings/:booking_id`, // POST route
    ];

    for (const route of invalidRoutes) {
        try {
            const res = await api.put(route)
                .set('authorization', `bearer ${ownertoken}`)
                .expect(405);
            console.log(res.body);
        } catch (err) {
           // console.error('Error:', err);
        }
    }
});

it('should respond with a 404 status and error message if booking is not found', async () => {
    const req = {
        params: {
            booking_id: 'valid_booking_id_here',
        },
    };

    const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
    };

    // Mocking the Booking.findById function to return null (booking not found)
    sinon.stub(Booking, 'findById').resolves(null);

    // Call the controller function
    await bookingVenueController.getBookingVenueById(req, res);

    // Check if the appropriate functions were called with the expected arguments
    sinon.assert.calledWith(res.status, 404);
    sinon.assert.calledWith(res.json, { error: 'Booking not found' });
});


afterEach(() => {
    // Restore the original method after each test
    sinon.restore();
});


it('should respond with a 404 status and error message if booking is not found', async () => {
    const req = {
        params: {
            booking_id: 'invalid_booking_id_here', // An ID that doesn't exist in the database
        },
    };

    const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
    };

    // Mocking the Booking.findById function to return a resolved promise with null value
    sinon.stub(Booking, 'findById').resolves(null);

    // Call the controller function
    await bookingVenueController.getBookingVenueById(req, res);

    // Check if the appropriate functions were called with the expected arguments
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ error: 'Booking not found' })).to.be.true;
});


// it('should respond with a 500 status and error message if an error occurs while fetching booking', async () => {
//     const req = {
//       params: {
//         booking_id: 'valid_booking_id_here',
//       },
//     };

//     const res = {
//       status: sinon.spy(),
//       json: sinon.spy(),
//     };

//     const expectedErrorMessage = 'An error occurred while fetching booking';

//     // Mocking the Booking.findById function to return a rejected promise
//     sinon.stub(Booking, 'findById').rejects(new Error(expectedErrorMessage));

//     // Call the controller function
//     await bookingVenueController.getBookingVenueById(req, res);

//     // Check if the appropriate functions were called with the expected arguments
//     expect(res.status).to.have.been.called.with(500);
//     expect(res.json).to.have.been.called.with({ error: expectedErrorMessage });

//     // Restore the stubs to their original implementations
//     Booking.findById.restore();
//   });


it('should respond with a 404 status and error message if booking is not found', async () => {
    const req = {
      params: {
        booking_id: 'invalid_booking_id_here',
      },
    };

    const res = {
      status: sandbox.spy(() => res),
      json: sandbox.spy(),
    };

    // Mocking the Booking.findByIdAndDelete function to return null (booking not found)
    sandbox.stub(Booking, 'findByIdAndDelete').resolves(null);

    // Call the controller function
    await bookingVenueController.deleteBookingVenueById(req, res);

    // Check if the appropriate functions were called with the expected arguments
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ error: "Booking not found" })).to.be.true;
  });



  
//   it('should call the next function with an error if Booking.find rejects', async () => {
//     const req = {
//       user: {
//         id: 'valid_user_id_here',
//       },
//     };

//     const res = {
//       json: sinon.stub(),
//     };

//     const next = sinon.spy();

//     // Mocking the Booking.find function to reject with an error
//     sinon.stub(Booking, 'find').rejects(new Error('Database error'));

//     // Call the controller function
//     await bookingVenueController.getAllBookings(req, res, next);

//     // Check if the json function was not called with any arguments
//     sinon.assert.notCalled(res.json);

//     // Check if the next function was called with an error
//     sinon.assert.calledWithMatch(next, sinon.match.instanceOf(Error));
//   });


// afterEach(() => {
//     sinon.restore();
//   });

//   it('should respond with 405 status and error message for PUT requests', async () => {
//     const response = await chai.request(app).put('/booking');
//     expect(response).to.have.status(405);
//     expect(response.body).to.deep.equal({ error: "PUT request is not allowed" });
//   });