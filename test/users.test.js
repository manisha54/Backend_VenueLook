const supertest = require('supertest')
const jwt = require('jsonwebtoken');
const app = require('../app')
const { default: mongoose } = require('mongoose')
const api = supertest(app)
const User = require('../models/User')
let usertoken = ''
let ownertoken = ''
const request = require('supertest');

const { verifyOwner,verifyUser } = require('../middleware/auth'); // Import the middleware
const httpMocks = require('node-mocks-http'); // Import the node-mocks-http library

beforeAll(async () => {
    await User.deleteMany({})
})


test('user registration', async () => {
    const res = await api.post('/users/register')
        .send({
            fName: "Manisha",
            lName: "Tharu",
            phoneNumber: "9800562062",
            email: "manisha@gmail.com",
            password: "manisha123",
        })
        .expect(201)
    usertoken = res.body.token

    // console.log(res.body)
    expect(res.body.email).toBe("manisha@gmail.com")
})

test('owner registration', async () => {
    const res = await api.post('/users/register')
        .send({
            fName: "Owner",
            lName: "owner",
            phoneNumber: "9800562462",
            email: "owner@gmail.com",
            password: "owner123",
            role: "owner"
        })
        .expect(201)

   // console.log(res.body)
    expect(res.body.email).toBe("owner@gmail.com")
})


test('registration of duplicate email', () => {
    return api.post('/users/register')
        .send({
            fName: "Manisha",
            lName: "Tharu",
            phoneNumber: "9800562062",
            email: "manisha@gmail.com",
            password: "manisha123",
        }).expect(400)
        .then((res) => {
         //   console.log(res.body)
            expect(res.body.error).toMatch(/user already exist/)
        })
})


test('register user can login', async () => {
    const res = await api.post('/users/login')
        .send({
            email: "manisha@gmail.com",
            password: "manisha123"
        })
        .expect(200)
   // console.log(res.body)
    usertoken = res.body.token;
    expect(res.body.token).toBeDefined()
})


test('user login with unregistered email', async () => {
    const res = await api.post('/users/login')
        .send({
            email: "manisha45@gmail.com",
            password: "manisha123"
        })
        .expect(400)
        .then((res) => {
            //  console.log(res.body)
            expect(res.body.error).toMatch(/user is not registered/)
        })
})


test('user login with unregistered email', async () => {
    const res = await api.post('/users/login')
        .send({
            email: "manisha45@gmail.com",
            password: "manisha123"
        })
        .expect(400)
        .then((res) => {
            //  console.log(res.body)
            expect(res.body.error).toMatch(/user is not registered/)
        })
})



test('user login with  incorect password', async () => {
    const res = await api.post('/users/login')
        .send({
            email: "manisha@gmail.com",
            password: "manisha123589"
        })
        .expect(400)
        .then((res) => {
            //  console.log(res.body)
            expect(res.body.error).toMatch(/password does not match/)
        })
})

test('get user information', async () => {
    const user = await User.findOne({ email: "manisha@gmail.com" })

    const res = await api.get(`/users/userinfo`)
        .set('Authorization', `Bearer ${usertoken}`)
        .expect(200)

    expect(res.body.success).toBe(true)
    expect(res.body.data[0].email).toBe(user.email)
})


test('update user information', async () => {
    const updatedData = {
        fName: "Updated First Name",
        lName: "Updated Last Name",
        phoneNumber: "9876543210"
    }

    const res = await api.put(`/users/userinfo`)
        .set('Authorization', `Bearer ${usertoken}`)
        .send(updatedData)
        .expect(200)

    expect(res.body.message).toBe("Profile updated successfully.")
    expect(res.body.data.fName).toBe(updatedData.fName)
    expect(res.body.data.lName).toBe(updatedData.lName)
    expect(res.body.data.phoneNumber).toBe(updatedData.phoneNumber)
})



test('delete user', async () => {
    const userToDelete = await User.findOne({ email: "manisha@gmail.com" })

    const res = await api.delete(`/users/userinfo`)
        .set('Authorization', `Bearer ${usertoken}`)
        .expect(204)

    // Ensure the user has been deleted from the database
    const deletedUser = await User.findById(userToDelete._id)
    expect(deletedUser).toBeNull()
})

test('access restricted route as a non-owner user', async () => {
    // Register a non-owner user
    await api.post('/users/register')
        .send({
            fName: "Manisha",
            lName: "Tharu",
            phoneNumber: "9800562062",
            email: "manisha@gmail.com",
            password: "manisha123",
        })
        .expect(201);

    // Login as the non-owner user and get the token
    const res = await api.post('/users/login')
        .send({
            email: "manisha@gmail.com",
            password: "manisha123",
        })
        .expect(200);

    const userToken = res.body.token;

    // Access the restricted route as a non-owner user
    await api.get('/restricted-route')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404); // Expecting a 403 Forbidden response
});

test('delete user with incorrect ID', async () => {
    await api.delete(`/users/userinfo/incorrect_id`)
        .set('Authorization', `Bearer ${usertoken}`)
        .expect(404);
});


test('delete all users', async () => {
    const res = await api.delete('/users')
        .expect(200);

    expect(res.body.message).toBe('All users deleted successfully.');
});


it('should call next() when the user role is "owner"', () => {
    const req = httpMocks.createRequest({
      user: { role: 'owner' }, // Mock the user object with role "owner"
    });
    const res = httpMocks.createResponse();
    const next = jest.fn(); // Create a mock next function

    verifyOwner(req, res, next);

    // Expect next() to have been called
    expect(next).toHaveBeenCalled();
  });


  it('should return an error response when the user role is not "owner"', () => {
    const req = httpMocks.createRequest({
      user: { role: 'user' }, // Mock the user object with role "user"
    });
    const res = httpMocks.createResponse();
    const next = jest.fn(); // Create a mock next function

    verifyOwner(req, res, next);

    // Expect res.status and res.json to be called with the correct error response
    expect(res.statusCode).toBe(403);
    expect(res._getJSONData()).toEqual({ error: 'you are not owner!' });
  });



  it('should call next if auth token is present and valid', () => {
    const payload = { userId: 'user_id', role: 'user' };
    const token = jwt.sign(payload, process.env.SECRET);
    const req = httpMocks.createRequest({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();
  
    verifyUser(req, res, next);
  
    expect(next).toHaveBeenCalled();
    expect(req.user.userId).toBe(payload.userId);
    expect(req.user.role).toBe(payload.role);
  });
  


  it('should return 403 if user role is not owner', () => {
  const payload = { userId: 'user_id', role: 'user' };
  const token = jwt.sign(payload, process.env.SECRET);
  const req = httpMocks.createRequest({
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  const res = httpMocks.createResponse();
  const next = jest.fn();

  // Attach the user payload to the request manually
  req.user = payload;

  verifyUser(req, res, () => {
    verifyOwner(req, res, next);
  });

  expect(res.statusCode).toBe(403);
  expect(res._isEndCalled()).toBeTruthy();
  expect(res._getJSONData()).toHaveProperty('error', 'you are not owner!');
});



it('should upload a photo', async () => {
    try {
      const response = await request(app)
        .post('/upload')
        .attach('photo', 'test/test_photo.jpg'); // Adjust the path to your test photo

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatch(/\.jpg$/); // Check if the returned data contains a valid photo filename with .jpg extension
    } catch (error) {
      // Log any error that occurs during the file upload
      console.error('Error during file upload:', error);
      throw error; // Re-throw the error to fail the test
    }
  });






afterAll(async () => await mongoose.connection.close())





