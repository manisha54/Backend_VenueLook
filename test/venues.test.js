const supertest = require('supertest')
const request = require('supertest');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = require('../app')
const Venue = require('../models/Venue')
const User = require('../models/User')
const { default: mongoose } = require('mongoose')
const fs = require('fs');
const path = require('path');
const upload = require('../middleware/upload'); // Replace with the correct path to the upload middleware
// Increase the timeout for the test to 10 seconds (adjust as needed)
jest.setTimeout(10000);

const { fileFilter } = require('../middleware/upload'); // Import the fileFilter function


const MONGODB_URL = 'mongodb://localhost:27017/test-db';


const api = supertest(app)
let usertoken = ''
let ownertoken = ''
let venue_id = ''
let review_id = ''



beforeAll(async () => {
    await Venue.deleteMany()
    await User.deleteMany()

    const ress = await api.post('/users/register')
        .send({
            fName: "Manju",
            lName: "Tharu",
            phoneNumber: "9800576062",
            email: "manju456@gmail.com",
            password: "manju123",
            role: "user"
        })

    //console.log(ress.body)


    const resss = await api.post('/users/login')
        .send({
            email: "manju456@gmail.com",
            password: "manju123"
        })
    //   console.log(resss.body)
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
    console.log(res.body)
    ownertoken = res.body.token
    // Create a venue for testing
    const venue = await Venue.create({
        venueName: "Test Venue",
        established: "2000",
        location: "Test Location",
        advancePayment: "30000",
        spacePreference: "outdoor",
        venueType: "party place",
        contactNumber: "9800562072",
        venueHallCapacity: "800",
        perPlate: "800",
    });
    venue_id = venue._id;

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
            perPlate: "500",
        })
        .expect(201)
    //console.log(res.body)
})




test('loggedin user cannot create  list of venues', async () => {
    const res = await api.post('/venues/')
        .set('authorization', `bearer ${usertoken}`)
        .send({
            venueName: "Kimchi Banquet",
            established: "2000",
            location: "Anamnagar,ktm",
            advancePayment: "30000",
            spacePreference: "outdoor",
            venueType: "party place",
            contactNumber: "9800562072",
            venueHallCapacity: "800",
            perPlate: "800",
        })
        .expect(403)
    // console.log(res.body)
    expect(res.body.error).toMatch(/you are not owner!/)
})

test('loggedin user can view list of venue', async () => {
    const response = await api.get('/venues')
        .set('authorization', `bearer ${usertoken}`)
        .expect(200);

    // console.log(response.body);

    const venues = response.body.data;
    const expectedVenueName = 'Kimchi Banquet';
    // Check if the venues array contains a venue with the expected name
    const foundVenue = venues.some((venue) => venue.venueName === expectedVenueName);

    expect(foundVenue).toBe(true);
});



test('loggedin user can get venue by id', async () => {
    const res = await api.get(`/venues/${venue_id}`)
        .set('authorization', `bearer ${usertoken}`)
        .expect(200)

    //  console.log(res.body)
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.venueName).toBe(venue_id.venueName);
})




// Test the updateVenueById controller function
test('loggedin owner can update a venue', async () => {
    const response = await api.put(`/venues/${venue_id}`)
        .set('authorization', `bearer ${ownertoken}`)
        .send({
            venueName: "Updated Test Venue",
            established: "2000",
            location: "Test Location",
            advancePayment: "30000",
            spacePreference: "outdoor",
            venueType: "party place",
            contactNumber: "9800562072",
            venueHallCapacity: "800",
            perPlate: "800",
        })
        .expect(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.venueName).toBe('Updated Test Venue');
});


// Test the updateVenueById controller function for a non-owner user (should fail with 403)
test('non-owner user cannot update a venue', async () => {
    const response = await api.put(`/venues/${venue_id}`)
        .set('authorization', `bearer ${usertoken}`)
        .send({
            venueName: "Updated Test Venue",
            established: "2000",
            location: "Test Location",
            advancePayment: "30000",
            spacePreference: "outdoor",
            venueType: "party place",
            contactNumber: "9800562072",
            venueHallCapacity: "800",
            perPlate: "800",
        })
        .expect(403);
    expect(response.body.error).toBe('you are not owner!');
});

