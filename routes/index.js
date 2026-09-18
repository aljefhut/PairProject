const express = require('express');
const router = express.Router();
const Controller = require('../controllers/controller');

// Middleware Authentication
const isLoggedIn = (req, res, next) => {
  if (!req.session.user) return res.redirect('/login');
  next();
};

const isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'Admin') {
    return res.redirect('/destinations');
  }
  next();
};

// Public Routes
router.get('/', Controller.landing);
router.get('/register', Controller.registerForm);
router.post('/register', Controller.postRegister);
router.get('/login', Controller.loginForm);
router.post('/login', Controller.postLogin);
router.get('/logout', Controller.logout);

// Protected Routes (Must Login)
router.use(isLoggedIn);
router.get('/destinations', Controller.destinationList);
router.get('/bookings', Controller.bookingList);
router.post('/bookings', Controller.createBooking);

// Admin Only Routes
router.get('/destinations/add', isAdmin, Controller.addDestinationForm);
router.post('/destinations/add', isAdmin, Controller.postAddDestination);
router.get('/destinations/delete/:id', isAdmin, Controller.deleteDestination);

module.exports = router;