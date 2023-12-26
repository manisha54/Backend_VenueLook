const supertest = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Venue = require('../models/Venue');
const User = require('../models/User');

const api = supertest(app);
let usertoken = '';
let ownertoken = '';
let venue_id = '';
let review_id = '';

let venue;


beforeAll(async () => {
    await Venue.deleteMany();
    await User.deleteMany();

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
    //  console.log(resss.body)
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

    // console.log(data.body)

    const res = await api.post('/users/login')
        .send({
            email: "owner@gmail.com",
            password: "owner123"
        })
    console.log(res.body)
    ownertoken = res.body.token


    // Create a venue with a review
    const venue = await Venue.create({
        venueName: "manisha banquet",
        established: "2000",
        location: "Anamnagar,ktm",
        advancePayment: "30000",
        spacePreference: "outdoor",
        venueType: "party place",
        contactNumber: "9800562072",
        venueHallCapacity: "800",
        perPlate: "800",
        reviews: [
            {
                text: "This venue is amazing!",
            },
        ],
    });

    venue_id = venue.id;
});



afterAll(async () => {
    await mongoose.connection.close();
});

test('loggedin user can create a review for a venue', async () => {
    try {
        // Create a venue
        const venueResponse = await api.post('/venues')
            .set('Authorization', `Bearer ${ownertoken}`)
            .send({
                venueName: "manisha banquet",
                established: "2000",
                location: "Anamnagar,ktm",
                advancePayment: "30000",
                spacePreference: "outdoor",
                venueType: "party place",
                contactNumber: "9800562072",
                venueHallCapacity: "800",
                perPlate: "800",
            });

        // console.log(venueResponse.body); // Log the venueResponse.body to check its contents

        expect(venueResponse.status).toBe(201);
        expect(venueResponse.body.data[0].id).toBeDefined(); // Change _id to id here

        // Check if id is defined before proceeding
        if (venueResponse.body.data[0].id) {
            const reviewData = {
                text: 'This venue is amazing!', // Replace with the review text you want to add
            };

            const res = await api.post(`/venues/${venueResponse.body.data[0].id}/reviews`)
                .set('Authorization', `Bearer ${usertoken}`)
                .send(reviewData);

            expect(res.status).toBe(201);
            expect(res.body.text).toBe(reviewData.text);
            expect(res.body).toHaveProperty('user');
            expect(res.body).toHaveProperty('userName');
            // Add more assertions as needed based on your application's review response

            // Clean up the created review for subsequent tests (optional)
            const reviewId = res.body._id;
            await api.delete(`/venues/${venueResponse.body.data[0].id}/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${usertoken}`);
        } else {
            // Log an error or fail the test if id is not defined
            console.error('venue_id is undefined in venueResponse');
            expect(venueResponse.body.data[0].id).toBeDefined();
        }
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
});

test('should get all reviews for a venue', async () => {
    try {
        // Create a venue
        const venueResponse = await api.post('/venues')
            .set('Authorization', `Bearer ${ownertoken}`)
            .send({
                venueName: "manisha banquet",
                established: "2000",
                location: "Anamnagar,ktm",
                advancePayment: "30000",
                spacePreference: "outdoor",
                venueType: "party place",
                contactNumber: "9800562072",
                venueHallCapacity: "800",
                perPlate: "800",
            });

        expect(venueResponse.status).toBe(201);
        expect(venueResponse.body.data[0].id).toBeDefined();

        const venueId = venueResponse.body.data[0].id;

        // Create a review for the venue
        const reviewData = {
            text: 'This venue is amazing!',
        };

        const reviewResponse = await api.post(`/venues/${venueId}/reviews`)
            .set('Authorization', `Bearer ${usertoken}`)
            .send(reviewData);

        expect(reviewResponse.status).toBe(201);
        expect(reviewResponse.body.text).toBe(reviewData.text);
        expect(reviewResponse.body).toHaveProperty('user');
        expect(reviewResponse.body).toHaveProperty('userName');

        // Fetch all reviews for the venue
        const getAllReviewsResponse = await api.get(`/venues/${venueId}/reviews`)
            .set('Authorization', `Bearer ${ownertoken}`)
            .expect(200);

        // Assuming the response contains the reviews array
        expect(getAllReviewsResponse.body).toHaveLength(1);
        expect(getAllReviewsResponse.body[0].text).toBe(reviewData.text);
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
});




test('should get a single review for a venue', async () => {
    try {
        // Create a venue
        const venueResponse = await api.post('/venues')
            .set('Authorization', `Bearer ${ownertoken}`)
            .send({
                venueName: "manisha banquet",
                established: "2000",
                location: "Anamnagar,ktm",
                advancePayment: "30000",
                spacePreference: "outdoor",
                venueType: "party place",
                contactNumber: "9800562072",
                venueHallCapacity: "800",
                perPlate: "800",
            });

        expect(venueResponse.status).toBe(201);
        expect(venueResponse.body.data[0].id).toBeDefined();

        const venueId = venueResponse.body.data[0].id;

        // Create a review for the venue
        const reviewData = {
            text: 'This venue is amazing!',
        };

        const reviewResponse = await api.post(`/venues/${venueId}/reviews`)
            .set('Authorization', `Bearer ${usertoken}`)
            .send(reviewData);

        expect(reviewResponse.status).toBe(201);
        expect(reviewResponse.body.text).toBe(reviewData.text);
        expect(reviewResponse.body).toHaveProperty('user');
        expect(reviewResponse.body).toHaveProperty('userName');

        const reviewId = reviewResponse.body.id;

        // Fetch the single review for the venue
        const getSingleReviewResponse = await api.get(`/venues/${venueId}/reviews/${reviewId}`)
            .set('Authorization', `Bearer ${ownertoken}`)
            .expect(200);

        // Assuming the response contains the review data
        expect(getSingleReviewResponse.body.text).toBe(reviewData.text);
        expect(getSingleReviewResponse.body.id).toBe(reviewId);
        // Add more assertions as needed based on your application's review response
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
});



test('should update a review for a venue', async () => {
    try {
        // Create a venue
        const venueResponse = await api.post('/venues')
            .set('Authorization', `Bearer ${ownertoken}`)
            .send({
                venueName: "manisha banquet",
                established: "2000",
                location: "Anamnagar,ktm",
                advancePayment: "30000",
                spacePreference: "outdoor",
                venueType: "party place",
                contactNumber: "9800562072",
                venueHallCapacity: "800",
                perPlate: "800",
            });

        expect(venueResponse.status).toBe(201);
        expect(venueResponse.body.data[0].id).toBeDefined();

        const venueId = venueResponse.body.data[0].id;

        // Create a review for the venue
        const reviewData = {
            text: 'This venue is amazing!',
        };

        const reviewResponse = await api.post(`/venues/${venueId}/reviews`)
            .set('Authorization', `Bearer ${usertoken}`)
            .send(reviewData);

        expect(reviewResponse.status).toBe(201);
        expect(reviewResponse.body.text).toBe(reviewData.text);
        expect(reviewResponse.body).toHaveProperty('user');
        expect(reviewResponse.body).toHaveProperty('userName');

        const reviewId = reviewResponse.body.id;

        // Update the review for the venue
        const updatedReviewData = {
            text: 'This venue is even more amazing now!',
        };

        const updatedReviewResponse = await api.put(`/venues/${venueId}/reviews/${reviewId}`)
            .set('Authorization', `Bearer ${usertoken}`)
            .send(updatedReviewData)
            .expect(200);

        expect(updatedReviewResponse.body.text).toBe(updatedReviewData.text);
        // Add more assertions as needed based on your application's updated review response
    } catch (error) {
        //  console.error('An error occurred:', error);
        throw error;
    }
});


test('should get all reviews for a venue', async () => {
    try {
        // Create a venue
        const venueResponse = await api.post('/venues')
            .set('Authorization', `Bearer ${ownertoken}`)
            .send({
                venueName: "manisha banquet",
                established: "2000",
                location: "Anamnagar,ktm",
                advancePayment: "30000",
                spacePreference: "outdoor",
                venueType: "party place",
                contactNumber: "9800562072",
                venueHallCapacity: "800",
                perPlate: "800",
            });

        expect(venueResponse.status).toBe(201);
        expect(venueResponse.body.data[0].id).toBeDefined();

        // Check if id is defined before proceeding
        if (venueResponse.body.data[0].id) {
            // Create a review for the venue
            const reviewData = {
                text: 'This venue is amazing!', // Replace with the review text you want to add
            };

            const res = await api.post(`/venues/${venueResponse.body.data[0].id}/reviews`)
                .set('Authorization', `Bearer ${usertoken}`)
                .send(reviewData);

            expect(res.status).toBe(201);
            expect(res.body.text).toBe(reviewData.text);
            expect(res.body).toHaveProperty('user');
            expect(res.body).toHaveProperty('userName');

            // Get all reviews for the venue
            const getAllReviewsResponse = await api.get(`/venues/${venueResponse.body.data[0].id}/reviews`)
                .set('Authorization', `Bearer ${usertoken}`) // Set the authorization header

                .expect(200);

            // Assuming the response contains the reviews array
            expect(getAllReviewsResponse.body).toHaveLength(1);
            expect(getAllReviewsResponse.body[0].text).toBe(reviewData.text);

            // Clean up the created review for subsequent tests (optional)
            const reviewId = res.body._id;
            await api.delete(`/venues/${venueResponse.body.data[0].id}/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${usertoken}`);
        } else {
            // Log an error or fail the test if id is not defined
            console.error('venue_id is undefined in venueResponse');
            expect(venueResponse.body.data[0].id).toBeDefined();
        }
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }

});


test('should delete a review for a venue', async () => {
    try {
        // Create a venue
        const venueResponse = await api.post('/venues')
            .set('Authorization', `Bearer ${ownertoken}`)
            .send({
                venueName: "manisha banquet",
                established: "2000",
                location: "Anamnagar,ktm",
                advancePayment: "30000",
                spacePreference: "outdoor",
                venueType: "party place",
                contactNumber: "9800562072",
                venueHallCapacity: "800",
                perPlate: "800",
            });

        expect(venueResponse.status).toBe(201);
        expect(venueResponse.body.data[0].id).toBeDefined();

        // Check if id is defined before proceeding
        if (venueResponse.body.data[0].id) {
            // Create a review for the venue
            const reviewData = {
                text: 'This venue is amazing!', // Replace with the review text you want to add
            };

            const res = await api.post(`/venues/${venueResponse.body.data[0].id}/reviews`)
                .set('Authorization', `Bearer ${usertoken}`)
                .send(reviewData);

            expect(res.status).toBe(201);
            expect(res.body.text).toBe(reviewData.text);
            expect(res.body).toHaveProperty('user');
            expect(res.body).toHaveProperty('userName');

            // Get the created review ID
            const reviewId = res.body._id;

            // Delete the review from the venue
            const deleteReviewResponse = await api.delete(`/venues/${venueResponse.body.data[0].id}/reviews/${reviewId}`)
                .set('Authorization', `Bearer ${ownertoken}`)
                .expect(204);

            expect(deleteReviewResponse.status).toBe(204);

            // Ensure the review is deleted from the venue's reviews array
            const updatedVenue = await Venue.findById(venueResponse.body.data[0].id);
            const deletedReview = updatedVenue.reviews.find(review => review._id.toString() === reviewId);
            expect(deletedReview).toBeUndefined();

        }
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
});


test('should return 403 if user is not authorized to edit the review', async () => {
    try {
        // Create a venue
        const venueResponse = await api.post('/venues')
            .set('Authorization', `Bearer ${ownertoken}`)
            .send({
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

        expect(venueResponse.status).toBe(201);
        const venueId = venueResponse.body.data[0].id;

        // Create a review for the venue
        const reviewResponse = await api.post(`/venues/${venueId}/reviews`)
            .set('Authorization', `Bearer ${usertoken}`)
            .send({
                text: 'Initial review',
            });

        expect(reviewResponse.status).toBe(201);
        const reviewId = reviewResponse.body.id; // Use "id" instead of "_id" here

        // Create a new user and get their token
        const newUserResponse = await api.post('/users/register')
            .send({
                fName: "New",
                lName: "User",
                phoneNumber: "9876543210",
                email: "newuser@example.com",
                password: "newuser123",
                role: "user"
            });

        const unauthorizedUserResponse = await api.post('/users/login')
            .send({
                email: "newuser@example.com",
                password: "newuser123"
            });

        const unauthorizedUserToken = unauthorizedUserResponse.body.token;

        // Try updating the review with the new user's token
        const response = await api.put(`/venues/${venueId}/reviews/${reviewId}`)
            .set('Authorization', `Bearer ${unauthorizedUserToken}`)
            .send({
                text: 'Updated review text',
            })
            .expect(403);

        expect(response.body).toEqual({ error: 'You are not authorized to edit this review' });
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
});


test('should return 404 if single review is not found', async () => {
    try {
      // Create a venue
      const venueResponse = await api.post('/venues')
        .set('Authorization', `Bearer ${ownertoken}`)
        .send({
          venueName: "manisha banquet",
          established: "2000",
          location: "Anamnagar,ktm",
          advancePayment: "30000",
          spacePreference: "outdoor",
          venueType: "party place",
          contactNumber: "9800562072",
          venueHallCapacity: "800",
          perPlate: "800",
        });
  
      expect(venueResponse.status).toBe(201);
      expect(venueResponse.body.data[0].id).toBeDefined();
  
      const venueId = venueResponse.body.data[0].id;
  
      // Fetch a single review that does not exist
      const getSingleReviewResponse = await api.get(`/venues/${venueId}/reviews/invalid_review_id`)
        .set('Authorization', `Bearer ${ownertoken}`)
        .expect(404);
  
      expect(getSingleReviewResponse.body).toEqual({ error: 'review not found' });
    } catch (error) {
      console.error('An error occurred:', error);
      throw error;
    }
  });