// Test the deleteVenueById controller function
test('loggedin owner can delete a venue', async () => {
    const response = await api.delete(`/venues/${venue_id}`)
        .set('authorization', `bearer ${ownertoken}`)
        .expect(204);
});


// Test the deleteVenueById controller function for a non-owner user (should fail with 403)
test('non-owner user cannot delete a venue', async () => {
    const response = await api.delete(`/venues/${venue_id}`)
        .set('authorization', `bearer ${usertoken}`)
        .expect(403);
    expect(response.body.error).toBe('you are not owner!');
});


test('should update a venue by ID', async () => {
    // Create a test venue in the database
    const venue = await Venue.create({
        venueName: 'Old Venue',
        established: '1995',
        location: 'Old Location',
        advancePayment: '15000',
        spacePreference: 'indoor',
        venueType: 'hotel',
        contactNumber: '9800562076',
        venueHallCapacity: '300',
        perPlate: '400',
    });

    const updatedVenue = {
        venueName: 'Updated Venue',
        location: 'Updated Location',
        venueType: 'banquet hall',
    };

    // Update the created venue by ID using the API
    const response = await api
        .put(`/venues/${venue._id}`)
        .set('Authorization', `Bearer ${ownertoken}`) // Use the valid owner token here
        .send(updatedVenue)
        .expect(200);

    // Expect the response to contain the updated venue data
    expect(response.body.success).toBe(true);
    expect(response.body.data.venueName).toBe(updatedVenue.venueName);
    expect(response.body.data.location).toBe(updatedVenue.location);
    expect(response.body.data.venueType).toBe(updatedVenue.venueType);

    // Fetch the updated venue from the database
    const updatedVenueFromDB = await Venue.findById(venue._id);

    // Expect the database record to match the updatedVenue data
    expect(updatedVenueFromDB).toMatchObject(updatedVenue);
});



test('should delete a venue by ID', async () => {
    // Create a test venue in the database
    const venue = await Venue.create({
        venueName: 'Test Venue',
        established: '2000',
        location: 'Test Location',
        advancePayment: '20000',
        spacePreference: 'outdoor',
        venueType: 'party place',
        contactNumber: '9800562072',
        venueHallCapacity: '500',
        perPlate: '700',
    });

    // Delete the created venue by ID using the API
    await api
        .delete(`/venues/${venue._id}`)
        .set('Authorization', `Bearer ${ownertoken}`) // Use the valid owner token here
        .expect(204);

    // Fetch the deleted venue from the database
    const deletedVenueFromDB = await Venue.findById(venue._id);

    // Expect the deletedVenueFromDB to be null since the venue should be deleted
    expect(deletedVenueFromDB).toBeNull();
});




test('should upload a photo', async () => {
    // Provide the correct path to the test photo
    const testPhotoPath = path.join(__dirname, 'test_photo.jpg');

    // Read the test photo from the correct path
    const testPhoto = fs.readFileSync(testPhotoPath);

    // Make a request to the endpoint with the test photo
    const response = await api
        .post('/upload')
        .attach('photo', testPhoto, 'test_photo.jpg')
        .expect(200);

    // Assert that the response contains the uploaded photo filename
    expect(response.body.data).toMatch(/^photo[a-z0-9-]+\.(jpg|png|jpeg)$/);
});
// Updated test case
test('should call the callback with an error if the file extension is not jpg, png, or jpeg', () => {
    const mockCb = jest.fn(); // Create a mock callback function
    const mockFile = {
      originalname: 'test_file.txt', // File with invalid extension
    };
  
    // Call the fileFilter function with the mock arguments
    fileFilter(null, mockFile, mockCb);
  
    // Expect the mock callback to have been called with an error and false
    expect(mockCb).toHaveBeenCalledWith(new Error('only jpg, png and jepg are allowed'), false);
  });
  

  it('should return "testing" as response', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('testing');
  });

